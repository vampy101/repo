import { describe, expect, it } from 'vitest';
import { Engine } from '../src/game/engine';
import { newGame } from '../src/game/state';
import { ALL_PROFILES, makeEngine, runHiddenPath, runSocialPath, runTechnicalPath } from './helpers';

describe('the technical path', () => {
  it.each(ALL_PROFILES)('is completable as %s', (profile) => {
    const e = makeEngine(profile);
    runTechnicalPath(e);
    expect(e.has('badge')).toBe(true);
    expect(e.flag('droneRepaired')).toBe(true);
    expect(e.has('key')).toBe(true);
    expect(e.flag('badgeSpliced')).toBe(true);
    expect(e.state.door).toBe('open');
    expect(e.flag('entered')).toBe(true);
    expect(e.state.win).toBe('technical');
    expect(e.state.stats.xp).toBeGreaterThan(150);
  });

  it('needs the maintenance window before the spliced badge is accepted', () => {
    const e = makeEngine('ghost');
    e.examine('vending');
    e.interact('vending');
    e.use('strip', 'grate');
    e.use('shard', 'badge');
    expect(e.flag('badgeSpliced')).toBe(true);
    const before = e.state.stats.attention;
    e.use('badge', 'terminal');
    // No open work order and no fault report: refused, and it says why.
    expect(e.state.door).toBe('locked');
    expect(e.state.stats.attention).toBe(before);
  });

  it('refuses maintenance mode without a service record to write from', () => {
    const e = makeEngine('ghost');
    e.examine('vending');
    e.interact('vending');
    e.use('strip', 'grate');
    e.talk('drone');
    e.choose('drone', 'fix');
    e.closePrompt();
    e.use('key', 'terminal');
    expect(e.flag('terminalMaintenance')).toBe(true);
    const r = e.use('badge', 'terminal'); // badge not spliced yet
    expect(r.refused).toBe(true);
    expect(e.state.door).toBe('locked');
    e.use('shard', 'badge');
    e.use('badge', 'terminal');
    expect(e.state.door).toBe('disconnected');
    expect(e.state.win).toBe('technical');
  });
});

describe('the streetwise path', () => {
  it.each(ALL_PROFILES)('is completable as %s', (profile) => {
    const e = makeEngine(profile);
    runSocialPath(e);
    expect(e.flag('complaintFiled')).toBe(true);
    expect(e.flag('bluffSector')).toBe(true);
    expect(e.flag('bluffUnit')).toBe(true);
    expect(e.state.win).toBe('social');
    expect(e.flag('entered')).toBe(true);
    expect(e.flag('badgeSpliced')).toBe(false);
  });

  it('will not file a fault Mara has not actually seen', () => {
    const e = makeEngine('diplomat');
    e.talk('terminal');
    const r = e.choose('terminal', 'fault');
    expect(r.refused).toBe(true);
    expect(e.flag('complaintFiled')).toBe(false);
  });

  it('lets a wrong answer be corrected instead of ending the run', () => {
    const e = makeEngine('courier');
    e.examine('vending');
    e.interact('vending');
    e.use('strip', 'grate');
    e.talk('terminal');
    e.choose('terminal', 'fault');
    e.closePrompt();
    e.use('badge', 'terminal');
    const wrong = e.choose('bluff-sector', 'nine');
    expect(e.flag('bluffSector')).toBe(false);
    expect(e.state.stats.attention).toBeGreaterThan(1);
    expect(wrong.prompt?.id).toBe('bluff-sector'); // asked again
    e.choose('bluff-sector', 'twelve');
    e.choose('bluff-unit', 'sw9');
    e.choose('bluff-blank', 'burned');
    expect(e.state.door).toBe('disconnected');
  });

  it('lets high Streetwise deflect the sector question entirely', () => {
    const e = makeEngine('diplomat');
    e.examine('vending');
    e.interact('vending');
    e.use('strip', 'grate');
    e.talk('terminal');
    e.choose('terminal', 'fault');
    e.closePrompt();
    e.use('badge', 'terminal');
    const r = e.choose('bluff-sector', 'dodge');
    expect(r.check?.grade).toBe('SUCCESS');
    expect(e.flag('bluffSector')).toBe(true);
  });

  it('does not let low Streetwise bluff its way past the unit question', () => {
    const e = makeEngine('ghost'); // streetwise 2
    e.examine('vending');
    e.interact('vending');
    e.use('strip', 'grate');
    e.talk('terminal');
    e.choose('terminal', 'fault');
    e.closePrompt();
    e.use('badge', 'terminal');
    e.choose('bluff-sector', 'twelve');
    const r = e.choose('bluff-unit', 'dodge');
    expect(r.check?.grade).not.toBe('SUCCESS');
    expect(e.flag('bluffUnit')).toBe(false);
    // ...but naming the unit still works.
    e.choose('bluff-unit', 'sw9');
    expect(e.flag('bluffUnit')).toBe(true);
  });
});

