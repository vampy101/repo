import { describe, expect, it } from 'vitest';
import { Engine } from '../src/game/engine';
import { SAVE_KEY, clearSave, deserialize, hasSave, load, memoryStorage, save, serialize } from '../src/game/save';
import { SAVE_VERSION, newGame } from '../src/game/state';
import { runSocialPath, runTechnicalPath } from './helpers';

describe('save round-trip', () => {
  it('preserves items, puzzle stages, statistics and dialogue choices', () => {
    const e = new Engine(newGame('diplomat'));
    e.examine('vending');
    e.interact('vending');
    e.use('strip', 'grate');
    e.talk('drone');
    e.choose('drone', 'kind');
    e.closePrompt();
    e.talk('terminal');
    e.choose('terminal', 'fault');
    e.closePrompt();
    e.state.selected = 'badge';

    const store = memoryStorage();
    save(e.state, store);
    const back = load(store);
    expect(back).not.toBeNull();
    expect(back!.inventory.sort()).toEqual(e.state.inventory.sort());
    expect(back!.flags.gotBadge).toBe(true);
    expect(back!.flags.complaintFiled).toBe(true);
    expect(back!.flags.droneAdvice).toBe(true);
    expect(back!.counters.graffitiStage).toBe(e.state.counters.graffitiStage);
    expect(back!.stats).toEqual(e.state.stats);
    expect(back!.spent).toContain('drone:kind');
    expect(back!.spent).toContain('terminal:fault');
    expect(back!.selected).toBe('badge');
    expect(back!.profile).toBe('diplomat');
  });

  it('restores a finished scene as finished', () => {
    const e = new Engine(newGame('ghost'));
    runTechnicalPath(e);
    const store = memoryStorage();
    save(e.state, store);
    const back = load(store)!;
    expect(back.flags.entered).toBe(true);
    expect(back.door).toBe('open');
    expect(back.win).toBe('technical');
    expect(new Engine(back).summary().path).toBe('technical');
  });

  it('lets a restored scene carry on to a win', () => {
    const e = new Engine(newGame('courier'));
    e.examine('vending');
    e.interact('vending');
    if (!e.has('strip')) e.use('knife', 'vending');
    e.use('strip', 'grate');
    const store = memoryStorage();
    save(e.state, store);

    const resumed = new Engine(load(store)!);
    expect(resumed.has('badge')).toBe(true);
    resumed.talk('terminal');
    resumed.choose('terminal', 'fault');
    resumed.closePrompt();
    resumed.use('badge', 'terminal');
    resumed.choose('bluff-sector', 'twelve');
    resumed.choose('bluff-unit', 'sw9');
    resumed.choose('bluff-blank', 'burned');
    resumed.interact('door');
    expect(resumed.flag('entered')).toBe(true);
  });

  it('clear-save really clears it', () => {
    const store = memoryStorage();
    save(newGame('ghost'), store);
    expect(hasSave(store)).toBe(true);
    clearSave(store);
    expect(hasSave(store)).toBe(false);
    expect(load(store)).toBeNull();
    expect(store.getItem(SAVE_KEY)).toBeNull();
  });
});

