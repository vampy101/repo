import type { ProfileId, Stats } from './types';

export interface ProfileDef {
  id: ProfileId;
  name: string;
  tech: number;
  streetwise: number;
  nerve: number;
  blurb: string;
}

export const PROFILES: Record<ProfileId, ProfileDef> = {
  ghost: {
    id: 'ghost',
    name: 'Ghost Technician',
    tech: 6,
    streetwise: 2,
    nerve: 4,
    blurb: 'You have read the maintenance manuals. You have not read the room.',
  },
  diplomat: {
    id: 'diplomat',
    name: 'Alley Diplomat',
    tech: 2,
    streetwise: 6,
    nerve: 4,
    blurb: 'Every system is staffed by something that wants to be told it is right.',
  },
  courier: {
    id: 'courier',
    name: 'Burned Courier',
    tech: 3,
    streetwise: 3,
    nerve: 6,
    blurb: 'You have been looked at by worse things than a municipal camera.',
  },
};

export const PROFILE_ORDER: ProfileId[] = ['ghost', 'diplomat', 'courier'];

export function makeStats(profile: ProfileId): Stats {
  const p = PROFILES[profile];
  return {
    health: 8,
    healthMax: 8,
    nerve: p.nerve,
    nerveMax: 8,
    tech: p.tech,
    streetwise: p.streetwise,
    attention: 1,
    attentionMax: 10,
    xp: 0,
  };
}

/** Baseline used by the brief; `courier` is closest but Nerve differs by design. */
export function defaultStats(): Stats {
  return {
    health: 8,
    healthMax: 8,
    nerve: 5,
    nerveMax: 8,
    tech: 4,
    streetwise: 3,
    attention: 1,
    attentionMax: 10,
    xp: 0,
  };
}

export function clamp(n: number, lo: number, hi: number): number {
  return n < lo ? lo : n > hi ? hi : n;
}

/** Every stat write funnels through here so nothing can escape its bounds. */
export function adjust(stats: Stats, key: 'health' | 'nerve' | 'attention' | 'xp', delta: number): number {
  const before = stats[key];
  switch (key) {
    case 'health':
      stats.health = clamp(stats.health + delta, 0, stats.healthMax);
      break;
    case 'nerve':
      stats.nerve = clamp(stats.nerve + delta, 0, stats.nerveMax);
      break;
    case 'attention':
      stats.attention = clamp(stats.attention + delta, 0, stats.attentionMax);
      break;
    case 'xp':
      stats.xp = Math.max(0, stats.xp + delta);
      break;
  }
  return stats[key] - before;
}
