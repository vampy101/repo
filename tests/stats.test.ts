import { describe, expect, it } from 'vitest';
import { PURGE_RESET_ATTENTION, isSaturated, tierName, tierOf, tierProfile } from '../src/game/attention';
import { runCheck } from '../src/game/checks';
import { PROFILES, adjust, clamp, makeStats } from '../src/game/stats';

describe('stat clamping', () => {
  it('never lets health fall below zero or rise above its maximum', () => {
    const s = makeStats('courier');
    expect(adjust(s, 'health', -100)).toBe(-8);
    expect(s.health).toBe(0);
    expect(adjust(s, 'health', 999)).toBe(8);
    expect(s.health).toBe(8);
  });

  it('clamps nerve to 0..nerveMax and reports the real delta', () => {
    const s = makeStats('ghost'); // nerve 4
    expect(adjust(s, 'nerve', 10)).toBe(4); // 4 -> 8
    expect(s.nerve).toBe(8);
    expect(adjust(s, 'nerve', 2)).toBe(0); // already capped
    expect(s.nerve).toBe(8);
  });

  it('clamps attention to 0..10', () => {
    const s = makeStats('courier');
    adjust(s, 'attention', 50);
    expect(s.attention).toBe(10);
    adjust(s, 'attention', -50);
    expect(s.attention).toBe(0);
  });

  it('never lets XP go negative', () => {
    const s = makeStats('courier');
    adjust(s, 'xp', 30);
    adjust(s, 'xp', -500);
    expect(s.xp).toBe(0);
  });

  it('clamp() is inclusive at both ends', () => {
    expect(clamp(5, 1, 10)).toBe(5);
    expect(clamp(0, 1, 10)).toBe(1);
    expect(clamp(11, 1, 10)).toBe(10);
  });
});

describe('starting profiles', () => {
  it('gives every build 8 health, 1 attention and 0 XP', () => {
    for (const id of ['ghost', 'diplomat', 'courier'] as const) {
      const s = makeStats(id);
      expect(s.health).toBe(8);
      expect(s.healthMax).toBe(8);
      expect(s.attention).toBe(1);
      expect(s.xp).toBe(0);
      expect(s.nerveMax).toBe(8);
      expect(s.tech).toBe(PROFILES[id].tech);
      expect(s.streetwise).toBe(PROFILES[id].streetwise);
      expect(s.nerve).toBe(PROFILES[id].nerve);
    }
  });

  it('keeps the three builds mechanically distinct', () => {
    expect(PROFILES.ghost.tech).toBeGreaterThan(PROFILES.diplomat.tech);
    expect(PROFILES.diplomat.streetwise).toBeGreaterThan(PROFILES.ghost.streetwise);
    expect(PROFILES.courier.nerve).toBeGreaterThan(PROFILES.ghost.nerve);
  });
});

describe('city attention tiers', () => {
  it('maps the documented thresholds', () => {
    expect([1, 2, 3].map(tierOf)).toEqual([1, 1, 1]);
    expect([4, 5, 6].map(tierOf)).toEqual([2, 2, 2]);
    expect([7, 8].map(tierOf)).toEqual([3, 3]);
    expect(tierOf(9)).toBe(4);
    expect(tierOf(10)).toBe(5);
  });

  it('only tracks Mara with the camera from tier 2 up', () => {
    expect(tierProfile(3).cameraTracks).toBe(false);
    expect(tierProfile(4).cameraTracks).toBe(true);
  });

  it('only makes the terminal suspicious from tier 3 up', () => {
    expect(tierProfile(6).terminalSuspicious).toBe(false);
    expect(tierProfile(7).terminalSuspicious).toBe(true);
  });

  it('whispers more often as attention climbs', () => {
    expect(tierProfile(9).whisperEvery).toBeLessThan(tierProfile(1).whisperEvery);
  });

  it('saturates only at a full 10 and resets somewhere survivable', () => {
    expect(isSaturated(9)).toBe(false);
    expect(isSaturated(10)).toBe(true);
    expect(PURGE_RESET_ATTENTION).toBeGreaterThan(0);
    expect(PURGE_RESET_ATTENTION).toBeLessThan(10);
    expect(tierName(PURGE_RESET_ATTENTION)).toBe('ATTENTIVE');
  });
});

describe('stat checks are deterministic', () => {
  it('grades on score vs target with a one-point partial band', () => {
    const spec = { kind: 'TECH', base: 4, target: 5 } as const;
    expect(runCheck(spec).grade).toBe('PARTIAL SUCCESS');
    expect(runCheck({ ...spec, base: 5 }).grade).toBe('SUCCESS');
    expect(runCheck({ ...spec, base: 3 }).grade).toBe('FAILED');
  });

  it('returns the same result for the same input, every time', () => {
    const spec = {
      kind: 'NERVE' as const,
      base: 4,
      target: 5,
      mods: [{ label: 'fixed the drone', value: 1 }],
    };
    const runs = Array.from({ length: 25 }, () => runCheck(spec).grade);
    expect(new Set(runs).size).toBe(1);
    expect(runs[0]).toBe('SUCCESS');
  });

  it('reports preparation as readable notes and drops zero-value mods', () => {
    const r = runCheck({
      kind: 'STREETWISE',
      base: 3,
      target: 4,
      mods: [
        { label: 'read the stencil', value: 2 },
        { label: 'nothing at all', value: 0 },
        { label: 'the terminal dislikes you', value: -1 },
      ],
    });
    expect(r.score).toBe(4);
    expect(r.grade).toBe('SUCCESS');
    expect(r.notes).toEqual(['+2 read the stencil', '-1 the terminal dislikes you']);
  });
});
