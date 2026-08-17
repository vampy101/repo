import { STARTING_ITEMS } from '../data/items';
import { makeStats } from './stats';
import type { CounterId, GameState, ProfileId } from './types';

export const SAVE_VERSION = 3;

export function newGame(profile: ProfileId): GameState {
  return {
    version: SAVE_VERSION,
    profile,
    stats: makeStats(profile),
    inventory: [...STARTING_ITEMS],
    selected: null,
    flags: {},
    counters: emptyCounters(),
    door: 'locked',
    examined: [],
    spent: [],
    win: null,
    elapsed: 0,
  };
}

export function emptyCounters(): Record<CounterId, number> {
  return {
    scanFails: 0,
    graffitiStage: 0,
    droneTalks: 0,
    cityTalks: 0,
    bluffFails: 0,
    maxTier: 1,
    persist: 0,
  };
}

export function cloneState(s: GameState): GameState {
  return {
    ...s,
    stats: { ...s.stats },
    inventory: [...s.inventory],
    flags: { ...s.flags },
    counters: { ...s.counters },
    examined: [...s.examined],
    spent: [...s.spent],
  };
}
