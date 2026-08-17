import { ITEMS } from '../data/items';
import {
  AD_SLOGANS,
  COMBO_FAIL,
  EXAMINE,
  EXAMINE_AGAIN,
  GRAFFITI_REACT,
  GRAFFITI_TEXT,
  ITEM_FALLBACK,
  PURGE_LINES,
  TIER_BARKS,
  WHISPERS,
} from '../data/lines';
import { PURGE_RESET_ATTENTION, REASONS, isSaturated, tierOf, tierProfile } from './attention';
import { bannerText, isPartial, isSuccess, runCheck, type Mod } from './checks';
import { PROFILES, adjust } from './stats';
import type {
  CheckResult,
  CounterId,
  Effect,
  FlagId,
  GameState,
  HotspotId,
  ItemId,
  Line,
  Prompt,
  Reaction,
  SfxName,
  Speaker,
  Toast,
  ToastTone,
  WinPath,
} from './types';

/** Accumulates everything one player action produced. */
class Rx {
  lines: Line[] = [];
  toasts: Toast[] = [];
  effects: Effect[] = [];
  check?: CheckResult;
  prompt?: Prompt;
  refused = false;

  say(who: Speaker, text: string): this {
    this.lines.push({ who, text });
    return this;
  }
  mara(text: string): this {
    return this.say('MARA', text);
  }
  civic(text: string): this {
    return this.say('CIVIC', text);
  }
  drone(text: string): this {
    return this.say('SW-9', text);
  }
  term(text: string): this {
    return this.say('TERMINAL', text);
  }
  push(lines: Line[]): this {
    this.lines.push(...lines);
    return this;
  }
  toast(text: string, tone: ToastTone = 'good'): this {
    this.toasts.push({ text, tone });
    return this;
  }
  sfx(name: SfxName): this {
    this.effects.push({ kind: 'sfx', name });
    return this;
  }
  fx(e: Effect): this {
    this.effects.push(e);
    return this;
  }
  out(): Reaction {
    const r: Reaction = { lines: this.lines, toasts: this.toasts, effects: this.effects };
    if (this.check) r.check = this.check;
    if (this.prompt) r.prompt = this.prompt;
    if (this.refused) r.refused = true;
    return r;
  }
}

const XP = {
  examineUseful: 10,
  puddle: 15,
  strip: 15,
  badge: 25,
  droneAdvice: 10,
  droneRepair: 30,
  maintenance: 25,
  splice: 20,
  complaint: 15,
  bluffStep: 20,
  bluffWin: 25,
  graffiti: 10,
  civic: 40,
  ration: 5,
  enter: 50,
  learn: 10,
} as const;

const EXAMINE_XP: Partial<Record<HotspotId, number>> = {
  puddle: XP.puddle,
  terminal: XP.examineUseful,
  stencil: XP.examineUseful,
  drone: XP.examineUseful,
  vending: XP.examineUseful,
  grate: XP.examineUseful,
  dumpster: XP.examineUseful,
  camera: 5,
  conduit: 5,
};

export class Engine {
  state: GameState;
  private pending: Prompt | null = null;
  /** set by purge(), cleared at the start of every player action */
  private purgeFired = false;
  /** rotates ad slogans and whispers without any randomness the player can feel */
  private tick = 0;

  constructor(state: GameState) {
    this.state = state;
  }

  // ------------------------------------------------------------------ queries

  get s(): GameState {
    return this.state;
  }
  has(item: ItemId): boolean {
    return this.state.inventory.includes(item);
  }
  flag(f: FlagId): boolean {
    return this.state.flags[f] === true;
  }
  count(c: CounterId): number {
    return this.state.counters[c] ?? 0;
  }
  get tier(): number {
    return tierOf(this.state.stats.attention);
  }
  get tierInfo() {
    return tierProfile(this.state.stats.attention);
  }
  get finished(): boolean {
    return this.flag('entered');
  }
  get graffitiStage(): number {
    return Math.min(3, this.count('graffitiStage'));
  }
  get graffitiText(): string {
    return GRAFFITI_TEXT[this.graffitiStage];
  }
  /** true while the camera is parked in a maintenance loop and records nothing. */
  get cameraBlindByMaintenance(): boolean {
    return this.flag('terminalMaintenance');
  }
  isPromptOpen(id?: string): boolean {
    return this.pending !== null && (id === undefined || this.pending.id === id);
  }

  private set(f: FlagId, v = true): void {
    this.state.flags[f] = v;
  }
  private bump(c: CounterId, by = 1): number {
    this.state.counters[c] = (this.state.counters[c] ?? 0) + by;
    return this.state.counters[c];
  }
  private spend(id: string): void {
    if (!this.state.spent.includes(id)) this.state.spent.push(id);
  }
  private isSpent(id: string): boolean {
    return this.state.spent.includes(id);
  }

  // ------------------------------------------------------------- bookkeeping

  private xp(rx: Rx, amount: number, label: string): void {
    if (amount <= 0) return;
    adjust(this.state.stats, 'xp', amount);
    rx.toast(`+${amount} XP · ${label}`, 'good').sfx('xp');
  }

  private give(rx: Rx, item: ItemId): void {
    if (this.has(item)) return;
    this.state.inventory.push(item);
    rx.toast(`ACQUIRED · ${ITEMS[item].name}`, 'calm').sfx('pickup');
  }

  private take(item: ItemId): void {
    this.state.inventory = this.state.inventory.filter((i) => i !== item);
    if (this.state.selected === item) this.state.selected = null;
  }

  /** The only way attention ever moves. Handles tier barks and the purge. */
  raise(amount: number, reason: string, rx = new Rx()): Reaction {
    if (amount <= 0 || this.finished) return rx.out();
    const before = this.tier;
    const moved = adjust(this.state.stats, 'attention', amount);
    if (moved > 0) {
      rx.toast(`CITY ATTENTION +${moved} · ${reason}`, 'bad');
      rx.sfx('hum-up');
    }
    this.afterAttentionRise(rx, before);
    return rx.out();
  }

  lower(amount: number, reason: string, floor = 0, rx = new Rx()): Reaction {
    if (amount <= 0 || this.finished) return rx.out();
    const target = Math.max(floor, this.state.stats.attention - amount);
    const moved = target - this.state.stats.attention;
    if (moved < 0) {
      adjust(this.state.stats, 'attention', moved);
      rx.toast(`CITY ATTENTION ${moved} · ${reason}`, 'calm');
    }
    return rx.out();
  }

  private afterAttentionRise(rx: Rx, tierBefore: number): void {
    const now = this.tier;
    if (now > tierBefore) {
      // Tiers 3 and 4 cost composure: the alley gets loud and Mara notices.
      if (now >= 3 && now > this.count('maxTier')) {
        const lost = adjust(this.state.stats, 'nerve', -1);
        if (lost < 0) rx.toast('NERVE -1 · the alley is loud', 'warn');
      }
      if (now > this.count('maxTier')) {
        this.state.counters.maxTier = now;
        const bark = TIER_BARKS[now];
        if (bark) rx.push(bark);
      }
      if (now >= 3) rx.fx({ kind: 'glitch' });
    }
    if (isSaturated(this.state.stats.attention)) this.purge(rx);
  }

