import { itemIconCanvas } from '../art/textures';
import { ITEMS } from '../data/items';
import { tierName } from '../game/attention';
import type { Engine } from '../game/engine';
import type { ItemId } from '../game/types';

const SLOTS = 6;

export interface HudCallbacks {
  onSelect(item: ItemId | null): void;
  onExamineItem(item: ItemId): void;
  onUseOnSelf(item: ItemId): void;
  onToggleHotspots(): void;
  onToggleAudio(): void;
  onRestart(): void;
  onClearSave(): void;
}

function el<T extends HTMLElement>(id: string): T {
  const node = document.getElementById(id);
  if (!node) throw new Error(`missing element #${id}`);
  return node as T;
}

export class Hud {
  private readonly statHealth = el('stat-health');
  private readonly statNerve = el('stat-nerve');
  private readonly statTech = el('stat-tech');
  private readonly statStreet = el('stat-street');
  private readonly statAttention = el('stat-attention');
  private readonly statXp = el('stat-xp');
  private readonly inventory = el('inventory');
  private readonly status = el('hud-status');
  private readonly btnHotspots = el<HTMLButtonElement>('btn-hotspots');
  private readonly btnAudio = el<HTMLButtonElement>('btn-audio');

  private lastXp = -1;
  private lastAttention = -1;
  private iconCache = new Map<string, HTMLCanvasElement>();

  constructor(private readonly cb: HudCallbacks) {
    this.btnHotspots.addEventListener('click', () => cb.onToggleHotspots());
    this.btnAudio.addEventListener('click', () => cb.onToggleAudio());
    el<HTMLButtonElement>('btn-restart').addEventListener('click', () => cb.onRestart());
    el<HTMLButtonElement>('btn-clear').addEventListener('click', () => cb.onClearSave());
    // Right-clicking anywhere in the HUD must not open the browser menu.
    el('hud').addEventListener('contextmenu', (e) => e.preventDefault());
  }

  setHotspotsOn(on: boolean): void {
    this.btnHotspots.classList.toggle('off', !on);
  }

  setAudioOn(on: boolean): void {
    this.btnAudio.classList.toggle('off', !on);
    this.btnAudio.textContent = on ? 'SOUND' : 'MUTED';
  }

  /** Free text under the inventory: current objective, or the hovered target. */
  setStatusLine(text: string): void {
    this.status.textContent = text;
  }

  render(engine: Engine): void {
    const s = engine.state;
    const st = s.stats;
    const done = engine.finished;

    this.statHealth.className = 'stat health';
    this.statHealth.innerHTML = row('HEALTH', `${st.health}/${st.healthMax}`, pips(st.health, st.healthMax));
    this.statNerve.className = 'stat nerve';
    this.statNerve.innerHTML = row('NERVE', `${st.nerve}/${st.nerveMax}`, pips(st.nerve, st.nerveMax));
    this.statTech.className = 'stat';
    this.statTech.innerHTML = row('TECH', String(st.tech), pips(st.tech, 8));
    this.statStreet.className = 'stat';
    this.statStreet.innerHTML = row('STREETWISE', String(st.streetwise), pips(st.streetwise, 8));

    const tier = engine.tier;
    this.statAttention.className = `stat attention t${tier}${done ? ' done' : ''}`;
    const attVal = done ? '?' : `${st.attention}/${st.attentionMax}`;
    this.statAttention.innerHTML = row('CITY ATTENTION', attVal, done ? '' : pips(st.attention, st.attentionMax));
    this.statXp.className = 'stat';
    this.statXp.innerHTML =
      `<span class="k">EXPERIENCE</span><span class="v">${st.xp} XP</span>` +
      `<span class="tier">${done ? 'UNREADABLE' : tierName(st.attention)}</span>`;

    if (this.lastXp >= 0 && st.xp !== this.lastXp) flash(this.statXp);
    if (this.lastAttention >= 0 && st.attention !== this.lastAttention) flash(this.statAttention);
    this.lastXp = st.xp;
    this.lastAttention = st.attention;

    this.renderInventory(s.inventory, s.selected);
  }

  private renderInventory(items: ItemId[], selected: ItemId | null): void {
    const want = Math.max(SLOTS, items.length);
    while (this.inventory.children.length < want) {
      this.inventory.appendChild(document.createElement('div'));
    }
    while (this.inventory.children.length > want) {
      this.inventory.lastChild?.remove();
    }
    for (let i = 0; i < want; i++) {
      const slot = this.inventory.children[i] as HTMLDivElement;
      const item = items[i];
      slot.className = item ? `slot${item === selected ? ' sel' : ''}` : 'slot empty';
      slot.title = item ? ITEMS[item].name : '';
      if (!item) {
        slot.replaceChildren();
        slot.onclick = null;
        slot.oncontextmenu = null;
        continue;
      }
      let icon = this.iconCache.get(item);
      if (!icon) {
        icon = itemIconCanvas(item);
        this.iconCache.set(item, icon);
      }
      if (slot.firstChild !== icon) slot.replaceChildren(icon);
      slot.onclick = (e) => {
        e.stopPropagation();
        if (e.shiftKey) this.cb.onUseOnSelf(item);
        else this.cb.onSelect(selected === item ? null : item);
      };
      slot.oncontextmenu = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.cb.onExamineItem(item);
      };
    }
  }
}

function row(key: string, value: string, pipsHtml: string): string {
  return (
    `<span class="k">${key}</span><span class="v">${value}</span>` +
    `<span class="pips">${pipsHtml}</span>`
  );
}

function pips(value: number, max: number): string {
  let out = '';
  for (let i = 0; i < max; i++) out += `<span class="pip${i < value ? ' on' : ''}"></span>`;
  return out;
}

function flash(node: HTMLElement): void {
  node.classList.remove('flash');
  void node.offsetWidth;
  node.classList.add('flash');
}