describe('save validation', () => {
  it('rejects nothing, junk and truncated writes', () => {
    expect(deserialize(null)).toBeNull();
    expect(deserialize('')).toBeNull();
    expect(deserialize('{"version"')).toBeNull();
    expect(deserialize('[]')).toBeNull();
    expect(deserialize('"a string"')).toBeNull();
    expect(deserialize('12')).toBeNull();
  });

  it('rejects a save from another version', () => {
    const raw = JSON.parse(serialize(newGame('ghost')));
    raw.version = SAVE_VERSION - 1;
    expect(deserialize(JSON.stringify(raw))).toBeNull();
  });

  it('clamps out-of-range statistics rather than loading them', () => {
    const raw = JSON.parse(serialize(newGame('ghost')));
    raw.stats.health = 900;
    raw.stats.nerve = -40;
    raw.stats.attention = 77;
    raw.stats.xp = -5;
    raw.stats.tech = 999;
    const back = deserialize(JSON.stringify(raw))!;
    expect(back.stats.health).toBe(8);
    expect(back.stats.nerve).toBe(0);
    expect(back.stats.attention).toBe(10);
    expect(back.stats.xp).toBe(0);
    expect(back.stats.tech).toBe(12);
  });

  it('drops unknown items, hotspots and profiles', () => {
    const raw = JSON.parse(serialize(newGame('ghost')));
    raw.profile = 'wizard';
    raw.inventory = ['knife', 'plasma-rifle', 'knife', 42, null];
    raw.examined = ['puddle', 'moon', 'puddle'];
    raw.door = 'ajar';
    raw.win = 'flawless';
    const back = deserialize(JSON.stringify(raw))!;
    expect(back.profile).toBe('courier');
    expect(back.inventory).toEqual(['knife']);
    expect(back.examined).toEqual(['puddle']);
    expect(back.door).toBe('locked');
    expect(back.win).toBeNull();
  });

  it('only keeps flags that are literally true', () => {
    const raw = JSON.parse(serialize(newGame('ghost')));
    raw.flags = { gotBadge: true, gotStrip: 'yes', droneRepaired: 1, purged: false };
    const back = deserialize(JSON.stringify(raw))!;
    expect(back.flags.gotBadge).toBe(true);
    expect(back.flags.gotStrip).toBeUndefined();
    expect(back.flags.droneRepaired).toBeUndefined();
    expect(back.flags.purged).toBeUndefined();
  });

  it('repairs impossible combinations instead of loading a broken scene', () => {
    const raw = JSON.parse(serialize(newGame('ghost')));
    // flags say she has things the inventory lost
    raw.flags = { gotBadge: true, gotStrip: true, droneRepaired: true, badgeSpliced: true };
    raw.inventory = ['knife'];
    // and a door that claims to be open with nobody having entered
    raw.door = 'open';
    const back = deserialize(JSON.stringify(raw))!;
    expect(back.inventory).toContain('badge');
    expect(back.inventory).toContain('strip');
    expect(back.inventory).toContain('key');
    expect(back.door).toBe('locked');
  });

  it('cannot load a disconnected door with no winning path attached', () => {
    const raw = JSON.parse(serialize(newGame('ghost')));
    raw.door = 'disconnected';
    raw.win = null;
    expect(deserialize(JSON.stringify(raw))!.door).toBe('locked');
  });

  it('drops a splice claim when there is no badge to splice', () => {
    const raw = JSON.parse(serialize(newGame('ghost')));
    raw.flags = { badgeSpliced: true };
    expect(deserialize(JSON.stringify(raw))!.flags.badgeSpliced).toBe(false);
  });

  it('does not hand back a ration that was already eaten', () => {
    const raw = JSON.parse(serialize(newGame('ghost')));
    raw.flags = { gotRation: true, ateRation: true };
    raw.inventory = ['knife', 'ration'];
    expect(deserialize(JSON.stringify(raw))!.inventory).not.toContain('ration');
  });

  it('never selects an item that is not carried', () => {
    const raw = JSON.parse(serialize(newGame('ghost')));
    raw.selected = 'badge';
    raw.inventory = ['knife'];
    expect(deserialize(JSON.stringify(raw))!.selected).toBeNull();
  });

  it('survives a storage backend that throws', () => {
    const hostile = {
      getItem() {
        throw new Error('nope');
      },
      setItem() {
        throw new Error('nope');
      },
      removeItem() {
        throw new Error('nope');
      },
    };
    expect(() => save(newGame('ghost'), hostile)).not.toThrow();
    expect(load(hostile)).toBeNull();
    expect(() => clearSave(hostile)).not.toThrow();
  });
});

describe('serialisation is stable', () => {
  it('produces identical output for identical state', () => {
    const a = new Engine(newGame('courier'));
    const b = new Engine(newGame('courier'));
    runSocialPath(a);
    runSocialPath(b);
    a.state.elapsed = 0;
    b.state.elapsed = 0;
    expect(serialize(a.state)).toBe(serialize(b.state));
  });

  it('always stamps the current version', () => {
    const raw = JSON.parse(serialize({ ...newGame('ghost'), version: 1 }));
    expect(raw.version).toBe(SAVE_VERSION);
  });
});