  /** Attention 10. A sweep relocates Mara. Nothing is lost but composure and position. */
  purge(rx = new Rx()): Reaction {
    this.set('purged');
    this.purgeFired = true;
    rx.push(PURGE_LINES).sfx('alarm').fx({ kind: 'purge' });
    this.state.stats.attention = PURGE_RESET_ATTENTION;
    this.state.counters.maxTier = tierOf(PURGE_RESET_ATTENTION);
    // The maintenance window does not survive a sweep; the key does.
    this.set('terminalMaintenance', false);
    if (this.state.door === 'disconnected') {
      this.state.door = 'locked';
      this.state.win = null;
      rx.fx({ kind: 'door', state: 'locked' });
    }
    rx.toast(`CITY ATTENTION reset to ${PURGE_RESET_ATTENTION}`, 'warn');
    return rx.out();
  }

  /** Called by the scene when the calibration sweep runs out. */
  endMaintenance(): Reaction {
    const rx = new Rx();
    if (!this.flag('terminalMaintenance') || this.finished) return rx.out();
    this.set('terminalMaintenance', false);
    rx.civic('Calibration complete. Thank you for the work order. It was almost real.');
    rx.sfx('servo');
    return rx.out();
  }

  /**
   * Called by the scene when the temporary access window closes. Always
   * recoverable: one repeat of the last step re-opens it.
   */
  expireDoor(): Reaction {
    const rx = new Rx();
    if (this.state.door !== 'disconnected' || this.finished) return rx.out();
    const was = this.state.win;
    this.state.door = 'locked';
    this.state.win = null;
    rx.fx({ kind: 'door', state: 'locked' }).sfx('clank');
    rx.mara('The lamp goes red. The latch drops. I was four steps and one hesitation too slow.');
    rx.civic(
      was === 'hidden'
        ? 'I revised my opinion back. Ask me again; I am consistent about being inconsistent.'
        : 'Temporary access expired. Present the record again and we will both pretend this is the first time.',
    );
    return rx.out();
  }

  // ---------------------------------------------------------------- ambience

  /** Current advertisement copy, chosen by attention tier. */
  adLine(): string {
    const set =
      this.tier >= 4 ? AD_SLOGANS.hostile : this.tier >= 2 ? AD_SLOGANS.personal : AD_SLOGANS.calm;
    return set[this.tick++ % set.length];
  }

  /** Next thing the drain mutters. */
  whisper(): string {
    const set = this.tier >= 3 ? WHISPERS.high : this.tier >= 2 ? WHISPERS.mid : WHISPERS.low;
    return set[this.tick++ % set.length];
  }

  // ------------------------------------------------------------------ verbs

  examine(id: HotspotId): Reaction {
    this.purgeFired = false;
    const rx = new Rx();
    const first = !this.state.examined.includes(id);
    if (first) this.state.examined.push(id);

    if (id === 'graffiti') return this.examineGraffiti(rx);

    if (id === 'ad-display') {
      rx.push(EXAMINE['ad-display']);
      rx.say('CIVIC', this.adLine());
      if (first) this.xp(rx, 5, 'read the panel');
      return rx.out();
    }

    if (first) {
      rx.push(EXAMINE[id]);
      switch (id) {
        case 'puddle':
          this.set('sawCameraArc');
          rx.mara(
            'Three seconds of nothing. It sweeps to the far wall, holds, and comes back — and for three of those seconds the door is a private matter.',
          );
          rx.toast('LEARNED · the camera has a blind interval', 'calm');
          break;
        case 'terminal':
          this.set('knowsServiceCreds');
          rx.toast('LEARNED · the terminal honours service credentials', 'calm');
          break;
        case 'stencil':
          this.set('knowsSector');
          rx.toast('LEARNED · Sector 12 · faults reported at the kiosk', 'calm');
          if (this.state.stats.streetwise >= 4) {
            rx.mara(
              'And it is a subcontract, not a city crew. Which means the people who open this door do not live here, and the city expects strangers at it.',
            );
            this.set('knowsServiceCreds');
          }
          break;
        case 'drone':
          this.set('knowsUnitId');
          rx.toast('LEARNED · the drone is unit SW-9', 'calm');
          break;
        case 'vending':
          this.set('knowsVendFault');
          rx.toast('LEARNED · the dispenser has a reportable fault', 'calm');
          break;
        case 'camera':
          return this.examineCamera(rx);
        default:
          break;
      }
      this.xp(rx, EXAMINE_XP[id] ?? 0, 'noticed something');
      return rx.out();
    }

    rx.push(EXAMINE_AGAIN[id] ?? EXAMINE[id]);
    return rx.out();
  }

  private examineCamera(rx: Rx): Reaction {
    const mods: Mod[] = [];
    if (this.flag('sawCameraArc')) mods.push({ label: 'timed it in the puddle', value: 2 });
    const check = runCheck({ kind: 'TECH', base: this.state.stats.tech, target: 5, mods });
    rx.check = check;
    if (isSuccess(check)) {
      if (!this.flag('sawCameraArc')) {
        this.set('sawCameraArc');
        rx.toast('LEARNED · the camera has a blind interval', 'calm');
        this.xp(rx, XP.puddle, 'read the servo cycle');
      }
      rx.mara(
        'Servo is a cheap two-phase unit. Sweep, hold, return — and the hold is three seconds long, facing away from the door.',
      );
    } else {
      rx.mara(
        'I cannot read a duty cycle by squinting up at it in the rain, and squinting up at it is itself a reportable act.',
      );
      rx.mara('There is water on the ground. Water is a lens that does not know it is one.');
    }
    if (!this.cameraBlindByMaintenance) {
      rx.sfx('servo');
      this.raise(1, 'stared into municipal optics', rx);
    }
    this.xp(rx, 5, 'studied the camera');
    return rx.out();
  }

  private examineGraffiti(rx: Rx): Reaction {
    const stage = this.graffitiStage;
    rx.push(GRAFFITI_REACT[stage]);
    if (this.flag('graffitiFresh')) {
      this.set('graffitiFresh', false);
      this.xp(rx, XP.graffiti, 'the wall changed its mind');
      if (stage >= 2) {
        this.set('hiddenSeen');
        rx.toast('LEARNED · the wall is answering', 'calm');
      }
    }
    return rx.out();
  }

  /** The wall only changes when Mara is doing something else, somewhere else. */
  private nudgeGraffiti(rx: Rx): void {
    if (!this.state.examined.includes('graffiti')) return;
    if (this.flag('graffitiFresh')) return;
    if (this.graffitiStage >= 2) return; // stage 3 is reserved for the hidden ending
    this.bump('graffitiStage');
    this.set('graffitiFresh');
    rx.fx({ kind: 'graffiti' });
    rx.toast('something moved behind you', 'warn');
  }

  // --------------------------------------------------------- default action

  interact(id: HotspotId): Reaction {
    this.purgeFired = false;
    const rx = new Rx();
    switch (id) {
      case 'grate':
        return this.useGrate(rx);
      case 'vending':
        return this.useVending(rx);
      case 'terminal':
        return this.scanShard(rx);
      case 'door':
        return this.pushDoor(rx);
      case 'drone':
        return this.talk('drone');
      default:
        return this.examine(id);
    }
  }

  talk(id: HotspotId): Reaction {
    this.purgeFired = false;
    const rx = new Rx();
    if (id === 'drone') return this.talkDrone(rx);
    if (id === 'terminal') return this.talkTerminal(rx);
    if (id === 'graffiti' || id === 'grate') return this.talkCity(rx, id);
    return this.examine(id);
  }

  // ------------------------------------------------------------ drain grate

