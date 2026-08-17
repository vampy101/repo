import type { CheckKind, CheckResult } from './types';

export interface Mod {
  label: string;
  value: number;
}

export interface CheckSpec {
  kind: CheckKind;
  /** the raw statistic */
  base: number;
  /** score needed for SUCCESS; one below it is a PARTIAL SUCCESS */
  target: number;
  /** situational bonuses from preparation, information and items */
  mods?: Mod[];
}

/**
 * Deterministic. No dice anywhere in this slice: the player can always work out
 * why a check went the way it did, and can always improve it by preparing better.
 */
export function runCheck(spec: CheckSpec): CheckResult {
  const mods = (spec.mods ?? []).filter((mo) => mo.value !== 0);
  const score = mods.reduce((acc, mo) => acc + mo.value, spec.base);
  const grade =
    score >= spec.target ? 'SUCCESS' : score >= spec.target - 1 ? 'PARTIAL SUCCESS' : 'FAILED';
  const notes = mods.map((mo) => `${mo.value > 0 ? '+' : ''}${mo.value} ${mo.label}`);
  return { kind: spec.kind, grade, score, target: spec.target, notes };
}

export function bannerText(r: CheckResult): string {
  return `${r.kind} CHECK: ${r.grade}`;
}

export function checkDetail(r: CheckResult): string {
  const head = `${r.kind} ${r.score} vs ${r.target}`;
  return r.notes.length ? `${head}  (${r.notes.join(', ')})` : head;
}

export function isSuccess(r: CheckResult): boolean {
  return r.grade === 'SUCCESS';
}

export function isPartial(r: CheckResult): boolean {
  return r.grade === 'PARTIAL SUCCESS';
}

export function kindFor(stat: 'tech' | 'streetwise' | 'nerve'): CheckKind {
  return stat === 'tech' ? 'TECH' : stat === 'streetwise' ? 'STREETWISE' : 'NERVE';
}
