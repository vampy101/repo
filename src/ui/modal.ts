import { PROFILES, PROFILE_ORDER } from '../game/stats';
import type { ProfileId } from '../game/types';

function el<T extends HTMLElement>(id: string): T {
  const node = document.getElementById(id);
  if (!node) throw new Error(`missing element #${id}`);
  return node as T;
}

export interface Summary {
  profile: string;
  path: string | null;
  xp: number;
  attention: number;
  health: string;
  nerve: string;
  drone: string;
  secret: string;
  purged: boolean;
  elapsed: number;
}

const PATH_LABEL: Record<string, string> = {
  technical: 'TECHNICAL · a calibration window, a grafted credential',
  social: 'STREETWISE · an expired badge, a very ordinary fault',
  hidden: 'HONEST · you answered what the city was afraid to ask',
};

export class Modal {
  private readonly host = el('modal');

  get open(): boolean {
    return !this.host.classList.contains('hidden');
  }

  hide(): void {
    this.host.classList.add('hidden');
    this.host.replaceChildren();
  }

  private panel(): HTMLDivElement {
    const p = document.createElement('div');
    p.className = 'panel';
    this.host.replaceChildren(p);
    this.host.classList.remove('hidden');
    return p;
  }

  showTitle(opts: {
    hasSave: boolean;
    initial: ProfileId;
    onStart(profile: ProfileId): void;
    onContinue(): void;
  }): void {
    const p = this.panel();
    let chosen = opts.initial;

    const h1 = document.createElement('h1');
    h1.textContent = 'THE CITY IS LISTENING';
    const h2 = document.createElement('h2');
    h2.textContent = 'CHECKPOINT 7 · THE LISTENING ALLEY';
    const intro = document.createElement('p');
    intro.textContent =
      'You are Mara Vey, unlicensed memory courier. Your contact is four floors above a locked tenement door, and the alley in front of it belongs to CIVIC.';
    const pick = document.createElement('p');
    pick.className = 'dim';
    pick.textContent = 'Choose what you brought with you. All three get inside. None of them get inside the same way.';

    const row = document.createElement('div');
    row.className = 'profiles';
    const buttons = new Map<ProfileId, HTMLButtonElement>();
    for (const id of PROFILE_ORDER) {
      const def = PROFILES[id];
      const b = document.createElement('button');
      b.className = `profile${id === chosen ? ' sel' : ''}`;
      b.innerHTML =
        `<b>${def.name}</b>` +
        `<span class="nums">TECH ${def.tech} · STREETWISE ${def.streetwise} · NERVE ${def.nerve}</span>` +
        `<div class="blurb">${def.blurb}</div>`;
      b.addEventListener('click', () => {
        chosen = id;
        for (const [bid, btn] of buttons) btn.classList.toggle('sel', bid === chosen);
      });
      buttons.set(id, b);
      row.appendChild(b);
    }

    const actions = document.createElement('div');
    actions.className = 'row';
    const start = document.createElement('button');
    start.textContent = 'ENTER THE ALLEY';
    start.addEventListener('click', () => opts.onStart(chosen));
    actions.appendChild(start);
    if (opts.hasSave) {
      const cont = document.createElement('button');
      cont.className = 'ghost';
      cont.textContent = 'CONTINUE SAVED SCENE';
      cont.addEventListener('click', () => opts.onContinue());
      actions.appendChild(cont);
    }

    const controls = document.createElement('p');
    controls.className = 'dim';
    controls.innerHTML =
      'LEFT CLICK ground to walk · LEFT CLICK an object for its default action · RIGHT CLICK to examine<br>' +
      'CLICK an inventory item then an object to use it · SHIFT+CLICK an item to use it on yourself<br>' +
      'TAB highlights every hotspot · ESC closes dialogue · the scene autosaves as you go';

    p.append(h1, h2, intro, pick, row, actions, controls);
    (buttons.get(chosen) ?? start).focus();
  }

  showCompletion(s: Summary, opts: { onReplay(): void; onAlternate(): void }): void {
    const p = this.panel();
    const h1 = document.createElement('h1');
    h1.textContent = 'THE DOOR CLOSES BEHIND YOU';
    const h2 = document.createElement('h2');
    h2.textContent = 'ENTRY RECORDED AS A CLERICAL ERROR';
    const quote = document.createElement('p');
    quote.textContent = '“Do try to be worth the paperwork.”';

    const sum = document.createElement('div');
    sum.className = 'summary';
    const rows: [string, string][] = [
      ['PROFILE', s.profile],
      ['PATH USED', s.path ? PATH_LABEL[s.path] : 'unrecorded'],
      ['EXPERIENCE', `${s.xp} XP`],
      ['FINAL CITY ATTENTION', `${s.attention} / 10  ·  displayed as ?`],
      ['HEALTH · NERVE', `${s.health} · ${s.nerve}`],
      ['UNIT SW-9', s.drone],
      ['THE WALL', s.secret],
      ['SANITATION SWEEPS SURVIVED', s.purged ? '1' : '0'],
      ['TIME IN THE ALLEY', `${Math.floor(s.elapsed / 60)}m ${s.elapsed % 60}s`],
    ];
    for (const [k, v] of rows) {
      const d = document.createElement('div');
      d.innerHTML = `<span>${k}</span><span>${v}</span>`;
      sum.appendChild(d);
    }

    const actions = document.createElement('div');
    actions.className = 'row';
    const replay = document.createElement('button');
    replay.textContent = 'REPLAY THIS BUILD';
    replay.addEventListener('click', () => opts.onReplay());
    const alt = document.createElement('button');
    alt.className = 'ghost';
    alt.textContent = 'RESTART WITH ALTERNATE STATS';
    alt.addEventListener('click', () => opts.onAlternate());
    actions.append(replay, alt);

    p.append(h1, h2, quote, sum, actions);
    replay.focus();
  }

  showConfirm(title: string, body: string, onYes: () => void): void {
    const p = this.panel();
    const h1 = document.createElement('h1');
    h1.textContent = title;
    const t = document.createElement('p');
    t.textContent = body;
    const actions = document.createElement('div');
    actions.className = 'row';
    const yes = document.createElement('button');
    yes.textContent = 'DO IT';
    yes.addEventListener('click', () => {
      this.hide();
      onYes();
    });
    const no = document.createElement('button');
    no.className = 'ghost';
    no.textContent = 'NEVER MIND';
    no.addEventListener('click', () => this.hide());
    actions.append(yes, no);
    p.append(h1, t, actions);
    no.focus();
  }
}