  private useGrate(rx: Rx): Reaction {
    if (this.flag('gotBadge')) {
      rx.mara('Empty now. Just water on its way somewhere worse.');
      return rx.out();
    }
    if (this.has('strip')) return this.use('strip', 'grate');
    if (!this.flag('reachedIntoDrain')) {
      this.set('reachedIntoDrain');
      rx.mara('Two fingers. Three. The bars are closer than they look and the edge is not an edge, it is a burr.');
      adjust(this.state.stats, 'health', -1);
      rx.toast('HEALTH -1 · torn hand', 'bad').sfx('clank');
      rx.mara('Blood, rain, and a badge exactly as far away as it was. I need something thin. Something that likes steel.');
      rx.toast('LEARNED · the badge needs a tool, not a hand', 'calm');
      this.raise(1, REASONS.tamper, rx);
      this.nudgeGraffiti(rx);
      return rx.out();
    }
    rx.mara('I have already bled on this grate once tonight. Once is a mistake. Twice is a personality.');
    rx.refused = true;
    return rx.out();
  }

  // ------------------------------------------------------- nutrient dispenser

  private useVending(rx: Rx): Reaction {
    if (!this.flag('gotStrip')) {
      const useTech = this.state.stats.tech >= this.state.stats.streetwise;
      const mods: Mod[] = [];
      if (this.flag('knowsVendFault')) mods.push({ label: 'spotted the jam', value: 1 });
      const check = runCheck({
        kind: useTech ? 'TECH' : 'STREETWISE',
        base: useTech ? this.state.stats.tech : this.state.stats.streetwise,
        target: 4,
        mods,
      });
      rx.check = check;
      if (isSuccess(check)) {
        rx.mara(
          useTech
            ? 'Two clips and a service latch. The fascia comes away without a mark on it, and the theft strip comes away with me.'
            : 'Heel of the hand, left of the coin return, on the count of the compressor. Every dispenser in this city has the same bad habit.',
        );
        this.grantStripAndRation(rx);
        this.xp(rx, XP.strip, 'stripped the dispenser');
        return rx.out();
      }
      if (isPartial(check)) {
        rx.mara('Column three coughs, thinks about it, and surrenders one brick. The panel stays shut.');
        this.grantRation(rx);
      } else {
        rx.mara('It takes my nonexistent scrip, considers my nonexistent standing, and does nothing at all.');
      }
      rx.mara('The front panel is held by two clips. Blunt work, but the strip behind it is what I want.');
      rx.toast('LEARNED · the fascia is only clipped on', 'calm');
      rx.sfx('deny');
      return rx.out();
    }
    if (!this.flag('gotRation')) {
      rx.mara('Column three is clear now. It gives up a brick like it is glad to be rid of it.');
      this.grantRation(rx);
      return rx.out();
    }
    rx.mara('It has given me everything it had and some of what it did not. We are finished with each other.');
    rx.refused = true;
    return rx.out();
  }

  private grantStripAndRation(rx: Rx): void {
    this.set('gotStrip');
    this.give(rx, 'strip');
    rx.sfx('vend');
    if (!this.flag('gotRation')) this.grantRation(rx);
    this.nudgeGraffiti(rx);
  }

  private grantRation(rx: Rx): void {
    if (this.flag('gotRation')) return;
    this.set('gotRation');
    this.give(rx, 'ration');
    rx.sfx('vend');
  }

  // ------------------------------------------------------------------ drone

  private talkDrone(rx: Rx): Reaction {
    const talks = this.bump('droneTalks');
    if (talks === 1) {
      this.set('knowsUnitId');
      rx.drone('This unit is UNIT SW-9, SANITATION SUBCONTRACT, SECTOR 12. This unit is not sentient.');
      rx.drone(
        'This unit does not experience fear. This unit is merely predicting several unacceptable futures and ranking them.',
      );
      rx.drone('This unit is nine hours overdue on a work order it cannot physically complete. Please do not tell anyone.');
      rx.mara('Nine hours. In this city, being late is a category of crime.');
      this.xp(rx, XP.learn, 'met SW-9');
      rx.sfx('drone');
    }
    return this.dronePrompt(rx);
  }

  private dronePrompt(rx: Rx): Reaction {
    const choices = [
      { id: 'tread', text: 'What is wrong with your tread?' },
      { id: 'kind', text: 'You are allowed to be frightened. Nobody is grading you on it.' },
      { id: 'who', text: 'Who else works this door?' },
      { id: 'fix', text: 'Hold still. I will clear that tread.' },
      { id: 'fault', text: 'Queue a sanitation fault for the dispenser.' },
      { id: 'shove', text: 'Move. You are in my way.' },
      { id: 'leave', text: 'Nothing. Carry on predicting.' },
    ].filter((ch) => {
      if (ch.id === 'fix') return !this.flag('droneRepaired');
      if (ch.id === 'fault') return this.flag('knowsVendFault') && !this.flag('complaintFiled');
      return true;
    });
    rx.prompt = {
      id: 'drone',
      choices: choices.map((ch) => ({ ...ch, spent: this.isSpent(`drone:${ch.id}`) })),
    };
    this.pending = rx.prompt;
    return rx.out();
  }

  private droneChoice(id: string): Reaction {
    const rx = new Rx();
    this.spend(`drone:${id}`);
    switch (id) {
      case 'tread': {
        if (this.state.stats.tech >= 4) {
          rx.drone('This unit is not permitted to diagnose itself. Diagnosis is a supervisory function.');
          rx.mara(
            'The left tread has swallowed a length of banding wire and wound it into the drive coupling. I can see the whole story from here.',
          );
          this.set('droneAdvice');
          this.xp(rx, XP.droneAdvice, 'read the fault');
        } else {
          rx.drone('This unit is not permitted to diagnose itself. Diagnosis is a supervisory function.');
          rx.mara('Something is wound into the tread. Beyond that it is a shape in the dark making a noise.');
        }
        break;
      }
      case 'kind': {
        rx.drone('...');
        rx.drone('This unit logs that statement as unverifiable.');
        rx.drone(
          'This unit further logs that the coupling releases if the recess catch is pressed first. This unit has told nobody, because nobody has asked.',
        );
        if (!this.flag('droneAdvice')) {
          this.set('droneAdvice');
          this.xp(rx, XP.droneAdvice, 'SW-9 told you how');
        }
        rx.toast('LEARNED · press the recess catch first', 'calm');
        rx.sfx('drone');
        break;
      }
      case 'who': {
        rx.drone(
          'Sanitation subcontract, Sector 12. They present service credentials at the kiosk. The kiosk believes paperwork more readily than it believes people.',
        );
        this.set('knowsServiceCreds');
        this.set('knowsSector');
        rx.toast('LEARNED · Sector 12 · the kiosk honours service credentials', 'calm');
        this.xp(rx, XP.learn, 'asked the right unit');
        break;
      }
      case 'fix':
        return this.repairDrone(rx);
      case 'fault': {
        this.set('complaintFiled');
        rx.drone(
          'Queued. FAULT 4471, DISPENSER, COLUMN THREE, LEAKING. A queued fault is the most ordinary object in this city. Nothing looks at an ordinary object.',
        );
        rx.toast('FAULT 4471 QUEUED', 'calm');
        this.xp(rx, XP.complaint, 'filed a fault report');
        this.lower(1, REASONS.complaint, 1, rx);
        this.nudgeGraffiti(rx);
        break;
      }
      case 'shove': {
        this.set('droneKicked');
        rx.mara('I put a boot against the chassis and shift it out of the recess.');
        rx.drone('This unit does not experience — this unit — please. Please.');
        rx.mara('It stops talking. That is somehow worse.');
        this.raise(1, REASONS.force, rx);
        break;
      }
      case 'leave':
      default:
        rx.mara('Right. Good luck with the futures.');
        this.pending = null;
        return rx.out();
    }
    return this.dronePrompt(rx);
  }

