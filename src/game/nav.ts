import type { Rect } from '../data/scene';

export interface Pt {
  x: number;
  y: number;
}

const SQRT2 = Math.SQRT2;

/**
 * A 1px walkability grid over the scene, plus A* with string-pulled paths.
 * Mara's feet are the navigating point; props punch rectangles out of the
 * ground band so she can never walk through the hopper, the plinth or the
 * charging recess.
 */
export class NavMesh {
  readonly w: number;
  readonly h: number;
  private readonly ground: Rect;
  private readonly walk: Uint8Array;

  constructor(ground: Rect, blockers: Rect[], w = 320, h = 180) {
    this.w = w;
    this.h = h;
    this.ground = ground;
    this.walk = new Uint8Array(w * h);
    for (let y = Math.max(0, ground.y1); y < Math.min(h, ground.y2); y++) {
      for (let x = Math.max(0, ground.x1); x < Math.min(w, ground.x2); x++) {
        this.walk[y * w + x] = 1;
      }
    }
    for (const b of blockers) {
      for (let y = Math.max(0, b.y1); y < Math.min(h, b.y2); y++) {
        for (let x = Math.max(0, b.x1); x < Math.min(w, b.x2); x++) {
          this.walk[y * w + x] = 0;
        }
      }
    }
  }

  isWalkable(x: number, y: number): boolean {
    const ix = Math.round(x);
    const iy = Math.round(y);
    if (ix < 0 || iy < 0 || ix >= this.w || iy >= this.h) return false;
    return this.walk[iy * this.w + ix] === 1;
  }

  /**
   * Closest walkable pixel. A click high on a wall is first pulled down into
   * the ground band — the whole walkable area is one horizontal strip — and
   * only then ring-searched, so a short radius is always enough.
   */
  nearestWalkable(x: number, y: number, maxRadius = 72): Pt | null {
    if (this.isWalkable(x, y)) return { x: Math.round(x), y: Math.round(y) };
    const seedX = Math.round(clampTo(x, this.ground.x1, this.ground.x2 - 1));
    const seedY = Math.round(clampTo(y, this.ground.y1, this.ground.y2 - 1));
    if (this.isWalkable(seedX, seedY)) return { x: seedX, y: seedY };
    for (let r = 1; r <= maxRadius; r++) {
      let best: Pt | null = null;
      let bestD = Infinity;
      const consider = (nx: number, ny: number) => {
        if (!this.isWalkable(nx, ny)) return;
        const d = (nx - x) * (nx - x) + (ny - y) * (ny - y);
        if (d < bestD) {
          bestD = d;
          best = { x: nx, y: ny };
        }
      };
      // walk the ring perimeter only
      for (let dx = -r; dx <= r; dx++) {
        consider(seedX + dx, seedY - r);
        consider(seedX + dx, seedY + r);
      }
      for (let dy = -r + 1; dy <= r - 1; dy++) {
        consider(seedX - r, seedY + dy);
        consider(seedX + r, seedY + dy);
      }
      if (best) return best;
    }
    return null;
  }

  /** Unobstructed straight line between two points? Sampled at half-pixel steps. */
  lineClear(a: Pt, b: Pt): boolean {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const steps = Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)) * 2);
    if (steps === 0) return this.isWalkable(a.x, a.y);
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      if (!this.isWalkable(a.x + dx * t, a.y + dy * t)) return false;
    }
    return true;
  }

  /**
   * A* on the pixel grid, then string-pulled down to the corners that matter.
   * Returns [] when there is no route (never happens with this scene's layout,
   * but the caller must not assume).
   */
  findPath(from: Pt, to: Pt): Pt[] {
    const start = this.nearestWalkable(from.x, from.y);
    const goal = this.nearestWalkable(to.x, to.y);
    if (!start || !goal) return [];
    if (start.x === goal.x && start.y === goal.y) return [];
    if (this.lineClear(start, goal)) return [goal];

    const { w } = this;
    const startI = start.y * w + start.x;
    const goalI = goal.y * w + goal.x;

    const g = new Map<number, number>();
    const came = new Map<number, number>();
    const open: { i: number; f: number }[] = [];
    g.set(startI, 0);
    open.push({ i: startI, f: this.octile(start, goal) });
    const closed = new Set<number>();

    let guard = 0;
    while (open.length && guard++ < 200_000) {
      // Small binary-heap-free pop: the frontier in this scene stays short.
      let bi = 0;
      for (let k = 1; k < open.length; k++) if (open[k].f < open[bi].f) bi = k;
      const cur = open.splice(bi, 1)[0];
      if (cur.i === goalI) return this.smooth(this.rebuild(came, goalI), start);
      if (closed.has(cur.i)) continue;
      closed.add(cur.i);

      const cx = cur.i % w;
      const cy = (cur.i - cx) / w;
      const gc = g.get(cur.i) ?? Infinity;

      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          const nx = cx + dx;
          const ny = cy + dy;
          if (!this.isWalkable(nx, ny)) continue;
          // No squeezing diagonally between two blocked cells.
          if (dx !== 0 && dy !== 0 && (!this.isWalkable(cx + dx, cy) || !this.isWalkable(cx, cy + dy))) {
            continue;
          }
          const ni = ny * w + nx;
          if (closed.has(ni)) continue;
          const step = dx !== 0 && dy !== 0 ? SQRT2 : 1;
          const ng = gc + step;
          if (ng < (g.get(ni) ?? Infinity)) {
            g.set(ni, ng);
            came.set(ni, cur.i);
            open.push({ i: ni, f: ng + this.octile({ x: nx, y: ny }, goal) });
          }
        }
      }
    }
    return [];
  }

  private octile(a: Pt, b: Pt): number {
    const dx = Math.abs(a.x - b.x);
    const dy = Math.abs(a.y - b.y);
    return dx + dy + (SQRT2 - 2) * Math.min(dx, dy);
  }

  private rebuild(came: Map<number, number>, goalI: number): Pt[] {
    const out: Pt[] = [];
    let cur: number | undefined = goalI;
    let guard = 0;
    while (cur !== undefined && guard++ < 100_000) {
      out.push({ x: cur % this.w, y: Math.floor(cur / this.w) });
      cur = came.get(cur);
    }
    return out.reverse();
  }

  /** String-pulling: drop every waypoint we can see past. */
  private smooth(path: Pt[], start: Pt): Pt[] {
    if (path.length === 0) return [];
    const out: Pt[] = [];
    let anchor = start;
    let i = 0;
    while (i < path.length) {
      let furthest = i;
      for (let j = path.length - 1; j > i; j--) {
        if (this.lineClear(anchor, path[j])) {
          furthest = j;
          break;
        }
      }
      out.push(path[furthest]);
      anchor = path[furthest];
      if (furthest === path.length - 1) break;
      i = furthest + 1;
    }
    return out;
  }
}

function clampTo(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}
