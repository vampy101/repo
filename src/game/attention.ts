/** City Attention: the scene's signature dial. 0..10, five behavioural tiers. */

export type Tier = 1 | 2 | 3 | 4 | 5;

export interface TierProfile {
  tier: Tier;
  name: string;
  /** camera stops patrolling and follows Mara */
  cameraTracks: boolean;
  /** ad panel starts using her name */
  adsPersonal: boolean;
  /** terminal demands more before it believes anything */
  terminalSuspicious: boolean;
  /** the alley itself gets loud */
  ambience: number;
  /** how often the drain mutters, in seconds (0 = never) */
  whisperEvery: number;
}

const TIERS: TierProfile[] = [
  { tier: 1, name: 'PASSIVE', cameraTracks: false, adsPersonal: false, terminalSuspicious: false, ambience: 0, whisperEvery: 26 },
  { tier: 2, name: 'ATTENTIVE', cameraTracks: true, adsPersonal: true, terminalSuspicious: false, ambience: 1, whisperEvery: 20 },
  { tier: 3, name: 'SUSPICIOUS', cameraTracks: true, adsPersonal: true, terminalSuspicious: true, ambience: 2, whisperEvery: 14 },
  { tier: 4, name: 'CRITICAL', cameraTracks: true, adsPersonal: true, terminalSuspicious: true, ambience: 3, whisperEvery: 9 },
  { tier: 5, name: 'SATURATED', cameraTracks: true, adsPersonal: true, terminalSuspicious: true, ambience: 4, whisperEvery: 6 },
];

/** 1-3 passive · 4-6 attentive · 7-8 suspicious · 9 critical · 10 purge. */
export function tierOf(attention: number): Tier {
  if (attention >= 10) return 5;
  if (attention >= 9) return 4;
  if (attention >= 7) return 3;
  if (attention >= 4) return 2;
  return 1;
}

export function tierProfile(attention: number): TierProfile {
  return TIERS[tierOf(attention) - 1];
}

export function tierName(attention: number): string {
  return tierProfile(attention).name;
}

/** The purge only fires at a full 10. */
export function isSaturated(attention: number): boolean {
  return attention >= 10;
}

/** Where attention lands after the sweep relocates Mara — punishing, never fatal. */
export const PURGE_RESET_ATTENTION = 5;

export const REASONS = {
  scanFail: 'failed credential scan',
  loiterCamera: 'standing in the camera zone',
  tamper: 'tampering with municipal equipment',
  force: 'forcing municipal equipment',
  hidden: 'out of sight',
  ordinary: 'behaving like a citizen',
  helpedDrone: 'servicing a municipal unit',
  maintenance: 'maintenance window',
  complaint: 'filed a fault report',
  bluffFail: 'inconsistent statement',
} as const;