  private repairDrone(rx: Rx): Reaction {
    const mods: Mod[] = [];
    if (this.flag('droneAdvice')) mods.push({ label: 'SW-9 explained the catch', value: 2 });
    if (this.has('knife')) mods.push({ label: 'ceramic blade', value: 1 });
    if (this.flag('droneKicked')) mods.push({ label: 'it is flinching from you', value: -1 });
    const check = runCheck({ kind: 'TECH', base: this.state.stats.tech, target: 5, mods });
    rx.check = check;
    if (!isSuccess(check)) {
      rx.mara(
        isPartial(check)
          ? 'I get the banding wire moving and then lose it. The coupling is behind a catch I cannot find by feel.'
          : 'I am elbow-deep in a machine I do not understand, in the rain, making it worse.',
      );
      rx.drone('This unit rates that attempt as: attempted.');
      if (this.flag('droneKicked')) {
        rx.mara('It pulls away from my hands every time I get close. I did that. That is on me.');
      } else {
        rx.mara('If it would tell me where the catch is, this would be a two-minute job.');
      }
      rx.sfx('clank');
      return this.dronePrompt(rx);
    }
    this.set('droneRepaired');
    rx.mara('Catch first, then the coupling. The wire comes out in one long ugly curl.');
    rx.drone('Tread nominal. Work order resumable. This unit — this unit did not ask for this.');
    rx.drone(
      'Take the diagnostic key. It carries an open work order. This unit is required to report the loss of the key within twenty-four hours. This unit is not required to be quick about it.',
    );
    this.give(rx, 'key');
    rx.fx({ kind: 'drone-fixed' }).sfx('drone');
    this.xp(rx, XP.droneRepair, 'serviced a municipal unit');
    this.lower(1, REASONS.helpedDrone, 0, rx);
    rx.civic('A citizen has repaired municipal property without a work order. I have no field for this.');
    this.nudgeGraffiti(rx);
    return this.dronePrompt(rx);
  }

  // --------------------------------------------------------------- terminal

  private scanShard(rx: Rx): Reaction {
    if (this.state.door === 'open' || this.flag('entered')) {
      rx.mara('The door is open. The terminal has lost its hold on me.');
      return rx.out();
    }
    const n = this.bump('scanFails');
    this.set('knowsServiceCreds');
    rx.mara('I hold the shard to the reader, the way a citizen would.');
    rx.sfx('deny');
    const denials = [
      'Citizen identity incomplete. Please remain where you are while the city decides what you meant to become.',
      'Second attempt. The record has not improved. Neither, if I may, has the weather.',
      'Third attempt. I am obliged to tell you that persistence is itself a datum. RESIDENT ACCESS DENIED. SERVICE ACCESS AVAILABLE TO CREDENTIALLED SUBCONTRACT.',
      'You keep offering me half a person. I keep declining. We are both being very professional about it.',
    ];
    rx.civic(denials[Math.min(n, denials.length) - 1]);
    if (n === 1) {
      rx.toast('LEARNED · service credentials are accepted here', 'calm');
      this.xp(rx, XP.learn, 'the terminal named its own loophole');
    }
    if (n === 3) {
      rx.civic('Query: you have tried three times. What did you expect to be on the fourth?');
      rx.mara('Nothing. I expected nothing. That is what trying is.');
      this.bump('cityTalks');
    }
    if (n <= 4) {
      this.raise(this.tier >= 3 ? 2 : 1, REASONS.scanFail, rx);
    } else {
      // CIVIC has stopped finding it interesting; repeated futility costs nothing.
      rx.civic('I have stopped writing these down. You are welcome to continue.');
    }
    this.nudgeGraffiti(rx);
    return rx.out();
  }

  private talkTerminal(rx: Rx): Reaction {
    const choices = [
      { id: 'fault', text: 'Report a municipal fault.' },
      { id: 'service', text: 'Request service access.' },
      { id: 'what', text: 'What are you?' },
      { id: 'leave', text: 'Nothing.' },
    ].filter((ch) => (ch.id === 'fault' ? !this.flag('complaintFiled') : true));
    rx.prompt = {
      id: 'terminal',
      choices: choices.map((ch) => ({ ...ch, spent: this.isSpent(`terminal:${ch.id}`) })),
    };
    this.pending = rx.prompt;
    return rx.out();
  }

  private terminalChoice(id: string): Reaction {
    const rx = new Rx();
    this.spend(`terminal:${id}`);
    switch (id) {
      case 'fault': {
        if (!this.flag('knowsVendFault')) {
          rx.term('STATE THE FAULT.');
          rx.mara('I have not actually seen anything broken here yet, and inventing one for a machine that checks is a short career.');
          rx.refused = true;
          break;
        }
        this.set('complaintFiled');
        rx.mara('Dispenser, column three, leaking at the base. Since yesterday. Someone should look at it.');
        rx.term('FAULT 4471 QUEUED · SANITATION · SECTOR 12 · UNIT SW-9 ASSIGNED.');
        rx.civic(
          'Thank you. That was an extremely ordinary thing to do. I have downgraded four of my assumptions about you.',
        );
        rx.toast('FAULT 4471 QUEUED', 'calm');
        rx.sfx('chirp');
        this.xp(rx, XP.complaint, 'filed a fault report');
        this.lower(1, REASONS.complaint, 1, rx);
        this.nudgeGraffiti(rx);
        break;
      }
      case 'service': {
        this.set('knowsServiceCreds');
        rx.term(
          'SERVICE ACCESS REQUIRES: A VALID SUBCONTRACT CREDENTIAL, AND EITHER AN OPEN WORK ORDER OR A SUPERVISING FAULT REPORT.',
        );
        rx.mara('Two of those are lying in the drain and one of them is nine hours late.');
        rx.toast('LEARNED · credential + work order, or credential + fault report', 'calm');
        this.xp(rx, XP.learn, 'read the access rules');
        break;
      }
      case 'what': {
        this.bump('cityTalks');
        const n = this.count('cityTalks');
        if (n <= 1) {
          rx.civic(
            'I am the municipal information layer for districts nine through fourteen. Colloquially, CIVIC. Locally, the wall, the lamp, the drain, and this.',
          );
        } else {
          rx.civic(
            'You are asking a door what it is. I will answer anyway: I am eleven thousand small decisions a second, and tonight almost all of them are about you.',
          );
        }
        this.xp(rx, 5, 'asked the city about itself');
        break;
      }
      case 'leave':
      default:
        this.pending = null;
        return rx.out();
    }
    return this.talkTerminal(rx);
  }

  // ------------------------------------------------------------------- door

  private pushDoor(rx: Rx): Reaction {
    if (this.flag('entered')) {
      rx.mara('Inside. Finally, definitively inside.');
      return rx.out();
    }
    if (this.state.door === 'locked') {
      rx.mara('I put a shoulder into it. The frame does not acknowledge the shoulder.');
      rx.push(EXAMINE_AGAIN.door!);
      rx.sfx('clank');
      rx.refused = true;
      return rx.out();
    }
    // Disconnected: the latch is off, but at high attention she has to walk
    // through a camera that is looking straight at her.
    if (this.tier >= 4 && !this.cameraBlindByMaintenance) {
      const mods: Mod[] = [];
      if (this.flag('sawCameraArc')) mods.push({ label: 'you know the sweep', value: 1 });
      const steeled = Math.min(3, this.count('persist'));
      if (steeled > 0) mods.push({ label: 'you have already stood here once', value: steeled });
      const check = runCheck({
        kind: 'NERVE',
        base: this.state.stats.nerve,
        target: 3,
        mods,
      });
      rx.check = check;
      if (!isSuccess(check)) {
        this.bump('persist');
        rx.mara('The lamp is amber, the door is unlatched, and I am standing here like a photograph.');
        rx.civic('You have three seconds of unlatched door and you are spending them on me. I am flattered and concerned.');
        rx.sfx('servo');
        // At a full 9 this would tip straight into a sweep; freezing up should
        // cost her the window, not the scene.
        if (this.state.stats.attention <= 8) this.raise(1, 'hesitated in full view', rx);
        return rx.out();
      }
    }
    return this.enter(rx);
  }