describe('the hidden path', () => {
  it.each(ALL_PROFILES)('is completable as %s', (profile) => {
    const e = makeEngine(profile);
    runHiddenPath(e);
    expect(e.flag('civicAsked')).toBe(true);
    expect(e.flag('civicAnswered')).toBe(true);
    expect(e.state.win).toBe('hidden');
    expect(e.flag('entered')).toBe(true);
    expect(e.graffitiStage).toBe(3);
  });

  it('does not offer CIVIC\'s question on a first, casual word to the wall', () => {
    const e = makeEngine('courier');
    e.talk('graffiti');
    expect(e.flag('civicAsked')).toBe(false);
    e.talk('grate');
    expect(e.flag('civicAsked')).toBe(false);
  });

  it('re-asks after a dishonest answer instead of closing the route', () => {
    const e = makeEngine('courier');
    runHiddenPathToQuestion(e);
    const r = e.choose('civic', 'job');
    expect(e.flag('civicAnswered')).toBe(false);
    expect(r.prompt?.id).toBe('civic');
    e.choose('civic', 'consent');
    expect(e.flag('civicAnswered')).toBe(true);
  });
});

function runHiddenPathToQuestion(e: Engine): void {
  e.examine('graffiti');
  e.examine('vending');
  e.interact('vending');
  if (!e.has('strip')) e.use('knife', 'vending');
  e.examine('graffiti');
  e.use('strip', 'grate');
  e.examine('graffiti');
  e.talk('drone');
  e.choose('drone', 'kind');
  e.closePrompt();
  e.talk('drone');
  e.closePrompt();
  e.talk('graffiti');
  e.talk('graffiti');
}

describe('the graffiti wall', () => {
  it('only changes while Mara is doing something else, and only after she has read it', () => {
    const e = makeEngine();
    e.examine('vending');
    e.interact('vending'); // a key action, but the wall has never been read
    expect(e.graffitiStage).toBe(0);
    e.examine('graffiti');
    expect(e.graffitiStage).toBe(0);
    e.use('strip', 'grate'); // now it has something to answer
    expect(e.graffitiStage).toBe(1);
    expect(e.flag('graffitiFresh')).toBe(true);
  });

  it('will not skip a change the player has not seen yet', () => {
    const e = makeEngine();
    e.examine('graffiti');
    e.examine('vending');
    e.interact('vending');
    expect(e.graffitiStage).toBe(1);
    e.use('strip', 'grate'); // still unseen: no double jump
    expect(e.graffitiStage).toBe(1);
    e.examine('graffiti');
    expect(e.flag('graffitiFresh')).toBe(false);
  });

  it('reads the documented text at each stage', () => {
    const e = makeEngine();
    expect(e.graffitiText).toBe('THE CITY SEES EVERYTHING');
    e.state.counters.graffitiStage = 1;
    expect(e.graffitiText).toBe('EVERYTHING SEES THE CITY');
    e.state.counters.graffitiStage = 2;
    expect(e.graffitiText).toContain('MARA VEY');
  });
});

