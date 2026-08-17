import { ITEMS } from '../data/items';
import { HOTSPOT_BY_ID } from '../data/scene';
import { SAVE_VERSION, emptyCounters, newGame } from './state';
import { clamp } from './stats';
import type { CounterId, DoorState, GameState, HotspotId, ItemId, ProfileId, WinPath } from './types';

export const SAVE_KEY = 'city-is-listening.save';

/** Injectable so the save layer is testable outside a browser. */
export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export function memoryStorage(): StorageLike {
  const map = new Map<string, string>();
  return {
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => void map.set(k, v),
    removeItem: (k) => void map.delete(k),
  };
}

export function serialize(s: GameState): string {
  return JSON.stringify({ ...s, version: SAVE_VERSION });
}

const PROFILES_OK: ProfileId[] = ['ghost', 'diplomat', 'courier'];
const DOORS_OK: DoorState[] = ['locked', 'disconnected', 'open'];
const PATHS_OK: WinPath[] = ['technical', 'social', 'hidden'];

/**
 * Deliberately paranoid: a save from an older build, a hand-edited save, or a
 * truncated write must never produce an unplayable scene. Anything unrecognised
 * is dropped and the rest is clamped into range.
 */
export function deserialize(raw: string | null): GameState | null {
  if (!raw) return null;
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }
  if (typeof data !== 'object' || data === null) return null;
  const d = data as Record<string, unknown>;
  if (d.version !== SAVE_VERSION) return null;

  const profile = PROFILES_OK.includes(d.profile as ProfileId) ? (d.profile as ProfileId) : 'courier';
  const base = newGame(profile);

  const st = (d.stats ?? {}) as Record<string, unknown>;
  const num = (v: unknown, fallback: number) => (typeof v === 'number' && Number.isFinite(v) ? v : fallback);
  base.stats.healthMax = clamp(num(st.healthMax, 8), 1, 99);
  base.stats.nerveMax = clamp(num(st.nerveMax, 8), 1, 99);
  base.stats.attentionMax = clamp(num(st.attentionMax, 10), 1, 99);
  base.stats.health = clamp(num(st.health, base.stats.health), 0, base.stats.healthMax);
  base.stats.nerve = clamp(num(st.nerve, base.stats.nerve), 0, base.stats.nerveMax);
  base.stats.attention = clamp(num(st.attention, base.stats.attention), 0, base.stats.attentionMax);
  base.stats.tech = clamp(num(st.tech, base.stats.tech), 0, 12);
  base.stats.streetwise = clamp(num(st.streetwise, base.stats.streetwise), 0, 12);
  base.stats.xp = Math.max(0, Math.floor(num(st.xp, 0)));

  base.inventory = uniq(asArray(d.inventory).filter(isItem));
  base.selected = isItem(d.selected) && base.inventory.includes(d.selected) ? d.selected : null;

  base.flags = {};
  if (typeof d.flags === 'object' && d.flags !== null) {
    for (const [k, v] of Object.entries(d.flags as Record<string, unknown>)) {
      if (v === true) (base.flags as Record<string, boolean>)[k] = true;
    }
  }

  base.counters = emptyCounters();
  if (typeof d.counters === 'object' && d.counters !== null) {
    for (const [k, v] of Object.entries(d.counters as Record<string, unknown>)) {
      if (k in base.counters && typeof v === 'number' && Number.isFinite(v)) {
        base.counters[k as CounterId] = clamp(Math.floor(v), 0, 9999);
      }
    }
  }

  base.door = DOORS_OK.includes(d.door as DoorState) ? (d.door as DoorState) : 'locked';
  base.examined = uniq(asArray(d.examined).filter(isHotspot));
  base.spent = uniq(asArray(d.spent).filter((v): v is string => typeof v === 'string')).slice(0, 200);
  base.win = PATHS_OK.includes(d.win as WinPath) ? (d.win as WinPath) : null;
  base.elapsed = Math.max(0, num(d.elapsed, 0));

  // --- consistency repairs: a state that cannot happen must not be loaded ---
  if (base.flags.entered) base.door = 'open';
  else if (base.door === 'open') base.door = 'locked';
  if (base.door !== 'open' && base.door !== 'disconnected') base.win = null;
  if (base.door === 'disconnected' && !base.win) base.door = 'locked';
  if (base.flags.gotBadge && !base.inventory.includes('badge')) base.inventory.push('badge');
  if (base.flags.gotStrip && !base.inventory.includes('strip')) base.inventory.push('strip');
  if (base.flags.droneRepaired && !base.inventory.includes('key')) base.inventory.push('key');
  if (base.flags.badgeSpliced && !base.flags.gotBadge) base.flags.badgeSpliced = false;
  if (base.flags.gotRation && base.flags.ateRation) {
    base.inventory = base.inventory.filter((i) => i !== 'ration');
  }
  if (base.counters.graffitiStage > 3) base.counters.graffitiStage = 3;

  return base;
}

export function save(state: GameState, storage: StorageLike): void {
  try {
    storage.setItem(SAVE_KEY, serialize(state));
  } catch {
    /* private browsing, quota, or no storage at all: play on without a save. */
  }
}

export function load(storage: StorageLike): GameState | null {
  try {
    return deserialize(storage.getItem(SAVE_KEY));
  } catch {
    return null;
  }
}

export function clearSave(storage: StorageLike): void {
  try {
    storage.removeItem(SAVE_KEY);
  } catch {
    /* nothing to do */
  }
}

export function hasSave(storage: StorageLike): boolean {
  return load(storage) !== null;
}

function asArray(v: unknown): unknown[] {
  return Array.isArray(v) ? v : [];
}
function uniq<T>(a: T[]): T[] {
  return [...new Set(a)];
}
function isItem(v: unknown): v is ItemId {
  return typeof v === 'string' && Object.prototype.hasOwnProperty.call(ITEMS, v);
}
function isHotspot(v: unknown): v is HotspotId {
  return typeof v === 'string' && Object.prototype.hasOwnProperty.call(HOTSPOT_BY_ID, v);
}
