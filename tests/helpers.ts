import { Engine } from '../src/game/engine';
import { newGame } from '../src/game/state';
import type { ProfileId } from '../src/game/types';

export function makeEngine(profile: ProfileId = 'courier'): Engine {
  return new Engine(newGame(profile));
}

export const ALL_PROFILES: ProfileId[] = ['ghost', 'diplomat', 'courier'];

/** Path A: maintenance window + grafted credential. */
export function runTechnicalPath(e: Engine): void {
  e.examine('vending');
  e.interact('vending');
  if (!e.has('strip')) e.use('knife', 'vending');
  e.use('strip', 'grate');
  e.talk('drone');
  e.choose('drone', 'kind');
  e.choose('drone', 'fix');
  e.closePrompt();
  e.use('key', 'terminal');
  e.use('shard', 'badge');
  e.use('badge', 'terminal');
  e.interact('door');
}

/** Path B: an expired badge, a queued fault, and three straight answers. */
export function runSocialPath(e: Engine): void {
  e.examine('vending');
  e.interact('vending');
  if (!e.has('strip')) e.use('knife', 'vending');
  e.use('strip', 'grate');
  e.examine('stencil');
  e.examine('drone');
  e.talk('terminal');
  e.choose('terminal', 'fault');
  e.closePrompt();
  e.use('badge', 'terminal');
  e.choose('bluff-sector', 'twelve');
  e.choose('bluff-unit', 'sw9');
  e.choose('bluff-blank', 'burned');
  e.interact('door');
}

/** Path C: notice the wall is answering, then answer it. */
export function runHiddenPath(e: Engine): void {
  e.examine('graffiti');
  e.examine('vending');
  e.interact('vending');
  if (!e.has('strip')) e.use('knife', 'vending');
  e.examine('graffiti'); // sees "EVERYTHING SEES THE CITY"
  e.use('strip', 'grate');
  e.examine('graffiti'); // sees the personal line
  e.talk('drone');
  e.choose('drone', 'kind');
  e.closePrompt();
  e.talk('drone');
  e.closePrompt();
  e.talk('graffiti');
  e.talk('graffiti');
  e.choose('civic', 'consent');
  e.interact('door');
}
