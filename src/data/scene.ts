import type { HotspotId } from '../game/types';

export const VIEW_W = 320;
export const VIEW_H = 180;

/** Ground band Mara can occupy, before blockers are subtracted. */
export const GROUND = { x1: 14, y1: 143, x2: 312, y2: 176 };

/** Rectangles punched out of the walkable band (prop footprints). */
export const BLOCKERS: Rect[] = [
  { x1: 20, y1: 161, x2: 64, y2: 177 }, // dumpster front face (Mara walks *behind* it)
  { x1: 96, y1: 143, x2: 118, y2: 154 }, // rubble pile
  { x1: 120, y1: 143, x2: 152, y2: 151 }, // dispenser plinth
  { x1: 214, y1: 143, x2: 246, y2: 151 }, // drone charging recess
];

/** Standing here, Mara is out of every line of sight in the alley. */
export const BLIND_SPOT: Rect = { x1: 22, y1: 143, x2: 62, y2: 160 };

/** The camera's hot zone: the terminal / door apron. */
export const CAMERA_ZONE: Rect = { x1: 232, y1: 140, x2: 312, y2: 178 };

export const START_POS = { x: 82, y: 168 };

export interface Rect {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface HotspotDef {
  id: HotspotId;
  /** short label under the cursor */
  label: string;
  /** clickable rectangle in scene pixels */
  rect: Rect;
  /** where Mara stands to reach it */
  stand: { x: number; y: number };
  /** what a plain left click does */
  defaultVerb: 'examine' | 'use' | 'talk';
  /** draw order for props rendered by the scene (bigger = nearer the camera) */
  depth: number;
  /** shows the speech cursor */
  talkable?: boolean;
  /**
   * Large foreground props Mara walks *behind*: a click that lands on walkable
   * ground inside their rect should move her, not poke the prop. The parts of
   * the rect that are not walkable (its top, its front face) stay clickable.
   */
  groundFirst?: boolean;
}

export const HOTSPOTS: HotspotDef[] = [
  {
    id: 'transit-sign',
    label: 'Transit Sign',
    rect: { x1: 6, y1: 18, x2: 62, y2: 44 },
    stand: { x: 72, y: 156 },
    defaultVerb: 'examine',
    depth: 20,
  },
  {
    id: 'ad-display',
    label: 'Advertisement Display',
    rect: { x1: 62, y1: 26, x2: 114, y2: 74 },
    stand: { x: 88, y: 168 },
    defaultVerb: 'examine',
    depth: 20,
  },
  {
    id: 'windows',
    label: 'Tenement Windows',
    rect: { x1: 258, y1: 16, x2: 312, y2: 54 },
    stand: { x: 288, y: 172 },
    defaultVerb: 'examine',
    depth: 20,
  },
  {
    id: 'conduit',
    label: 'Utility Conduit',
    rect: { x1: 212, y1: 16, x2: 242, y2: 122 },
    stand: { x: 226, y: 160 },
    defaultVerb: 'examine',
    depth: 20,
  },
  {
    id: 'graffiti',
    label: 'Graffiti',
    rect: { x1: 152, y1: 58, x2: 214, y2: 114 },
    stand: { x: 184, y: 160 },
    defaultVerb: 'examine',
    depth: 20,
    talkable: true,
  },
  {
    id: 'stencil',
    label: 'Municipal Stencil',
    rect: { x1: 156, y1: 116, x2: 198, y2: 130 },
    stand: { x: 176, y: 158 },
    defaultVerb: 'examine',
    depth: 20,
  },
  {
    id: 'vending',
    label: 'Nutrient Dispenser',
    rect: { x1: 118, y1: 86, x2: 154, y2: 151 },
    stand: { x: 160, y: 162 },
    defaultVerb: 'use',
    depth: 151,
  },
  {
    id: 'camera',
    label: 'Surveillance Camera',
    rect: { x1: 268, y1: 60, x2: 296, y2: 82 },
    stand: { x: 272, y: 170 },
    defaultVerb: 'examine',
    depth: 20,
  },
  {
    id: 'terminal',
    label: 'Municipal Access Terminal',
    rect: { x1: 244, y1: 94, x2: 266, y2: 130 },
    stand: { x: 238, y: 160 },
    defaultVerb: 'use',
    depth: 20,
    talkable: true,
  },
  {
    id: 'door',
    label: 'Tenement Door',
    rect: { x1: 268, y1: 84, x2: 308, y2: 152 },
    stand: { x: 286, y: 162 },
    defaultVerb: 'use',
    depth: 20,
  },
  {
    id: 'drone',
    label: 'Maintenance Drone',
    rect: { x1: 214, y1: 122, x2: 248, y2: 152 },
    stand: { x: 206, y: 158 },
    defaultVerb: 'talk',
    depth: 152,
    talkable: true,
  },
  {
    id: 'grate',
    label: 'Drain Grate',
    rect: { x1: 62, y1: 154, x2: 96, y2: 172 },
    stand: { x: 79, y: 151 },
    defaultVerb: 'use',
    depth: 10,
    talkable: true,
  },
  {
    id: 'puddle',
    label: 'Puddle',
    rect: { x1: 116, y1: 156, x2: 156, y2: 175 },
    stand: { x: 136, y: 152 },
    defaultVerb: 'examine',
    depth: 10,
  },
  {
    id: 'rubble',
    label: 'Rubble Pile',
    rect: { x1: 94, y1: 138, x2: 120, y2: 154 },
    stand: { x: 107, y: 158 },
    defaultVerb: 'examine',
    depth: 153,
  },
  {
    id: 'dumpster',
    label: 'Refuse Hopper',
    rect: { x1: 18, y1: 130, x2: 66, y2: 170 },
    stand: { x: 74, y: 168 },
    defaultVerb: 'examine',
    depth: 177,
    groundFirst: true,
  },
];

export const HOTSPOT_BY_ID: Record<HotspotId, HotspotDef> = Object.fromEntries(
  HOTSPOTS.map((h) => [h.id, h]),
) as Record<HotspotId, HotspotDef>;

/** Mara has to be within this many pixels of a stand point before acting. */
export const REACH = 6;

export function rectContains(r: Rect, x: number, y: number): boolean {
  return x >= r.x1 && x < r.x2 && y >= r.y1 && y < r.y2;
}