describe('the drain grate', () => {
  it('costs one health for the bare-handed attempt, and only once', () => {
    const e = makeEngine();
    e.interact('grate');
    expect(e.state.stats.health).toBe(7);
    expect(e.flag('reachedIntoDrain')).toBe(true);
    const r = e.interact('grate');
    expect(r.refused).toBe(true);
    expect(e.state.stats.health).toBe(7);
  });

  it('gives up the badge to the magnetic strip and then stays empty', () => {
    const e = makeEngine();
    e.examine('vending');
    e.interact('vending');
    e.use('strip', 'grate');
    expect(e.has('badge')).toBe(true);
    const again = e.use('strip', 'grate');
    expect(again.refused).toBe(true);
    expect(e.state.inventory.filter((i) => i === 'badge')).toHaveLength(1);
  });
});

describe('the dispenser', () => {
  it('always yields the strip somehow, for every build', () => {
    for (const profile of ALL_PROFILES) {
      const e = makeEngine(profile);
      e.interact('vending'); // no preparation at all
      if (!e.has('strip')) e.use('knife', 'vending');
      expect(e.has('strip')).toBe(true);
    }
  });

  it('rewards looking at it first', () => {
    const bare = makeEngine('courier');
    const bareResult = bare.interact('vending');
    const prepared = makeEngine('courier');
    prepared.examine('vending');
    const preparedResult = prepared.interact('vending');
    expect(bareResult.check?.score).toBe(3);
    expect(preparedResult.check?.score).toBe(4);
    expect(preparedResult.check?.grade).toBe('SUCCESS');
    expect(bareResult.check?.grade).not.toBe('SUCCESS');
  });

  it('costs attention when the knife does the talking', () => {
    const e = makeEngine('courier');
    const before = e.state.stats.attention;
    e.use('knife', 'vending');
    expect(e.has('strip')).toBe(true);
    expect(e.state.stats.attention).toBe(before + 1);
    expect(e.flag('vendPried')).toBe(true);
  });
});

describe('the drone', () => {
  it('cannot be repaired by low Tech without its own advice', () => {
    const e = makeEngine('diplomat'); // tech 2
    e.talk('drone');
    const r = e.choose('drone', 'fix');
    expect(r.check?.grade).not.toBe('SUCCESS');
    expect(e.flag('droneRepaired')).toBe(false);
    expect(e.has('key')).toBe(false);
  });

  it('hands over the diagnostic key once kindness has unlocked the advice', () => {
    const e = makeEngine('diplomat');
    e.talk('drone');
    e.choose('drone', 'kind');
    expect(e.flag('droneAdvice')).toBe(true);
    const r = e.choose('drone', 'fix');
    expect(r.check?.grade).toBe('SUCCESS');
    expect(e.has('key')).toBe(true);
  });

  it('lowers attention when serviced and raises it when shoved', () => {
    const kind = makeEngine('ghost');
    kind.state.stats.attention = 5;
    kind.talk('drone');
    kind.choose('drone', 'fix');
    expect(kind.state.stats.attention).toBe(4);

    const cruel = makeEngine('ghost');
    cruel.talk('drone');
    cruel.choose('drone', 'shove');
    expect(cruel.state.stats.attention).toBe(2);
    expect(cruel.flag('droneKicked')).toBe(true);
  });
});

describe('the terminal', () => {
  it('escalates the first few failed scans and then stops caring', () => {
    const e = makeEngine();
    e.interact('terminal');
    expect(e.state.stats.attention).toBe(2);
    e.interact('terminal');
    e.interact('terminal');
    e.interact('terminal');
    const capped = e.state.stats.attention;
    e.interact('terminal');
    e.interact('terminal');
    expect(e.state.stats.attention).toBe(capped);
  });

  it('teaches the service-credential loophole on the very first refusal', () => {
    const e = makeEngine();
    e.interact('terminal');
    expect(e.flag('knowsServiceCreds')).toBe(true);
  });
});

