import { VIEW_H, VIEW_W } from '../data/scene';

/** Height of the HUD in virtual pixels; must match #hud in style.css. */
export const HUD_H = 64;

/**
 * Picks the largest integer scale that fits the window, so the canvas and the
 * HTML interface always land on whole pixels together.
 */
export function currentScale(): number {
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--u');
  return Math.max(1, parseInt(raw, 10) || 1);
}

export function installLayout(): () => void {
  const apply = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const u = Math.max(1, Math.floor(Math.min(w / VIEW_W, h / (VIEW_H + HUD_H))));
    document.documentElement.style.setProperty('--u', `${u}px`);
  };
  apply();
  window.addEventListener('resize', apply);
  return apply;
}