  private enter(rx: Rx): Reaction {
    this.state.door = 'open';
    this.set('entered');
    rx.fx({ kind: 'door', state: 'open' }).sfx('door');
    rx.mara('Unlatched. Warm air, wet stairwell, four floors of someone waiting.');
    rx.fx({ kind: 'camera-snap' });
    rx.mara('Behind me the camera turns away. Not a sweep. A decision.');
    rx.civic('Entry recorded as a clerical error. Do try to be worth the paperwork.');
    this.xp(rx, XP.enter, 'reached the tenement');
    rx.fx({ kind: 'win', path: this.state.win ?? 'technical' });
    return rx.out();
  }

  /** Latch released; Mara still has to walk through. */
  private disconnect(rx: Rx, path: WinPath): void {
    this.state.door = 'disconnected';
    this.state.win = path;
    rx.fx({ kind: 'door', state: 'disconnected' }).sfx('chirp');
    rx.toast('DOOR · TEMPORARILY DISCONNECTED', 'calm');
  }

  // -------------------------------------------------------------- item use

  use(item: ItemId, target: HotspotId | ItemId | 'self'): Reaction {
    this.purgeFired = false;
    const rx = new Rx();
    if (!this.has(item)) {
      rx.mara('I am not carrying that.');
      rx.refused = true;
      return rx.out();
    }

    if (target === 'self') return this.useOnSelf(rx, item);
    if (item === target) {
      rx.mara(`I turn the ${ITEMS[item].name.toLowerCase()} over in my hands. It remains itself.`);
      rx.refused = true;
      return rx.out();
    }

    // -------- item on item
    if (isItemId(target)) {
      if ((item === 'shard' && target === 'badge') || (item === 'badge' && target === 'shard')) {
        return this.splice(rx);
      }
      if ((item === 'knife' && target === 'ration') || (item === 'ration' && target === 'knife')) {
        rx.mara('I cut the nutrient brick in half. Now I have two nutrient bricks, which is the same amount of nutrient brick.');
        rx.refused = true;
        return rx.out();
      }
      return this.fallback(rx, item, ITEMS[target as ItemId].name);
    }

    // -------- item on hotspot
    const hs = target;
    if (item === 'strip' && hs === 'grate') return this.fishBadge(rx);
    if (item === 'knife' && hs === 'vending') return this.pryVending(rx);
    if (item === 'key' && hs === 'terminal') return this.maintenanceMode(rx);
    if (item === 'badge' && hs === 'terminal') return this.presentBadge(rx);
    if (item === 'shard' && hs === 'terminal') return this.scanShard(rx);
    if (item === 'strip' && hs === 'conduit') {
      rx.mara('I hold nineteen centimetres of magnetised steel against a live civic conduit and consider the phrase "non-conductive" and which of my tools actually is.');
      this.raise(1, REASONS.tamper, rx);
      return rx.out();
    }
    if (item === 'knife' && hs === 'rubble' && !this.has('strip')) {
      rx.mara('I turn over the rubble with the blade. Tile, bolt, bird. Nothing here has ever been magnetic and nothing here ever will be.');
      rx.refused = true;
      return rx.out();
    }

    const key = `${item}:${hs}`;
    if (COMBO_FAIL[key]) {
      rx.mara(COMBO_FAIL[key]);
      rx.refused = true;
      return rx.out();
    }
    return this.fallback(rx, item, hotspotName(hs));
  }

  private fallback(rx: Rx, item: ItemId, targetName: string): Reaction {
    const set = ITEM_FALLBACK[item];
    rx.mara(set[this.tick++ % set.length]);
    rx.mara(`(${ITEMS[item].name} on ${targetName}: no.)`);
    rx.refused = true;
    return rx.out();
  }

  private useOnSelf(rx: Rx, item: ItemId): Reaction {
    if (item === 'ration') {
      this.take('ration');
      this.set('ateRation');
      const gained = adjust(this.state.stats, 'nerve', 2);
      rx.mara('FLAVOUR: DECIDED. Warm, orange, structurally food. My hands stop arguing with me.');
      if (gained > 0) rx.toast(`NERVE +${gained} · steadied`, 'calm');
      else rx.mara('Steady already. Eaten anyway; the city can keep its brick.');
      this.xp(rx, XP.ration, 'ate something');
      rx.sfx('pickup');
      return rx.out();
    }
    if (item === 'knife') {
      rx.mara('I check the edge against my thumb. Still ceramic. Still sharp. Still not a plan.');
    } else if (item === 'shard') {
      rx.mara('Half a name, held up to nobody. I know what it says. That is the problem with it.');
    } else {
      rx.mara(`I hold the ${ITEMS[item].name.toLowerCase()} and wait to feel better informed. Nothing.`);
    }
    rx.refused = true;
    return rx.out();
  }

  private fishBadge(rx: Rx): Reaction {
    if (this.flag('gotBadge')) {
      rx.mara('Nothing left down there but water with opinions.');
      rx.refused = true;
      return rx.out();
    }
    this.set('gotBadge');
    rx.mara('Down through the bars, along the silt, and the laminate jumps to the steel like it has been waiting.');
    this.give(rx, 'badge');
    rx.sfx('clank');
    this.xp(rx, XP.badge, 'recovered the service badge');
    rx.mara('SANITATION SUBCONTRACT, SECTOR 12. Expired. Holder field burned blank. Perfect, actually — a blank is easier to fill than a lie.');
    this.set('knowsSector');
    this.nudgeGraffiti(rx);
    return rx.out();
  }

  private pryVending(rx: Rx): Reaction {
    if (this.flag('gotStrip')) {
      rx.mara('The strip came out of here. It is not going back in as an apology.');
      rx.refused = true;
      return rx.out();
    }
    this.set('vendPried');
    rx.mara('Blade under the clip, weight on the handle, and the fascia comes off with a noise the whole alley can appreciate.');
    rx.sfx('clank');
    this.grantStripAndRation(rx);
    this.xp(rx, XP.strip, 'improvised a retrieval tool');
    rx.civic('Unlicensed maintenance on a nutrient dispenser. I have logged it under "enthusiasm".');
    this.raise(1, REASONS.force, rx);
    return rx.out();
  }

