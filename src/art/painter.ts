/**
 * A tiny 1-bit-minded pixel canvas. Everything in the alley is drawn with
 * these primitives so the whole scene shares one palette and one grain.
 *
 * Randomness is seeded, so the art is byte-identical on every load.
 */

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const PAL = {
  ink: '#05060a',
  black: '#0a0b0f',
  concrete0: '#0d1016',
  concrete1: '#171a21',
  concrete2: '#2b303b',
  concrete3: '#3d4450',
  concrete4: '#525b68',
  cyan0: '#16414a',
  cyan1: '#2a7d86',
  cyan2: '#47b6bf',
  cyan3: '#8fe6e8',
  amber0: '#5c3a12',
  amber1: '#a86a20',
  amber2: '#f0a33c',
  amber3: '#ffd58a',
  red1: '#7d2320',
  red2: '#d8433a',
  violet1: '#191026',
  violet2: '#2a1f3d',
  violet3: '#4c3a6b',
  pale: '#cfd6d8',
  bright: '#eef3f2',
  green: '#7fd98a',
  skin: '#a8735a',
  skinDark: '#7a4f3c',
} as const;

const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

let textPad: HTMLCanvasElement | null = null;

export class Painter {
  readonly canvas: HTMLCanvasElement;
  readonly ctx: CanvasRenderingContext2D;
  readonly w: number;
  readonly h: number;
  rnd: () => number;

  constructor(w: number, h: number, seed = 1) {
    this.w = w;
    this.h = h;
    this.canvas = document.createElement('canvas');
    this.canvas.width = w;
    this.canvas.height = h;
    const ctx = this.canvas.getContext('2d');
    if (!ctx) throw new Error('2d context unavailable');
    this.ctx = ctx;
    this.ctx.imageSmoothingEnabled = false;
    this.rnd = mulberry32(seed);
  }

  clear(): this {
    this.ctx.clearRect(0, 0, this.w, this.h);
    return this;
  }