describe('splicing the credential', () => {
  it('needs the badge in hand', () => {
    const e = makeEngine('ghost');
    const r = e.use('shard', 'badge');
    expect(r.refused).toBe(true);
    expect(e.flag('badgeSpliced')).toBe(false);
  });

  it('fails loudly for low Tech with no work order, and stays retryable', () => {
    const e = makeEngine('diplomat'); // tech 2
    e.examine('vending');
    e.interact('vending');
    e.use('strip', 'grate');
    const r = e.use('shard', 'badge');
    expect(r.check?.grade).toBe('FAILED');
    expect(e.flag('badgeSpliced')).toBe(false);
    expect(e.state.stats.attention).toBeGreaterThan(1);
    expect(e.has('badge')).toBe(true); // nothing was destroyed
  });

  it('gets low Tech to a partial with the key, and to a clean splice with homework', () => {
    const rough = makeEngine('diplomat'); // tech 2
    prepDroneAndBadge(rough);
    const r1 = rough.use('shard', 'badge');
    expect(r1.check?.score).toBe(4); // 2 tech + 2 work order
    expect(r1.check?.grade).toBe('PARTIAL SUCCESS');
    expect(rough.flag('badgeSpliced')).toBe(true); // messy, but it holds

    const careful = makeEngine('diplomat');
    careful.examine('terminal'); // learns what the holder field wants
    prepDroneAndBadge(careful);
    const r2 = careful.use('shard', 'badge');
    expect(r2.check?.score).toBe(5);
    expect(r2.check?.grade).toBe('SUCCESS');
    expect(careful.state.stats.attention).toBeLessThan(rough.state.stats.attention);
  });
});

function prepDroneAndBadge(e: Engine): void {
  e.examine('vending');
  e.interact('vending');
  if (!e.has('strip')) e.use('knife', 'vending');
  e.use('strip', 'grate');
  e.talk('drone');
  e.choose('drone', 'kind');
  e.choose('drone', 'fix');
  e.closePrompt();
}

describe('invalid state transitions', () => {
  it('cannot open a locked door by pushing it', () => {
    const e = makeEngine();
    const r = e.interact('door');
    expect(r.refused).toBe(true);
    expect(e.state.door).toBe('locked');
    expect(e.flag('entered')).toBe(false);
  });

  it('ignores a choice for a prompt that is not open', () => {
    const e = makeEngine();
    const r = e.choose('bluff-blank', 'burned');
    expect(r.refused).toBe(true);
    expect(e.state.door).toBe('locked');
  });

  it('ignores using an item Mara is not carrying', () => {
    const e = makeEngine();
    const r = e.use('key', 'terminal');
    expect(r.refused).toBe(true);
    expect(e.flag('terminalMaintenance')).toBe(false);
  });

  it('leaves state untouched for nonsense item combinations', () => {
    const e = makeEngine();
    const before = JSON.stringify(e.state);
    for (const target of ['door', 'camera', 'windows', 'conduit', 'rubble', 'graffiti'] as const) {
      const r = e.use('knife', target);
      expect(r.refused).toBe(true);
      expect(r.lines.length).toBeGreaterThan(0);
    }
    expect(JSON.stringify(e.state)).toBe(before);
  });

  it('gives every nonsense combination its own words', () => {
    const e = makeEngine();
    const said = new Set<string>();
    for (const target of ['door', 'camera', 'conduit', 'dumpster', 'windows', 'stencil'] as const) {
      said.add(e.use('knife', target).lines[0].text);
    }
    expect(said.size).toBe(6);
  });

  it('cannot re-enter a door that is already open', () => {
    const e = makeEngine('ghost');
    runTechnicalPath(e);
    const xp = e.state.stats.xp;
    e.interact('door');
    expect(e.state.stats.xp).toBe(xp);
  });
});