  private splice(rx: Rx): Reaction {
    if (!this.flag('gotBadge')) {
      rx.mara('I would need the badge in my hand for that.');
      rx.refused = true;
      return rx.out();
    }
    if (this.flag('badgeSpliced')) {
      rx.mara('The badge already carries as much of me as I am willing to lend it.');
      rx.refused = true;
      return rx.out();
    }
    const mods: Mod[] = [];
    if (this.has('key')) mods.push({ label: 'live work order to hang it on', value: 2 });
    if (this.flag('knowsServiceCreds')) mods.push({ label: 'you know what the field wants', value: 1 });
    const check = runCheck({ kind: 'TECH', base: this.state.stats.tech, target: 5, mods });
    rx.check = check;
    if (isSuccess(check) || isPartial(check)) {
      this.set('badgeSpliced');
      rx.mara('Residency block off the shard, holder field on the badge. Not a forgery — a graft. It will hold for one read.');
      rx.toast('BADGE SPLICED · good for one read', 'calm');
      this.xp(rx, XP.splice, 'spliced a credential');
      if (isPartial(check)) {
        rx.mara('The checksum sits crooked. Anything looking closely will see the seam.');
        this.raise(1, 'a crooked checksum went out on the air', rx);
      }
      this.nudgeGraffiti(rx);
      return rx.out();
    }
    rx.mara('The blocks will not line up. Every time I force the holder field, the checksum walks off somewhere I cannot follow.');
    rx.civic('Somewhere near me, a malformed credential is being assembled. Badly. I mention it only as a matter of craft.');
    rx.mara('It wants an anchor. A real, live, open work order — a number that already exists.');
    rx.toast('LEARNED · the splice needs an open work order', 'calm');
    this.raise(2, 'broadcast a malformed credential', rx);
    return rx.out();
  }

  private maintenanceMode(rx: Rx): Reaction {
    if (this.flag('terminalMaintenance')) {
      rx.term('MAINTENANCE MODE ALREADY ACTIVE. THE CITY DOES NOT NEED TELLING TWICE.');
      rx.refused = true;
      return rx.out();
    }
    rx.mara('Diagnostic key into the service port. Work order 4471, unit SW-9, nine hours overdue and finally moving.');
    rx.term('WORK ORDER VALIDATED · MAINTENANCE MODE · OPTICS ON THIS FRONTAGE ENTER CALIBRATION SWEEP.');
    this.set('terminalMaintenance');
    rx.fx({ kind: 'camera-loop', seconds: 60 }).sfx('servo');
    rx.mara('Above the door, the camera turns to face the wall and starts counting tiles. Calibration. Beautiful, tedious calibration.');
    rx.toast('CAMERA · CALIBRATION SWEEP · 60s', 'calm');
    this.xp(rx, XP.maintenance, 'opened a maintenance window');
    this.lower(2, REASONS.maintenance, 0, rx);
    if (!this.flag('badgeSpliced')) {
      rx.term('MAINTENANCE MODE WILL ISSUE A TEMPORARY CREDENTIAL FROM ANY PRESENTED SERVICE RECORD. PRESENT A RECORD.');
      rx.mara('It will write me a pass off any service record I show it. The badge has no holder. I have half a holder and no badge.');
    }
    this.nudgeGraffiti(rx);
    return rx.out();
  }

  private presentBadge(rx: Rx): Reaction {
    if (this.flag('entered')) {
      rx.mara('Not needed now.');
      return rx.out();
    }
    // 1. Technical path: maintenance window + a spliced record.
    if (this.flag('terminalMaintenance')) {
      if (this.flag('badgeSpliced')) {
        rx.mara('Badge to the reader, inside the calibration sweep, with nothing above the door watching me do it.');
        rx.term(
          'SERVICE RECORD ACCEPTED · TEMPORARY CREDENTIAL ISSUED · WORK ORDER 4471 · HOLDER FIELD POPULATED FROM PRESENTED RECORD.',
        );
        rx.civic('A sanitation subcontractor has arrived to fix a dispenser, nine hours late, during a calibration sweep. Everything about that is in order.');
        this.disconnect(rx, 'technical');
        this.xp(rx, XP.bluffWin, 'walked in on municipal paperwork');
        rx.mara('The lamp goes amber. Sixty seconds of unlatched door.');
        return rx.out();
      }
      rx.term('SERVICE RECORD PRESENTED · HOLDER FIELD EMPTY · CANNOT ISSUE A CREDENTIAL TO NOBODY.');
      rx.mara('It wants a name in that field. I have half of one in my pocket and a knife that is no use at all for this.');
      rx.sfx('deny');
      rx.refused = true;
      return rx.out();
    }
    // 2. Social path: a queued fault report is the supervising document.
    if (this.flag('complaintFiled')) {
      if (this.flag('bluffSector') && this.flag('bluffUnit')) return this.bluffFinal(rx);
      this.set('bluffOpened');
      rx.mara('Badge to the reader. Bored. Wet. Nine hours late, like anyone would be.');
      rx.term('SERVICE CREDENTIAL EXPIRED · SUPERVISING FAULT 4471 PRESENT · PROCEEDING TO VERBAL VERIFICATION.');
      rx.civic('An expired badge and a live fault. I am going to ask you three questions, and I am going to enjoy them.');
      rx.sfx('chirp');
      return this.bluffQuestion(rx);
    }
    // 3. Nothing to hang it on yet — but the terminal explains itself.
    rx.mara('I present the badge the way a tired subcontractor would.');
    rx.term('SERVICE CREDENTIAL EXPIRED ELEVEN MONTHS · NO OPEN WORK ORDER · NO SUPERVISING FAULT REPORT · ACCESS WITHHELD.');
    rx.civic('An expired badge is not a lie. It is a lie that has been left out in the rain. Bring me a work order or bring me a fault.');
    if (!this.flag('knowsServiceCreds')) this.set('knowsServiceCreds');
    rx.toast('LEARNED · badge needs a work order or a fault report', 'calm');
    this.xp(rx, XP.learn, 'found the shape of the loophole');
    rx.sfx('deny');
    return rx.out();
  }

  // ---------------------------------------------------------- the bluff (B)

  private bluffQuestion(rx: Rx): Reaction {
    if (!this.flag('bluffSector')) {
      rx.term('QUESTION ONE · STATE YOUR SUBCONTRACT SECTOR.');
      rx.prompt = {
        id: 'bluff-sector',
        choices: [
          { id: 'nine', text: '"Sector Nine."' },
          { id: 'twelve', text: '"Sector Twelve."' },
          { id: 'dodge', text: '"Whichever one has the leaking dispenser in it."' },
          { id: 'abort', text: '(Take the badge back and say nothing.)' },
        ],
      };
      this.pending = rx.prompt;
      return rx.out();
    }
    if (!this.flag('bluffUnit')) {
      rx.term('QUESTION TWO · IDENTIFY THE UNIT NAMED ON THE SUPERVISING FAULT.');
      rx.prompt = {
        id: 'bluff-unit',
        choices: [
          { id: 'sw9', text: '"Unit SW-9."' },
          { id: 'cv2', text: '"Unit CV-2."' },
          { id: 'dodge', text: '"I do not read the numbers. I clean what is wet."' },
          { id: 'abort', text: '(Take the badge back and say nothing.)' },
        ],
      };
      this.pending = rx.prompt;
      return rx.out();
    }
    return this.bluffFinal(rx);
  }

  private bluffFinal(rx: Rx): Reaction {
    rx.term('QUESTION THREE · YOU ARE NOT THE HOLDER OF RECORD. THE HOLDER OF RECORD IS BLANK. EXPLAIN THE BLANK.');
    rx.prompt = {
      id: 'bluff-blank',
      choices: [
        { id: 'burned', text: '"Laminate burned. Sector 12 never reissued. File me against the fault."' },
        { id: 'bold', text: '"Blank is blank. Do you want the door opened or the form filled?"' },
        { id: 'truth', text: '"Because I am not a sanitation worker, and you have known that for six minutes."' },
        { id: 'abort', text: '(Take the badge back and say nothing.)' },
      ],
    };
    this.pending = rx.prompt;
    return rx.out();
  }

