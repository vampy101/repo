import { describe, expect, it } from 'vitest';
import { BLIND_SPOT, BLOCKERS, GROUND, HOTSPOTS, START_POS, rectContains } from '../src/data/scene';
import { NavMesh } from '../src/game/nav';

const nav = new NavMesh(GROUND, BLOCKERS, 320, 180);

describe('the walkable area', () => {
  it('accepts the ground band and rejects the walls', () => {
    expect(nav.isWalkable(160, 170)).toBe(true);
    expect(nav.isWalkable(160, 100)).toBe(false); // wall
    expect(nav.isWalkable(160, 179)).toBe(false); // below the band
    expect(nav.isWalkable(2, 170)).toBe(false); // outside the alley mouth
  });

  it('punches out every prop footprint', () => {
    for (const b of BLOCKERS) {
      const cx = Math.floor((b.x1 + b.x2) / 2);
      const cy = Math.floor((b.y1 + b.y2) / 2);
      if (cy >= GROUND.y1 && cy < GROUND.y2) expect(nav.isWalkable(cx, cy)).toBe(false);
    }
  });

  it('starts Mara somewhere legal', () => {
    expect(nav.isWalkable(START_POS.x, START_POS.y)).toBe(true);
  });

  it('puts every hotspot stand point on walkable ground', () => {
    for (const h of HOTSPOTS) {
      expect(nav.isWalkable(h.stand.x, h.stand.y), `${h.id} stand point`).toBe(true);
    }
  });
});

describe('pathfinding', () => {
  it('walks straight when the line is clear', () => {
    const path = nav.findPath({ x: 100, y: 170 }, { x: 200, y: 170 });
    expect(path).toEqual([{ x: 200, y: 170 }]);
  });

  it('snaps a target inside the dispenser plinth to the floor in front of it', () => {
    // (136, 145) is inside a blocker; the nearest legal pixel is its front edge.
    const path = nav.findPath({ x: 136, y: 172 }, { x: 136, y: 145 });
    expect(path.length).toBeGreaterThan(0);
    const last = path.at(-1)!;
    expect(nav.isWalkable(last.x, last.y)).toBe(true);
    expect(last.y).toBe(151);
    for (const p of path) expect(nav.isWalkable(p.x, p.y)).toBe(true);
  });

  it('never produces a leg that crosses a blocker', () => {
    const legs: [{ x: number; y: number }, { x: number; y: number }][] = [];
    let cur = { x: 300, y: 170 };
    const path = nav.findPath(cur, { x: 40, y: 150 }); // behind the hopper
    expect(path.length).toBeGreaterThan(0);
    for (const p of path) {
      legs.push([cur, p]);
      cur = p;
    }
    for (const [a, b] of legs) expect(nav.lineClear(a, b)).toBe(true);
  });

  it('can reach the blind spot behind the hopper from the alley mouth', () => {
    const target = { x: 40, y: 150 };
    expect(rectContains(BLIND_SPOT, target.x, target.y)).toBe(true);
    const path = nav.findPath(START_POS, target);
    expect(path.length).toBeGreaterThan(0);
    expect(path.at(-1)).toEqual(target);
  });

  it('can reach every hotspot stand point from the start', () => {
    for (const h of HOTSPOTS) {
      const path = nav.findPath(START_POS, h.stand);
      const arrived = path.at(-1) ?? START_POS;
      expect(Math.hypot(arrived.x - h.stand.x, arrived.y - h.stand.y), `${h.id}`).toBeLessThan(3);
    }
  });

  it('snaps a click on a wall to the nearest walkable pixel', () => {
    const p = nav.nearestWalkable(200, 60);
    expect(p).not.toBeNull();
    expect(nav.isWalkable(p!.x, p!.y)).toBe(true);
    expect(p!.y).toBe(GROUND.y1);
  });

  it('returns an empty path when asked to stand where it already is', () => {
    expect(nav.findPath({ x: 160, y: 170 }, { x: 160, y: 170 })).toEqual([]);
  });

  it('clamps a click from outside the canvas into the alley', () => {
    const p = nav.nearestWalkable(-500, -500);
    expect(p).not.toBeNull();
    expect(nav.isWalkable(p!.x, p!.y)).toBe(true);
    const path = nav.findPath({ x: 160, y: 170 }, { x: -500, y: -500 });
    for (const step of path) expect(nav.isWalkable(step.x, step.y)).toBe(true);
  });

  it('returns no path at all when nothing walkable exists', () => {
    const sealed = new NavMesh({ x1: 0, y1: 0, x2: 0, y2: 0 }, [], 320, 180);
    expect(sealed.nearestWalkable(160, 170)).toBeNull();
    expect(sealed.findPath({ x: 10, y: 10 }, { x: 20, y: 20 })).toEqual([]);
  });

  it('smooths paths down to a handful of corners', () => {
    const path = nav.findPath({ x: 300, y: 170 }, { x: 30, y: 148 });
    expect(path.length).toBeLessThanOrEqual(6);
  });
});