describe('the sanitation sweep', () => {
  it('fires at 10, resets attention, and keeps everything Mara earned', () => {
    const e = makeEngine('ghost');
    e.examine('vending');
    e.interact('vending');
    e.use('strip', 'grate');
    e.state.stats.attention = 9;
    e.raise(3, 'test');
    expect(e.flag('purged')).toBe(true);
    expect(e.state.stats.attention).toBe(5);
    expect(e.has('badge')).toBe(true);
    expect(e.has('strip')).toBe(true);
    expect(e.flag('gotBadge')).toBe(true);
  });

  it('relocks a door that had already been talked open', () => {
    const e = makeEngine('ghost');
    runSocialPath(makeEngine('ghost')); // sanity: the helper works
    const f = makeEngine('ghost');
    f.examine('vending');
    f.interact('vending');
    f.use('strip', 'grate');
    f.talk('terminal');
    f.choose('terminal', 'fault');
    f.closePrompt();
    f.use('badge', 'terminal');
    f.choose('bluff-sector', 'twelve');
    f.choose('bluff-unit', 'sw9');
    f.choose('bluff-blank', 'burned');
    expect(f.state.door).toBe('disconnected');
    f.state.stats.attention = 9;
    f.raise(2, 'test');
    expect(f.state.door).toBe('locked');
    expect(f.state.win).toBeNull();
    expect(e.state.door).toBe('locked');
  });

  it('is survivable: the scene can still be finished afterwards', () => {
    const e = makeEngine('courier');
    e.state.stats.attention = 9;
    e.raise(2, 'test');
    expect(e.flag('purged')).toBe(true);
    runTechnicalPath(e);
    expect(e.flag('entered')).toBe(true);
  });
});

describe('temporary access windows', () => {
  it('relocks the door when the window closes, and can be redone', () => {
    const e = makeEngine('ghost');
    runTechnicalPath(new Engine(newGame('ghost'))); // independent sanity run
    e.examine('vending');
    e.interact('vending');
    e.use('strip', 'grate');
    e.talk('drone');
    e.choose('drone', 'fix');
    e.closePrompt();
    e.use('key', 'terminal');
    e.use('shard', 'badge');
    e.use('badge', 'terminal');
    expect(e.state.door).toBe('disconnected');
    e.expireDoor();
    expect(e.state.door).toBe('locked');
    expect(e.state.win).toBeNull();
    // the key is not consumed, so the whole step is repeatable
    e.use('badge', 'terminal');
    expect(e.state.door).toBe('disconnected');
  });

  it('ends the calibration sweep without touching the door', () => {
    const e = makeEngine('ghost');
    e.talk('drone');
    e.choose('drone', 'fix');
    e.closePrompt();
    e.use('key', 'terminal');
    expect(e.flag('terminalMaintenance')).toBe(true);
    e.endMaintenance();
    expect(e.flag('terminalMaintenance')).toBe(false);
    expect(e.state.door).toBe('locked');
  });
});

describe('high attention makes the last step harder but not impossible', () => {
  it('demands a nerve check to walk through a watched door', () => {
    const e = makeEngine('ghost');
    e.examine('vending');
    e.interact('vending');
    e.use('strip', 'grate');
    e.talk('terminal');
    e.choose('terminal', 'fault');
    e.closePrompt();
    e.use('badge', 'terminal');
    e.choose('bluff-sector', 'twelve');
    e.choose('bluff-unit', 'sw9');
    e.choose('bluff-blank', 'burned');
    expect(e.state.door).toBe('disconnected');
    e.state.stats.attention = 9;
    e.state.stats.nerve = 1;
    const blocked = e.interact('door');
    expect(blocked.check?.kind).toBe('NERVE');
    expect(e.flag('entered')).toBe(false);
    // freezing up must not tip her into a sweep and relock what she earned
    expect(e.state.stats.attention).toBe(9);
    expect(e.state.door).toBe('disconnected');
    e.state.stats.nerve = 6;
    e.interact('door');
    expect(e.flag('entered')).toBe(true);
  });

  it('resolves even at rock-bottom nerve, because standing there steels her', () => {
    const e = makeEngine('ghost');
    runSocialPath(makeEngine('ghost'));
    e.examine('vending');
    e.interact('vending');
    e.use('strip', 'grate');
    e.talk('terminal');
    e.choose('terminal', 'fault');
    e.closePrompt();
    e.use('badge', 'terminal');
    e.choose('bluff-sector', 'twelve');
    e.choose('bluff-unit', 'sw9');
    e.choose('bluff-blank', 'burned');
    e.state.stats.attention = 9;
    e.state.stats.nerve = 0;
    for (let i = 0; i < 6 && !e.flag('entered'); i++) e.interact('door');
    expect(e.flag('entered')).toBe(true);
  });
});