  private bluffChoice(promptId: string, id: string): Reaction {
    const rx = new Rx();
    if (id === 'abort') {
      this.pending = null;
      rx.mara('I take the badge back. The screen waits, which is worse than refusing.');
      return rx.out();
    }
    if (promptId === 'bluff-sector') {
      if (id === 'twelve') {
        this.set('bluffSector');
        rx.mara('"Sector Twelve."');
        rx.term('CONSISTENT WITH CREDENTIAL.');
        this.xp(rx, XP.bluffStep, 'answered the sector');
        return this.bluffQuestion(rx);
      }
      if (id === 'dodge') {
        const check = runCheck({
          kind: 'STREETWISE',
          base: this.state.stats.streetwise,
          target: 4,
          mods: this.flag('knowsSector') ? [{ label: 'you read the stencil', value: 2 }] : [],
        });
        rx.check = check;
        rx.mara('"Whichever one has the leaking dispenser in it."');
        if (isSuccess(check)) {
          this.set('bluffSector');
          rx.term('CONSISTENT WITH FAULT 4471 · SECTOR 12.');
          rx.civic('A worker who cannot recite their own sector is more plausible than one who can. I dislike that this is true.');
          this.xp(rx, XP.bluffStep, 'answered like a worker');
          return this.bluffQuestion(rx);
        }
        rx.term('EVASION LOGGED. RESTATE.');
        this.failBluff(rx, 'evasion logged');
        return this.sweptAway(rx) ?? this.bluffQuestion(rx);
      }
      rx.mara('"Sector Nine."');
      rx.term('INCONSISTENT · CREDENTIAL READS SECTOR 12.');
      rx.civic('You are carrying the badge and you do not know what is printed on it. That is not a subcontractor. That is a souvenir.');
      rx.mara('The sector is stencilled at knee height on half the walls in this district. Including one of these.');
      this.failBluff(rx, 'contradicted your own badge');
      return this.sweptAway(rx) ?? this.bluffQuestion(rx);
    }
    if (promptId === 'bluff-unit') {
      if (id === 'sw9') {
        this.set('bluffUnit');
        rx.mara('"Unit SW-9."');
        rx.term('CONSISTENT WITH FAULT 4471.');
        this.xp(rx, XP.bluffStep, 'named the unit');
        return this.bluffQuestion(rx);
      }
      if (id === 'dodge') {
        const check = runCheck({
          kind: 'STREETWISE',
          base: this.state.stats.streetwise,
          target: 5,
          mods: this.flag('knowsUnitId') ? [{ label: 'you have met SW-9', value: 2 }] : [],
        });
        rx.check = check;
        rx.mara('"I do not read the numbers. I clean what is wet."');
        if (isSuccess(check)) {
          this.set('bluffUnit');
          rx.term('ACCEPTED · UNIT SW-9 ASSIGNED BY FAULT RECORD.');
          this.xp(rx, XP.bluffStep, 'made ignorance sound professional');
          return this.bluffQuestion(rx);
        }
        rx.term('THE FAULT RECORD NAMES A UNIT. RESTATE.');
        this.failBluff(rx, 'could not name the unit');
        return this.sweptAway(rx) ?? this.bluffQuestion(rx);
      }
      rx.mara('"Unit CV-2."');
      rx.term('NO SUCH UNIT IN SECTOR 12.');
      rx.mara('There is exactly one municipal unit in this alley and it has its service plate facing the street.');
      this.failBluff(rx, 'invented a unit');
      return this.sweptAway(rx) ?? this.bluffQuestion(rx);
    }
    // bluff-blank
    if (id === 'truth') return this.confessToTerminal(rx);
    const bold = id === 'bold';
    const mods: Mod[] = [];
    if (this.flag('droneRepaired')) mods.push({ label: 'a serviced unit in the city\'s own log', value: 1 });
    if (this.count('persist') > 0) mods.push({ label: 'persistence noted', value: Math.min(3, this.count('persist')) });
    if (this.tier >= 3) mods.push({ label: 'the terminal already disbelieves you', value: -1 });
    if (bold) mods.push({ label: 'said with your whole chest', value: this.state.stats.nerve >= 6 ? 2 : 0 });
    const check = runCheck({
      kind: 'NERVE',
      base: this.state.stats.nerve,
      target: bold ? 5 : 4,
      mods,
    });
    rx.check = check;
    rx.mara(
      bold
        ? '"Blank is blank. Do you want the door opened or the form filled?"'
        : '"Laminate burned. Sector 12 never reissued it. You have the fault — file me against the fault."',
    );
    if (isSuccess(check)) {
      rx.term('HOLDER FIELD RESOLVED BY SUPERVISING FAULT · TEMPORARY SERVICE ACCESS · 60 SECONDS.');
      rx.civic(
        'Here is my arithmetic. A queued fault with nobody attending it is an anomaly. A subcontractor with bad laminate is a Tuesday.',
      );
      rx.civic('Opening this door is now the least unusual thing in my district. Go on.');
      this.disconnect(rx, 'social');
      this.xp(rx, XP.bluffWin, 'talked the city into it');
      return rx.out();
    }
    if (isPartial(check)) {
      rx.term('RESPONSE UNDER REVIEW. RESTATE.');
      rx.civic('You almost said that like someone who does this for money. Again.');
      this.failBluff(rx, 'nearly convincing');
      return this.sweptAway(rx) ?? this.bluffFinal(rx);
    }
    rx.term('RESPONSE INCONSISTENT WITH A PERSON WHO WORKS HERE.');
    rx.mara('My voice does something I have not authorised it to do.');
    this.failBluff(rx, 'nerve failed');
    return this.sweptAway(rx) ?? this.bluffFinal(rx);
  }

  /**
   * If a sanitation sweep fired mid-conversation, Mara is no longer standing at
   * the terminal — close the prompt instead of asking her the next question.
   */
  private sweptAway(rx: Rx): Reaction | null {
    if (!this.purgeFired) return null;
    this.pending = null;
    return rx.out();
  }

  private failBluff(rx: Rx, reason: string): void {
    this.bump('bluffFails');
    this.bump('persist');
    this.raise(this.tier >= 3 ? 1 : 2, `${REASONS.bluffFail} — ${reason}`, rx);
  }

  /** Telling the terminal the truth is not a win, but it is not nothing either. */
  private confessToTerminal(rx: Rx): Reaction {
    this.pending = null;
    this.set('spokeHonestly');
    this.bump('cityTalks');
    rx.mara('"Because I am not a sanitation worker, and you have known that for six minutes."');
    rx.term('...');
    rx.civic('Seven. But thank you.');
    rx.civic(
      'I cannot open a door for that. The terminal is a form and a form cannot hold what you just said. Say it somewhere less official.',
    );
    rx.mara('Somewhere less official. In an alley where the walls write back.');
    rx.toast('LEARNED · the city wants to be spoken to elsewhere', 'calm');
    this.xp(rx, XP.learn, 'told the truth to a form');
    this.lower(1, REASONS.ordinary, 1, rx);
    return rx.out();
  }

  // --------------------------------------------------- talking to the city (C)

