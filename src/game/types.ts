/** Shared vocabulary for the whole slice. No Phaser, no DOM — safe to unit test. */

export type ProfileId = 'ghost' | 'diplomat' | 'courier';

export type ItemId =
  | 'shard'
  | 'knife'
  | 'strip'
  | 'badge'
  | 'key'
  | 'ration';

export type HotspotId =
  | 'transit-sign'
  | 'ad-display'
  | 'dumpster'
  | 'rubble'
  | 'grate'
  | 'puddle'
  | 'vending'
  | 'graffiti'
  | 'stencil'
  | 'conduit'
  | 'drone'
  | 'terminal'
  | 'door'
  | 'camera'
  | 'windows';

export type Verb = 'examine' | 'use' | 'talk';

export type StatId = 'health' | 'nerve' | 'tech' | 'streetwise' | 'attention' | 'xp';

export type CheckKind = 'TECH' | 'STREETWISE' | 'NERVE';

export type CheckGrade = 'SUCCESS' | 'PARTIAL SUCCESS' | 'FAILED';

export interface CheckResult {
  kind: CheckKind;
  grade: CheckGrade;
  /** stat + situational bonuses */
  score: number;
  /** score needed for SUCCESS */
  target: number;
  /** what pushed the score up or down, for the player-facing readout */
  notes: string[];
}

export type DoorState = 'locked' | 'disconnected' | 'open';

export type WinPath = 'technical' | 'social' | 'hidden';

export type Speaker = 'MARA' | 'CIVIC' | 'SW-9' | 'TERMINAL' | 'NARRATOR' | 'ALARM';

export interface Line {
  who: Speaker;
  text: string;
}

export interface Choice {
  id: string;
  text: string;
  /** shown greyed out once used */
  spent?: boolean;
}

export interface Prompt {
  id: string;
  choices: Choice[];
}

/** Something the presentation layer has to *play*: sound, animation, screen effect. */
export type Effect =
  | { kind: 'sfx'; name: SfxName }
  | { kind: 'glitch' }
  | { kind: 'shake'; power: number }
  | { kind: 'graffiti' }
  | { kind: 'camera-loop'; seconds: number }
  | { kind: 'camera-snap' }
  | { kind: 'door'; state: DoorState }
  | { kind: 'drone-fixed' }
  | { kind: 'drone-errand' }
  | { kind: 'win'; path: WinPath }
  | { kind: 'purge' }
  | { kind: 'whisper'; text: string }
  | { kind: 'mara-pose'; pose: 'reach' | 'work' | 'idle'; seconds: number };

export type SfxName =
  | 'chirp'
  | 'deny'
  | 'servo'
  | 'door'
  | 'clank'
  | 'vend'
  | 'pickup'
  | 'xp'
  | 'alarm'
  | 'drone'
  | 'hum-up';

export type ToastTone = 'good' | 'warn' | 'bad' | 'calm';

export interface Toast {
  text: string;
  tone: ToastTone;
}

/** Everything one player action produced. The scene renders this; tests assert on it. */
export interface Reaction {
  lines: Line[];
  toasts: Toast[];
  effects: Effect[];
  check?: CheckResult;
  prompt?: Prompt;
  /** true when the action was a no-op we still want narrated */
  refused?: boolean;
}

export interface Stats {
  health: number;
  healthMax: number;
  nerve: number;
  nerveMax: number;
  tech: number;
  streetwise: number;
  attention: number;
  attentionMax: number;
  xp: number;
}

export type FlagId =
  // --- discoveries ---
  | 'sawCameraArc' // knows the camera has a blind interval
  | 'knowsServiceCreds' // knows the terminal honours municipal service credentials
  | 'knowsSector' // read the stencil: Sector 12
  | 'knowsUnitId' // knows the drone is unit SW-9
  | 'knowsVendFault' // saw that the dispenser is leaking
  | 'knowsBadgeName' // knows whose badge it is
  // --- drone ---
  | 'droneAdvice' // drone explained its own fault
  | 'droneRepaired'
  | 'droneKicked'
  // --- objects ---
  | 'gotStrip'
  | 'gotBadge'
  | 'gotRation'
  | 'ateRation'
  | 'badgeSpliced'
  | 'reachedIntoDrain'
  | 'vendPried'
  | 'graffitiFresh' // the wall has changed and Mara has not looked yet
  | 'entered' // walked through the door: the slice is finished
  // --- terminal / city ---
  | 'complaintFiled'
  | 'terminalMaintenance'
  | 'bluffOpened' // began the sanitation bluff
  | 'bluffSector'
  | 'bluffUnit'
  | 'civicAsked' // CIVIC put its personal question
  | 'civicAnswered'
  | 'spokeHonestly'
  | 'hiddenSeen' // player noticed the graffiti is answering back
  | 'purged'; // hit attention 10 at least once

export type CounterId =
  | 'scanFails'
  | 'graffitiStage'
  | 'droneTalks'
  | 'cityTalks'
  | 'bluffFails'
  /** highest attention tier reached, so each tier only announces itself once */
  | 'maxTier'
  /** stacking "persistence noted" bonus on the terminal bluff */
  | 'persist';

export interface GameState {
  version: number;
  profile: ProfileId;
  stats: Stats;
  inventory: ItemId[];
  selected: ItemId | null;
  flags: Partial<Record<FlagId, boolean>>;
  counters: Record<CounterId, number>;
  door: DoorState;
  /** hotspot ids already examined — used for one-shot XP and "you already know this" */
  examined: HotspotId[];
  /** dialogue choices already taken, so conversations remember themselves across a reload */
  spent: string[];
  win: WinPath | null;
  /** seconds of play, for the summary */
  elapsed: number;
}
