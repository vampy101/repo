import type { SfxName } from '../game/types';

/**
 * Everything is synthesised on the fly: rain is filtered noise, the city hum is
 * two detuned saws, and the "breathing" that rises with City Attention is an
 * LFO on a sub-bass sine. No files, nothing copyrighted, ~120 lines.
 */
export class Sfx {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private ambientGain: GainNode | null = null;
  private rainGain: GainNode | null = null;
  private humGain: GainNode | null = null;
  private breathGain: GainNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  muted = false;
  volume = 0.55;

  /** Must be called from a user gesture; browsers insist. */
  init(): void {
    if (this.ctx) {
      void this.ctx.resume();
      return;
    }
    const Ctor: typeof AudioContext | undefined =
      window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    try {
      this.ctx = new Ctor();
    } catch {
      return;
    }
    const ctx = this.ctx;
    this.master = ctx.createGain();
    this.master.gain.value = this.muted ? 0 : this.volume;
    this.master.connect(ctx.destination);

    // shared 2-second noise bed
    const len = ctx.sampleRate * 2;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02; // gently brown it
      data[i] = white * 0.6 + last * 2.2;
    }
    this.noiseBuffer = buf;

    this.ambientGain = ctx.createGain();
    this.ambientGain.gain.value = 1;
    this.ambientGain.connect(this.master);
    this.startAmbience();
  }

  private startAmbience(): void {
    const ctx = this.ctx;
    if (!ctx || !this.ambientGain || !this.noiseBuffer) return;

    // --- rain: band-passed noise with a slow amplitude wander
    const rain = ctx.createBufferSource();
    rain.buffer = this.noiseBuffer;
    rain.loop = true;
    const rainFilter = ctx.createBiquadFilter();
    rainFilter.type = 'bandpass';
    rainFilter.frequency.value = 2600;
    rainFilter.Q.value = 0.6;
    this.rainGain = ctx.createGain();
    this.rainGain.gain.value = 0.1;
    rain.connect(rainFilter).connect(this.rainGain).connect(this.ambientGain);
    rain.start();

    const wander = ctx.createOscillator();
    wander.frequency.value = 0.07;
    const wanderAmt = ctx.createGain();
    wanderAmt.gain.value = 0.03;
    wander.connect(wanderAmt).connect(this.rainGain.gain);
    wander.start();

    // --- electrical hum: mains-ish, deliberately slightly out of tune
    this.humGain = ctx.createGain();
    this.humGain.gain.value = 0.02;
    const humFilter = ctx.createBiquadFilter();
    humFilter.type = 'lowpass';
    humFilter.frequency.value = 400;
    this.humGain.connect(humFilter).connect(this.ambientGain);
    for (const f of [50, 100.6, 150.4]) {
      const o = ctx.createOscillator();
      o.type = 'sawtooth';
      o.frequency.value = f;
      const g = ctx.createGain();
      g.gain.value = f === 50 ? 0.5 : 0.16;
      o.connect(g).connect(this.humGain);
      o.start();
    }

    // --- the city breathing: sub sine, gated by a slow LFO
    this.breathGain = ctx.createGain();
    this.breathGain.gain.value = 0;
    this.breathGain.connect(this.ambientGain);
    const sub = ctx.createOscillator();
    sub.type = 'sine';
    sub.frequency.value = 38;
    const breathLfo = ctx.createOscillator();
    breathLfo.frequency.value = 0.16;
    const breathDepth = ctx.createGain();
    breathDepth.gain.value = 0.7;
    const breathVca = ctx.createGain();
    breathVca.gain.value = 0.3;
    breathLfo.connect(breathDepth).connect(breathVca.gain);
    sub.connect(breathVca).connect(this.breathGain);
    sub.start();
    breathLfo.start();
  }

  /** City Attention tier 1..5 drives the ambience. */
  setTier(tier: number): void {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const ramp = (node: GainNode | null, value: number) => {
      if (!node) return;
      node.gain.cancelScheduledValues(t);
      node.gain.setTargetAtTime(value, t, 1.4);
    };
    ramp(this.humGain, 0.02 + (tier - 1) * 0.016);
    ramp(this.breathGain, tier <= 1 ? 0 : (tier - 1) * 0.075);
    ramp(this.rainGain, 0.1 + (tier - 1) * 0.012);
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(muted ? 0 : this.volume, this.ctx.currentTime, 0.05);
    }
  }

  setVolume(v: number): void {
    this.volume = Math.max(0, Math.min(1, v));
    if (!this.muted) this.setMuted(false);
  }

  play(name: SfxName): void {
    const ctx = this.ctx;
    const out = this.master;
    if (!ctx || !out || this.muted) return;
    const t = ctx.currentTime;

    const blip = (
      freq: number,
      dur: number,
      type: OscillatorType,
      gain: number,
      slideTo?: number,
    ) => {
      const o = ctx.createOscillator();
      o.type = type;
      o.frequency.setValueAtTime(freq, t);
      if (slideTo !== undefined) o.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), t + dur);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(gain, t + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(out);
      o.start(t);
      o.stop(t + dur + 0.02);
    };

    const burst = (dur: number, freq: number, q: number, gain: number, type: BiquadFilterType = 'bandpass') => {
      if (!this.noiseBuffer) return;
      const s = ctx.createBufferSource();
      s.buffer = this.noiseBuffer;
      s.playbackRate.value = 1 + Math.random() * 0.2;
      const f = ctx.createBiquadFilter();
      f.type = type;
      f.frequency.value = freq;
      f.Q.value = q;
      const g = ctx.createGain();
      g.gain.setValueAtTime(gain, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      s.connect(f).connect(g).connect(out);
      s.start(t);
      s.stop(t + dur + 0.02);
    };

    switch (name) {
      case 'chirp':
        blip(880, 0.07, 'square', 0.12);
        blip(1320, 0.09, 'square', 0.09, 1600);
        break;
      case 'deny':
        blip(210, 0.16, 'square', 0.14, 120);
        blip(140, 0.22, 'sawtooth', 0.08, 90);
        break;
      case 'servo':
        blip(320, 0.3, 'triangle', 0.06, 240);
        burst(0.3, 1400, 3, 0.05);
        break;
      case 'door':
        burst(0.5, 220, 1.2, 0.3, 'lowpass');
        blip(90, 0.5, 'sawtooth', 0.1, 55);
        break;
      case 'clank':
        burst(0.16, 2200, 2.5, 0.22);
        blip(420, 0.1, 'square', 0.06, 180);
        break;
      case 'vend':
        blip(520, 0.06, 'square', 0.1);
        burst(0.24, 900, 1.5, 0.16);
        break;
      case 'pickup':
        blip(700, 0.06, 'triangle', 0.1, 1000);
        blip(1050, 0.1, 'triangle', 0.07, 1400);
        break;
      case 'xp':
        blip(1180, 0.05, 'square', 0.055, 1500);
        break;
      case 'alarm':
        blip(440, 0.6, 'sawtooth', 0.14, 300);
        blip(300, 0.6, 'square', 0.08, 440);
        break;
      case 'drone':
        blip(180, 0.22, 'triangle', 0.09, 260);
        blip(240, 0.14, 'sine', 0.06, 200);
        break;
      case 'hum-up':
        blip(60, 0.7, 'sine', 0.16, 44);
        burst(0.5, 300, 0.8, 0.06, 'lowpass');
        break;
    }
  }

  get ready(): boolean {
    return this.ctx !== null;
  }
}

export const sfx = new Sfx();