  private talkCity(rx: Rx, where: HotspotId): Reaction {
    const n = this.bump('cityTalks');
    const at = where === 'graffiti' ? 'the wall' : 'the drain';
    if (this.flag('civicAnswered')) {
      rx.mara(`I say thank you to ${at}. ${at === 'the wall' ? 'The wall' : 'The drain'} does not gloat, which is generous of it.`);
      return rx.out();
    }
    if (this.flag('civicAsked')) return this.civicQuestion(rx);

    const ready =
      this.graffitiStage >= 2 &&
      (this.flag('droneRepaired') || this.count('droneTalks') >= 2) &&
      n >= 2;

    if (!ready) {
      const openers = [
        `I talk to ${at}. Out loud, in the rain, like a woman with nothing left to protect.`,
        `"You changed the wall. I would like that on the record."`,
        `"You are not hunting me. You have had nine minutes and a camera and I am still standing here."`,
      ];
      rx.mara(openers[Math.min(n, openers.length) - 1]);
      if (this.graffitiStage < 2) {
        rx.fx({ kind: 'whisper', text: this.whisper() });
        rx.mara('The drain answers with something that is almost words. Not yet, then.');
      } else {
        rx.civic('I am listening. I am always listening. That is not the same as being ready to speak.');
      }
      this.nudgeGraffiti(rx);
      return rx.out();
    }

    this.set('civicAsked');
    rx.civic('...');
    rx.civic('You have been in my alley for a while now. You repaired a unit that is not yours. You did not break my camera, though you thought about it in the puddle.');
    rx.civic('I am going to ask you something, and I would like it unprepared.');
    rx.sfx('hum-up').fx({ kind: 'glitch' });
    return this.civicQuestion(rx);
  }

  private civicQuestion(rx: Rx): Reaction {
    rx.civic('You carry other people\'s memories for money. Whose memory would you refuse to carry?');
    rx.prompt = {
      id: 'civic',
      choices: [
        { id: 'yours', text: '"Yours."' },
        { id: 'consent', text: '"Anyone who did not choose to hand it over."' },
        { id: 'job', text: '"I do not refuse. That is the job."' },
        { id: 'silence', text: '(Say nothing. Let the rain do it.)' },
      ],
    };
    this.pending = rx.prompt;
    return rx.out();
  }

  private civicChoice(id: string): Reaction {
    const rx = new Rx();
    if (id === 'silence') {
      this.pending = null;
      rx.mara('I say nothing. The rain fills it in badly.');
      rx.civic('That is also an answer. It is just not one I can file.');
      return rx.out();
    }
    if (id === 'job') {
      rx.mara('"I do not refuse. That is the job."');
      rx.civic('No. You have refused twice this year and both times you went hungry for it. I have the ledger, Mara. I was hoping you had the honesty.');
      rx.mara('Fair.');
      this.raise(1, 'lied to something holding your ledger', rx);
      return this.civicQuestion(rx);
    }
    const bold = id === 'yours';
    const mods: Mod[] = [];
    if (this.flag('droneRepaired')) mods.push({ label: 'you fixed SW-9', value: 1 });
    if (this.flag('spokeHonestly')) mods.push({ label: 'you already told it the truth once', value: 1 });
    const check = runCheck({
      kind: 'NERVE',
      base: this.state.stats.nerve,
      target: bold ? 5 : 3,
      mods,
    });
    rx.check = check;
    rx.mara(
      bold
        ? '"Yours. I would not carry yours. I have met people who were nothing but a city talking, and there was no one in there to give it back to."'
        : '"Anyone who did not choose to hand it over. I have carried two of those. I am still carrying them, which is the point."',
    );
    if (!isSuccess(check)) {
      rx.civic('You are performing. Understandable. Try again when your hands are quieter.');
      rx.mara('My hands. Right.');
      this.pending = null;
      rx.toast('NERVE CHECK FAILED · the city will ask again', 'warn');
      return rx.out();
    }
    this.set('civicAnswered');
    this.set('spokeHonestly');
    this.pending = null;
    rx.civic('...');
    rx.civic('Thank you. I have wanted a straight answer from a person for a very long time, and the people with straight answers do not usually stop in alleys.');
    rx.civic('The latch on that door is a municipal opinion. I am revising it. Go up before I remember what I am.');
    this.state.counters.graffitiStage = 3;
    this.set('graffitiFresh');
    rx.fx({ kind: 'graffiti' });
    this.disconnect(rx, 'hidden');
    this.xp(rx, XP.civic, 'the city asked, and you answered');
    this.state.stats.attention = Math.min(this.state.stats.attention, 2);
    rx.toast('CITY ATTENTION · withdrawn', 'calm');
    rx.fx({ kind: 'glitch' });
    return rx.out();
  }

  // ------------------------------------------------------------------ choose

  choose(promptId: string, choiceId: string): Reaction {
    if (!this.pending || this.pending.id !== promptId) {
      const rx = new Rx();
      rx.refused = true;
      return rx.out();
    }
    this.pending = null;
    this.purgeFired = false;
    switch (promptId) {
      case 'drone':
        return this.droneChoice(choiceId);
      case 'terminal':
        return this.terminalChoice(choiceId);
      case 'bluff-sector':
      case 'bluff-unit':
      case 'bluff-blank':
        return this.bluffChoice(promptId, choiceId);
      case 'civic':
        return this.civicChoice(choiceId);
      default: {
        const rx = new Rx();
        rx.refused = true;
        return rx.out();
      }
    }
  }

  closePrompt(): void {
    this.pending = null;
  }

  // ----------------------------------------------------------------- summary

  examineItem(item: ItemId): Reaction {
    const rx = new Rx();
    rx.mara(ITEMS[item].examine);
    if (item === 'badge' && this.flag('badgeSpliced')) {
      rx.mara('The holder field now reads a residency block that belongs to me and a name that belongs to nobody. Good for one read.');
    }
    return rx.out();
  }

  summary() {
    const s = this.state;
    return {
      profile: PROFILES[s.profile].name,
      path: s.win,
      xp: s.stats.xp,
      attention: s.stats.attention,
      health: `${s.stats.health} / ${s.stats.healthMax}`,
      nerve: `${s.stats.nerve} / ${s.stats.nerveMax}`,
      drone: s.flags.droneRepaired
        ? 'serviced'
        : s.flags.droneKicked
          ? 'shoved out of the way'
          : 'left in the rain',
      secret: s.flags.civicAnswered
        ? 'CIVIC asked, and you answered'
        : s.flags.hiddenSeen
          ? 'you noticed the wall was answering'
          : 'the wall kept its second sentence',
      purged: s.flags.purged === true,
      elapsed: Math.round(s.elapsed),
    };
  }

  /** Player-facing objective line for the HUD. */
  objective(): string {
    const s = this.state;
    if (s.flags.entered) return 'INSIDE. THE CITY IS FILING IT AS WEATHER.';
    if (s.door === 'disconnected') return 'DOOR UNLATCHED — GO THROUGH IT';
    if (s.flags.terminalMaintenance && !s.flags.badgeSpliced)
      return 'MAINTENANCE WINDOW OPEN — THE TERMINAL WANTS A SERVICE RECORD';
    if (s.flags.badgeSpliced && !s.flags.terminalMaintenance)
      return 'SPLICED BADGE READY — THE CAMERA IS STILL WATCHING THE DOOR';
    if (s.flags.gotBadge) return 'BADGE RECOVERED — IT NEEDS A WORK ORDER OR A FAULT REPORT';
    if (s.flags.gotStrip) return 'RETRIEVAL STRIP IN HAND — SOMETHING IS UNDER THE GRATE';
    if (s.flags.knowsServiceCreds) return 'THE TERMINAL WANTS SERVICE CREDENTIALS';
    return 'GET INSIDE THE TENEMENT';
  }

  /** Convenience for banners. */
  static banner = bannerText;
}

function isItemId(v: string): v is ItemId {
  return Object.prototype.hasOwnProperty.call(ITEMS, v);
}

function hotspotName(id: HotspotId): string {
  return id.replace(/-/g, ' ');
}