  rect(x: number, y: number, w: number, h: number, color: string): this {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x | 0, y | 0, Math.max(0, w | 0), Math.max(0, h | 0));
    return this;
  }

  px(x: number, y: number, color: string): this {
    return this.rect(x, y, 1, 1, color);
  }

  frame(x: number, y: number, w: number, h: number, color: string): this {
    this.rect(x, y, w, 1, color);
    this.rect(x, y + h - 1, w, 1, color);
    this.rect(x, y, 1, h, color);
    this.rect(x + w - 1, y, 1, h, color);
    return this;
  }

  hline(x: number, y: number, w: number, color: string): this {
    return this.rect(x, y, w, 1, color);
  }

  vline(x: number, y: number, h: number, color: string): this {
    return this.rect(x, y, 1, h, color);
  }

  line(x0: number, y0: number, x1: number, y1: number, color: string): this {
    let x = x0 | 0;
    let y = y0 | 0;
    const dx = Math.abs((x1 | 0) - x);
    const dy = Math.abs((y1 | 0) - y);
    const sx = x < (x1 | 0) ? 1 : -1;
    const sy = y < (y1 | 0) ? 1 : -1;
    let err = dx - dy;
    for (let guard = 0; guard < 4096; guard++) {
      this.px(x, y, color);
      if (x === (x1 | 0) && y === (y1 | 0)) break;
      const e2 = err * 2;
      if (e2 > -dy) {
        err -= dy;
        x += sx;
      }
      if (e2 < dx) {
        err += dx;
        y += sy;
      }
    }
    return this;
  }

  /**
   * Vertical gradient with a jittered 4x4 ordered dither. The jitter is the
   * important part: a clean Bayer matrix over a whole wall reads as a
   * crosshatch grid, and a little seeded noise on the threshold turns it back
   * into grain while keeping the gradient smooth.
   */
  vgrad(x: number, y: number, w: number, h: number, top: string, bottom: string): this {
    const a = hexToRgb(top);
    const b = hexToRgb(bottom);
    for (let iy = 0; iy < h; iy++) {
      const t = h <= 1 ? 0 : iy / (h - 1);
      for (let ix = 0; ix < w; ix++) {
        const level = t * 16;
        const lo = Math.floor(level);
        const frac = level - lo;
        const threshold = BAYER[iy & 3][ix & 3] + (this.rnd() - 0.5) * 6;
        const useHi = frac * 16 > threshold;
        const step = Math.min(16, Math.max(0, lo + (useHi ? 1 : 0))) / 16;
        this.px(x + ix, y + iy, rgbToHex(mix(a, b, step)));
      }
    }
    return this;
  }

  /**
   * Ordered-dither fade. `amount(px, py)` returns 0..1 coverage; the 4x4 Bayer
   * matrix turns it into a clean pixel-art gradient instead of TV static.
   * Used for the vignette, the sodium lamp falloff and every wet reflection.
   */
  dither(
    x: number,
    y: number,
    w: number,
    h: number,
    color: string,
    amount: (px: number, py: number) => number,
  ): this {
    for (let iy = 0; iy < h; iy++) {
      for (let ix = 0; ix < w; ix++) {
        const a = amount(ix, iy);
        if (a <= 0) continue;
        const threshold = BAYER[iy & 3][ix & 3] + (this.rnd() - 0.5) * 6;
        if (a >= 1 || a * 17 > threshold) this.px(x + ix, y + iy, color);
      }
    }
    return this;
  }

  /**
   * True alpha wash, one strip at a time. Used only for lighting falloff —
   * the vignette and the darkness at the top of the alley — where stippling a
   * flat colour reads as dirt on the screen rather than as an absence of light.
   */
  shade(
    x: number,
    y: number,
    w: number,
    h: number,
    color: string,
    alpha: (i: number) => number,
    axis: 'x' | 'y' = 'x',
  ): this {
    const n = axis === 'x' ? w : h;
    this.ctx.fillStyle = color;
    for (let i = 0; i < n; i++) {
      const a = alpha(i);
      if (a <= 0) continue;
      this.ctx.globalAlpha = Math.min(1, a);
      if (axis === 'x') this.ctx.fillRect(x + i, y, 1, h);
      else this.ctx.fillRect(x, y + i, w, 1);
    }
    this.ctx.globalAlpha = 1;
    return this;
  }

  /** Seeded speckle, for grime and wet concrete. */
  speckle(x: number, y: number, w: number, h: number, color: string, density: number): this {
    for (let iy = 0; iy < h; iy++) {
      for (let ix = 0; ix < w; ix++) {
        if (this.rnd() < density) this.px(x + ix, y + iy, color);
      }
    }
    return this;
  }

  /** Horizontal scanline stripes: cheap, and reads as "screen". */
  scanlines(x: number, y: number, w: number, h: number, color: string, every = 2): this {
    for (let iy = 0; iy < h; iy += every) this.hline(x, y + iy, w, color);
    return this;
  }

  /**
   * Renders text through the system monospace font and hard-thresholds the
   * alpha, turning it into genuine 1-bit pixel type at this resolution.
   */
  text(
    str: string,
    x: number,
    y: number,
    color: string,
    opts: { size?: number; threshold?: number; letterSpacing?: number } = {},
  ): this {
    const size = opts.size ?? 6;
    const threshold = opts.threshold ?? 110;
    if (!textPad) textPad = document.createElement('canvas');
    const pad = textPad;
    const tw = Math.ceil(str.length * size) + 8;
    pad.width = Math.max(1, tw);
    pad.height = size + 6;
    const c = pad.getContext('2d', { willReadFrequently: true });
    if (!c) return this;
    c.clearRect(0, 0, pad.width, pad.height);
    c.font = `${size}px ui-monospace, "DejaVu Sans Mono", monospace`;
    c.textBaseline = 'top';
    c.fillStyle = '#fff';
    if (opts.letterSpacing !== undefined && 'letterSpacing' in c) {
      (c as unknown as { letterSpacing: string }).letterSpacing = `${opts.letterSpacing}px`;
    }
    c.fillText(str, 1, 1);
    const img = c.getImageData(0, 0, pad.width, pad.height);
    this.ctx.fillStyle = color;
    for (let iy = 0; iy < img.height; iy++) {
      for (let ix = 0; ix < img.width; ix++) {
        if (img.data[(iy * img.width + ix) * 4 + 3] >= threshold) {
          this.ctx.fillRect(x + ix, y + iy, 1, 1);
        }
      }
    }
    return this;
  }

  /** Word-wrapped text. Returns the number of lines drawn. */
  textBlock(
    str: string,
    x: number,
    y: number,
    maxWidth: number,
    color: string,
    opts: { size?: number; lineHeight?: number; threshold?: number } = {},
  ): number {
    const size = opts.size ?? 6;
    const lh = opts.lineHeight ?? size + 1;
    const perChar = size * 0.62;
    const maxChars = Math.max(1, Math.floor(maxWidth / perChar));
    const words = str.split(/\s+/);
    const lines: string[] = [];
    let cur = '';
    for (const word of words) {
      const next = cur ? `${cur} ${word}` : word;
      if (next.length > maxChars && cur) {
        lines.push(cur);
        cur = word;
      } else {
        cur = next;
      }
    }
    if (cur) lines.push(cur);
    lines.forEach((ln, i) => {
      const o: { size: number; threshold?: number } = { size };
      if (opts.threshold !== undefined) o.threshold = opts.threshold;
      this.text(ln, x, y + i * lh, color, o);
    });
    return lines.length;
  }
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function rgbToHex([r, g, b]: [number, number, number]): string {
  return `#${[r, g, b].map((v) => Math.max(0, Math.min(255, v | 0)).toString(16).padStart(2, '0')).join('')}`;
}

function mix(
  a: [number, number, number],
  b: [number, number, number],
  t: number,
): [number, number, number] {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}