describe('the ration', () => {
  it('restores nerve exactly once and then leaves the inventory', () => {
    const e = makeEngine('ghost');
    e.examine('vending');
    e.interact('vending');
    expect(e.has('ration')).toBe(true);
    e.state.stats.nerve = 2;
    e.use('ration', 'self');
    expect(e.state.stats.nerve).toBe(4);
    expect(e.has('ration')).toBe(false);
    const r = e.use('ration', 'self');
    expect(r.refused).toBe(true);
  });
});

describe('experience', () => {
  it('is awarded once per discovery', () => {
    const e = makeEngine();
    e.examine('puddle');
    const first = e.state.stats.xp;
    expect(first).toBeGreaterThan(0);
    e.examine('puddle');
    e.examine('puddle');
    expect(e.state.stats.xp).toBe(first);
  });

  it('records the objective and summary the completion panel prints', () => {
    const e = makeEngine('diplomat');
    expect(e.objective()).toBe('GET INSIDE THE TENEMENT');
    runSocialPath(e);
    const s = e.summary();
    expect(s.path).toBe('social');
    expect(s.profile).toBe('Alley Diplomat');
    expect(s.xp).toBe(e.state.stats.xp);
    expect(s.drone).toBe('left in the rain');
    expect(e.objective()).toContain('INSIDE');
  });

  it('reports a serviced drone and a discovered secret in the summary', () => {
    const e = makeEngine('courier');
    runHiddenPath(e);
    const s = e.summary();
    expect(s.secret).toContain('CIVIC asked');
    expect(s.drone).toBe('left in the rain');
    const t = makeEngine('ghost');
    runTechnicalPath(t);
    expect(t.summary().drone).toBe('serviced');
  });
});

describe('a sweep in the middle of a conversation', () => {
  it('ends the terminal interrogation instead of asking the next question', () => {
    const e = makeEngine('ghost');
    e.examine('vending');
    e.interact('vending');
    e.use('strip', 'grate');
    e.talk('terminal');
    e.choose('terminal', 'fault');
    e.closePrompt();
    e.use('badge', 'terminal');
    e.state.stats.attention = 9;
    const swept = e.choose('bluff-sector', 'nine'); // wrong answer -> +1 -> 10
    expect(e.flag('purged')).toBe(true);
    expect(swept.prompt).toBeUndefined();
    expect(e.isPromptOpen()).toBe(false);
    // and the interrogation can be restarted from the badge
    const again = e.use('badge', 'terminal');
    expect(again.prompt?.id).toBe('bluff-sector');
    e.choose('bluff-sector', 'twelve');
    e.choose('bluff-unit', 'sw9');
    e.choose('bluff-blank', 'burned');
    expect(e.state.door).toBe('disconnected');
  });
});

describe('being cruel to the drone', () => {
  it('closes the technical path for low Tech but leaves the others open', () => {
    const e = makeEngine('diplomat');
    e.talk('drone');
    e.choose('drone', 'shove');
    e.choose('drone', 'kind');
    const r = e.choose('drone', 'fix');
    expect(r.check?.grade).not.toBe('SUCCESS');
    expect(r.lines.some((l) => l.text.includes('That is on me'))).toBe(true);
    e.closePrompt();
    // the streetwise route is untouched
    e.examine('vending');
    e.interact('vending');
    if (!e.has('strip')) e.use('knife', 'vending');
    e.use('strip', 'grate');
    e.talk('terminal');
    e.choose('terminal', 'fault');
    e.closePrompt();
    e.use('badge', 'terminal');
    e.choose('bluff-sector', 'twelve');
    e.choose('bluff-unit', 'sw9');
    e.choose('bluff-blank', 'burned');
    e.interact('door');
    expect(e.flag('entered')).toBe(true);
  });
});
