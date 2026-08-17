import type Phaser from 'phaser';
import { PAL, Painter } from './painter';

/** Where each prop sprite is pinned, in scene pixels (top-left). */
export const PROPS = {
  sign: { x: 8, y: 20, w: 52, h: 24 },
  ad: { x: 62, y: 26, w: 52, h: 48 },
  hopper: { x: 18, y: 130, w: 48, h: 40 },
  rubble: { x: 94, y: 138, w: 26, h: 16 },
  dispenser: { x: 118, y: 86, w: 36, h: 65 },
  grate: { x: 62, y: 154, w: 34, h: 18 },
  puddle: { x: 116, y: 156, w: 40, h: 19 },
  graffiti: { x: 152, y: 58, w: 62, h: 56 },
  stencil: { x: 156, y: 116, w: 42, h: 14 },
  conduit: { x: 212, y: 16, w: 30, h: 106 },
  recess: { x: 214, y: 118, w: 34, h: 34 },
  drone: { x: 222, y: 136, w: 24, h: 16 },
  terminal: { x: 244, y: 94, w: 22, h: 36 },
  door: { x: 268, y: 84, w: 40, h: 68 },
  camera: { x: 268, y: 58, w: 28, h: 26 },
  windows: { x: 258, y: 16, w: 54, h: 38 },
} as const;

/** Camera servo pivot, in scene pixels. */
export const CAMERA_PIVOT = { x: 281, y: 66 };

function put(scene: Phaser.Scene, key: string, p: Painter): void {
  if (scene.textures.exists(key)) scene.textures.remove(key);
  scene.textures.addCanvas(key, p.canvas);
}

// ---------------------------------------------------------------- background

function drawWallPanel(
  p: Painter,
  x: number,
  y: number,
  w: number,
  h: number,
  base: string,
  seamEvery: number,
  foot: string,
): void {
  // Keep the two ends close: a dither spanning a big tonal gap over a whole
  // wall reads as crosshatch, however much you jitter it.
  p.vgrad(x, y, w, h, base, foot);
  for (let sy = y + seamEvery; sy < y + h; sy += seamEvery) {
    p.hline(x, sy, w, PAL.concrete1);
    p.hline(x, sy + 1, w, '#333a46');
  }
  p.speckle(x, y, w, h, PAL.concrete1, 0.022);
  // damp rising up the wall, as a gradient rather than static
  p.dither(x, y + h - 26, w, 26, PAL.violet1, (_px, py) => (py / 26) ** 1.5 * 0.45);
}

function drawBackground(): Painter {
  const p = new Painter(320, 180, 7331);

  // The gap of sky between the buildings: not black, just uninterested.
  p.vgrad(0, 0, 320, 12, '#120c1c', PAL.concrete0);

  // ---- left building -----------------------------------------------------
  drawWallPanel(p, 0, 10, 118, 130, PAL.concrete2, 22, '#212630');
  p.hline(0, 10, 118, PAL.concrete4);
  p.vline(117, 10, 130, PAL.concrete0);
  // downpipe
  p.rect(6, 12, 4, 128, PAL.concrete1);
  p.vline(6, 12, 128, PAL.concrete3);
  for (let y = 18; y < 140; y += 26) p.rect(5, y, 6, 2, PAL.concrete0);

  // ---- middle wall -------------------------------------------------------
  drawWallPanel(p, 118, 6, 94, 134, PAL.concrete3, 26, '#313743');
  p.hline(118, 6, 94, PAL.concrete4);
  p.vline(118, 6, 134, PAL.concrete0);
  p.vline(211, 6, 134, PAL.concrete0);

  // caged service lamp on the middle wall: the alley's only warm light
  p.rect(196, 22, 12, 3, PAL.concrete1);
  p.rect(199, 25, 6, 5, PAL.amber2);
  p.rect(200, 26, 4, 3, PAL.amber3);
  p.frame(197, 24, 10, 8, PAL.concrete0);
  p.vline(202, 14, 8, PAL.concrete1);
  // amber falloff down the wall: a soft cone, dithered
  p.dither(170, 32, 64, 40, PAL.amber0, (px, py) => {
    const spread = 5 + py * 0.75;
    const d = Math.abs(px - 32) / spread;
    if (d > 1) return 0;
    return (1 - d) * (1 - py / 42) * 0.85;
  });
  p.dither(190, 30, 24, 16, PAL.amber1, (px, py) => {
    const d = Math.hypot((px - 12) / 11, (py - 2) / 14);
    return d > 1 ? 0 : (1 - d) * 0.55;
  });

  // ---- right building (the tenement) ------------------------------------
  drawWallPanel(p, 212, 4, 108, 136, PAL.concrete2, 18, '#1f242d');
  p.hline(212, 4, 108, PAL.concrete4);
  p.vline(212, 4, 136, PAL.concrete0);
  // condemnation batten nailed across the facade
  p.rect(250, 60, 68, 4, PAL.amber0);
  p.rect(250, 60, 68, 1, PAL.amber1);
  p.speckle(250, 60, 68, 4, PAL.concrete1, 0.2);

  // window openings (frames only; glow is drawn live)
  for (const [wx, wy] of [
    [262, 20],
    [284, 22],
    [296, 38],
    [266, 40],
  ] as const) {
    p.rect(wx, wy, 14, 12, PAL.ink);
    p.frame(wx - 1, wy - 1, 16, 14, PAL.concrete1);
    p.hline(wx - 1, wy + 13, 16, PAL.concrete3);
    p.vline(wx + 6, wy, 12, PAL.concrete1);
  }

  // door recess: the wall steps back around the frame
  p.rect(264, 80, 48, 60, PAL.concrete1);
  p.vline(264, 80, 60, PAL.concrete0);
  p.hline(264, 80, 48, PAL.concrete0);

  // ---- ground ------------------------------------------------------------
  p.hline(0, 138, 320, PAL.concrete0);
  p.hline(0, 139, 320, '#454e5b'); // wet kerb catching the lamp
  p.vgrad(0, 140, 320, 40, '#20252e', '#141922');
  // long specular sheen: rain film on concrete, brightest just off the wall
  p.dither(0, 141, 320, 12, '#333b47', (_px, py) => (1 - py / 12) * 0.55);
  p.dither(0, 152, 320, 14, '#242c35', (_px, py) => (1 - py / 14) * 0.3);
  // cracks
  p.line(40, 152, 76, 176, PAL.concrete0);
  p.line(76, 176, 92, 168, PAL.concrete0);
  p.line(180, 146, 168, 172, PAL.concrete0);
  p.line(240, 150, 262, 178, PAL.concrete0);
  p.speckle(0, 140, 320, 40, PAL.concrete0, 0.022);

  // reflected lamp: a wet amber column beneath the caged light
  p.dither(184, 141, 36, 39, PAL.amber0, (px, py) => {
    const spread = 3 + py * 0.3;
    const d = Math.abs(px - 18) / spread;
    if (d > 1) return 0;
    // broken up horizontally: water, not paint
    const ripple = 0.75 + 0.25 * Math.sin(py * 1.7);
    return (1 - d) * (1 - py / 44) * ripple;
  });
  // reflected terminal glow: dirty cyan spilling across the door apron
  p.dither(240, 142, 74, 38, PAL.cyan0, (px, py) => {
    const d = Math.abs(px - 40) / 38;
    return Math.max(0, (1 - d) * (1 - py / 40) * 0.6);
  });

  // ---- vignette ----------------------------------------------------------
  p.shade(0, 0, 30, 180, PAL.ink, (i) => (1 - i / 30) ** 1.6 * 0.92, 'x');
  p.shade(290, 0, 30, 180, PAL.ink, (i) => (i / 29) ** 1.6 * 0.92, 'x');
  p.shade(0, 0, 320, 14, PAL.ink, (i) => (1 - i / 14) ** 1.5 * 0.8, 'y');
  p.shade(0, 170, 320, 10, PAL.ink, (i) => (i / 10) ** 1.8 * 0.5, 'y');

  return p;
}

// --------------------------------------------------------------------- props

function drawSign(): Painter {
  const { w, h } = PROPS.sign;
  const p = new Painter(w, h, 11);
  p.rect(0, 0, w, h, PAL.concrete0);
  p.frame(0, 0, w, h, PAL.concrete3);
  p.rect(2, 2, w - 4, h - 4, '#0f1a1e');
  p.text('CHECKPOINT 7', 3, 3, PAL.cyan2, { size: 6, threshold: 95 });
  p.text('SUSPENDED', 3, 11, PAL.amber2, { size: 7, threshold: 95 });
  p.text('ENJOY THE WAIT', 3, 19, '#5d6772', { size: 5 });
  p.speckle(2, 2, w - 4, h - 4, PAL.concrete1, 0.03);
  // hanging bracket
  p.rect(w / 2 - 1, 0, 2, 2, PAL.concrete1);
  return p;
}

function drawAdFrame(): Painter {
  const { w, h } = PROPS.ad;
  const p = new Painter(w, h, 12);
  p.rect(0, 0, w, h, PAL.concrete1);
  p.frame(0, 0, w, h, PAL.concrete3);
  p.frame(1, 1, w - 2, h - 2, PAL.concrete0);
  p.rect(3, 3, w - 6, h - 6, '#0a1014');
  return p;
}

function drawHopper(): Painter {
  const { w, h } = PROPS.hopper;
  const p = new Painter(w, h, 13);
  // lid
  p.rect(2, 4, w - 4, 6, '#1d3327');
  p.hline(2, 4, w - 4, '#2c4b38');
  // body
  p.vgrad(0, 10, w, h - 10, '#1a2c22', '#101a14');
  p.frame(0, 10, w, h - 10, PAL.concrete0);
  for (let x = 4; x < w - 2; x += 7) p.vline(x, 12, h - 14, '#14231b');
  // grime and a municipal stencil too worn to read
  p.speckle(0, 10, w, h - 10, PAL.concrete1, 0.07);
  p.dither(0, h - 16, w, 16, PAL.violet1, (_px, py) => (py / 16) * 0.6);
  p.text('SECTOR 12', 6, 20, '#2c4b38', { size: 6 });
  // chain across the lid
  p.line(4, 8, w - 6, 6, PAL.concrete3);
  p.rect(0, h - 3, w, 3, PAL.ink);
  return p;
}

function drawRubble(): Painter {
  const { w, h } = PROPS.rubble;
  const p = new Painter(w, h, 14);
  p.rect(1, h - 4, w - 2, 4, PAL.concrete1);
  for (const [x, y, bw, bh] of [
    [2, 8, 8, 5],
    [11, 6, 7, 7],
    [17, 9, 7, 4],
    [6, 4, 5, 4],
  ] as const) {
    p.rect(x, y, bw, bh, PAL.concrete2);
    p.hline(x, y, bw, PAL.concrete3);
  }
  p.line(20, 6, 24, 3, PAL.concrete4); // sheared bolt
  p.speckle(0, 2, w, h - 2, PAL.concrete0, 0.16);
  return p;
}

function drawDispenser(): Painter {
  const { w, h } = PROPS.dispenser;
  const p = new Painter(w, h, 15);
  p.rect(0, 0, w, h, PAL.concrete1);
  p.frame(0, 0, w, h, PAL.concrete3);
  // lit product window
  p.rect(3, 4, w - 6, 30, '#3a2a08');
  p.vgrad(3, 4, w - 6, 30, '#5c4210', '#2a1e06');
  for (let c = 0; c < 3; c++) {
    const x = 5 + c * 9;
    p.vline(x + 8, 5, 28, PAL.amber0);
    for (let r = 0; r < 4; r++) {
      const y = 6 + r * 7;
      if (c === 2 && r > 1) continue; // column three: jammed and empty
      p.rect(x, y, 7, 5, PAL.amber1);
      p.hline(x, y, 7, PAL.amber2);
    }
  }
  p.frame(3, 4, w - 6, 30, PAL.concrete0);
  // fascia, keypad, coin return, delivery slot
  p.rect(3, 36, w - 6, 12, PAL.concrete2);
  for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) p.rect(6 + i * 5, 38 + j * 5, 3, 3, PAL.concrete4);
  p.rect(24, 38, 8, 8, '#101820');
  p.frame(24, 38, 8, 8, PAL.cyan0);
  p.rect(3, 50, w - 6, 7, PAL.concrete0);
  p.hline(3, 50, w - 6, PAL.concrete3);
  // plinth and the leak
  p.rect(1, 57, w - 2, h - 57, PAL.concrete2);
  p.hline(1, 57, w - 2, PAL.concrete3);
  p.rect(6, h - 3, 12, 3, '#4a4a1c');
  p.speckle(4, h - 6, 18, 6, '#5d5a22', 0.35);
  p.speckle(0, 0, w, h, PAL.concrete0, 0.03);
  return p;
}

function drawGrate(): Painter {
  const { w, h } = PROPS.grate;
  const p = new Painter(w, h, 16);
  p.rect(0, 0, w, h, PAL.concrete0);
  p.frame(0, 0, w, h, PAL.concrete3);
  p.rect(2, 2, w - 4, h - 4, PAL.ink);
  for (let x = 4; x < w - 3; x += 4) p.vline(x, 2, h - 4, PAL.concrete2);
  p.hline(2, 2, w - 4, PAL.concrete1);
  // the badge, two-thirds of the way down and just out of reach
  p.rect(13, 9, 8, 5, '#20313a');
  p.rect(14, 10, 6, 1, PAL.cyan1);
  p.px(19, 12, PAL.amber2);
  p.speckle(0, 0, w, h, PAL.concrete0, 0.1);
  return p;
}

function drawGrateEmpty(): Painter {
  const p = drawGrate();
  p.rect(12, 8, 10, 7, PAL.ink);
  for (let x = 12; x < 22; x++) if ((x & 3) === 0) p.vline(x, 8, 7, PAL.concrete2);
  return p;
}

function drawPuddle(): Painter {
  const { w, h } = PROPS.puddle;
  const p = new Painter(w, h, 17);
  const halfAt = (y: number) =>
    Math.round(Math.sin(Math.PI * (0.18 + (y / (h - 1)) * 0.72)) * (w / 2 - 1));
  // dark water, with a bright rim where the film meets dry concrete
  for (let y = 0; y < h; y++) {
    const half = halfAt(y);
    p.rect(w / 2 - half, y, half * 2, 1, '#0f161c');
  }
  for (let y = 1; y < h - 1; y++) {
    const half = halfAt(y);
    p.px(w / 2 - half, y, '#39424e');
    p.px(w / 2 + half - 1, y, '#39424e');
  }
  // the wall above, upside down, and the camera housing in the middle of it
  p.dither(4, 3, w - 8, h - 6, PAL.cyan0, (px, py) => {
    const half = halfAt(py + 3) - 4;
    return Math.abs(px - (w / 2 - 4)) > half ? 0 : 0.45 - py * 0.02;
  });
  p.rect(18, 4, 8, 2, '#4a5560'); // the reflected camera arm
  p.rect(21, 6, 3, 2, '#5d6a76');
  p.px(23, 7, PAL.cyan3); // its lens, catching the light
  // specular flecks: rain hitting standing water
  p.px(9, 9, '#7f8d99');
  p.px(30, 12, '#7f8d99');
  p.px(15, 14, '#6a7784');
  return p;
}

function drawStencil(): Painter {
  const { w, h } = PROPS.stencil;
  const p = new Painter(w, h, 18);
  p.text('SECTOR 12', 0, 0, '#7d8895', { size: 6, threshold: 100 });
  p.text('SUBCONTRACT', 0, 7, '#6e7986', { size: 6, threshold: 100 });
  return p;
}

function drawConduit(): Painter {
  const { w, h } = PROPS.conduit;
  const p = new Painter(w, h, 19);
  for (const [x, pw, base, hi] of [
    [2, 7, PAL.concrete2, PAL.concrete4],
    [11, 5, '#243038', '#3d5560'],
    [18, 8, PAL.concrete1, PAL.concrete3],
  ] as const) {
    p.rect(x, 0, pw, h, base);
    p.vline(x + 1, 0, h, hi);
    p.vline(x + pw - 1, 0, h, PAL.concrete0);
    for (let y = 14; y < h; y += 30) {
      p.rect(x - 1, y, pw + 2, 4, PAL.concrete3);
      p.hline(x - 1, y, pw + 2, PAL.concrete4);
    }
  }
  // insulation, unravelling
  p.rect(9, 62, 2, 20, PAL.amber0);
  p.speckle(0, 0, w, h, PAL.concrete0, 0.04);
  p.dither(0, h - 30, w, 30, PAL.violet1, (_px, py) => (py / 30) * 0.55);
  return p;
}

function drawRecess(): Painter {
  const { w, h } = PROPS.recess;
  const p = new Painter(w, h, 20);
  p.rect(0, 0, w, h, PAL.concrete0);
  p.vgrad(2, 2, w - 4, h - 4, PAL.ink, '#12161d');
  p.hline(0, 0, w, PAL.concrete3);
  p.vline(0, 0, h, PAL.concrete1);
  p.vline(w - 1, 0, h, PAL.concrete1);
  // charging contacts
  p.rect(6, h - 8, 4, 3, PAL.cyan0);
  p.rect(w - 10, h - 8, 4, 3, PAL.cyan0);
  p.text('SW-9', 8, 4, '#3b4550', { size: 6 });
  return p;
}

function drawDrone(fixed: boolean): Painter {
  const { w, h } = PROPS.drone;
  const p = new Painter(w, h, fixed ? 21 : 22);
  // chassis: pale enough to read against the black charging recess
  p.rect(2, 3, w - 4, 8, PAL.concrete4);
  p.vgrad(2, 3, w - 4, 8, '#7b8794', PAL.concrete3);
  p.frame(2, 3, w - 4, 8, PAL.concrete0);
  p.hline(3, 4, w - 6, '#98a3ae');
  // dome sensor
  p.rect(6, 1, 6, 3, PAL.concrete2);
  p.rect(7, 0, 4, 2, fixed ? PAL.cyan2 : PAL.amber2);
  // brush skirt
  p.rect(3, 11, w - 6, 2, PAL.concrete1);
  // treads
  p.rect(2, 13, 8, 3, PAL.concrete1);
  p.rect(w - 10, 13, 8, 3, PAL.concrete1);
  p.hline(2, 13, 8, PAL.concrete3);
  p.hline(w - 10, 13, 8, PAL.concrete3);
  if (!fixed) {
    // banding wire wound into the left tread
    p.line(2, 15, 8, 12, PAL.amber1);
    p.px(5, 13, PAL.amber2);
    p.rect(15, 5, 4, 2, PAL.red1); // fault lamp
  } else {
    p.rect(15, 5, 4, 2, PAL.green);
  }
  p.speckle(2, 3, w - 4, 10, PAL.concrete2, 0.08);
  return p;
}

function drawTerminal(): Painter {
  const { w, h } = PROPS.terminal;
  const p = new Painter(w, h, 23);
  p.rect(0, 0, w, h, PAL.concrete2);
  p.frame(0, 0, w, h, PAL.concrete0);
  p.hline(1, 1, w - 2, PAL.concrete4);
  // screen bezel
  p.rect(2, 3, w - 4, 16, PAL.ink);
  p.frame(2, 3, w - 4, 16, PAL.concrete0);
  // credential slot
  p.rect(4, 22, w - 8, 3, PAL.ink);
  p.hline(4, 22, w - 8, PAL.cyan0);
  // speaker grille
  for (let y = 27; y < 33; y += 2) p.hline(4, y, w - 8, PAL.concrete1);
  p.rect(0, h - 2, w, 2, PAL.concrete1);
  p.speckle(0, 0, w, h, PAL.concrete1, 0.04);
  return p;
}

function drawDoor(open: boolean): Painter {
  const { w, h } = PROPS.door;
  const p = new Painter(w, h, open ? 24 : 25);
  // frame
  p.rect(0, 0, w, h, PAL.concrete1);
  p.frame(0, 0, w, h, PAL.concrete0);
  p.hline(1, 1, w - 2, PAL.concrete3);
  // lamp housing above the jamb
  p.rect(w / 2 - 3, 2, 6, 4, PAL.concrete0);
  if (open) {
    // warm stairwell behind, and the door swung inward
    p.vgrad(4, 8, w - 8, h - 10, '#43301a', '#160f08');
    p.rect(4, 8, 6, h - 10, PAL.ink);
    for (let i = 0; i < 5; i++) {
      const y = h - 12 - i * 6;
      p.rect(12, y, w - 18, 3, '#5c4210');
      p.hline(12, y, w - 18, PAL.amber1);
    }
    p.rect(w - 10, 8, 6, h - 10, PAL.concrete2); // the leaf, pushed back
    p.vline(w - 10, 8, h - 10, PAL.concrete4);
    p.speckle(4, 8, w - 8, h - 10, PAL.amber0, 0.1);
  } else {
    p.vgrad(4, 8, w - 8, h - 10, '#333b46', '#1b2027');
    p.frame(4, 8, w - 8, h - 10, PAL.concrete0);
    // riveted plate
    for (let y = 12; y < h - 6; y += 8) {
      for (let x = 8; x < w - 8; x += 9) p.px(x, y, PAL.concrete4);
    }
    p.hline(4, 8 + Math.round((h - 10) / 2), w - 8, PAL.concrete0);
    p.hline(4, 9 + Math.round((h - 10) / 2), w - 8, PAL.concrete3);
    // no handle: handles imply choice
    p.rect(w - 12, 34, 4, 8, PAL.concrete1);
    p.dither(4, h - 26, w - 8, 24, PAL.violet1, (_px, py) => (py / 24) * 0.55);
    p.speckle(4, 8, w - 8, h - 10, PAL.concrete0, 0.03);
  }
  return p;
}

function drawCameraMount(): Painter {
  const { w } = PROPS.camera;
  const p = new Painter(w, 14, 26);
  // wall bracket, then an arm out to the servo pivot
  p.rect(w - 7, 0, 7, 7, PAL.concrete3);
  p.hline(w - 7, 0, 7, '#66707d');
  p.frame(w - 7, 0, 7, 7, PAL.concrete0);
  p.rect(11, 2, w - 16, 4, PAL.concrete3);
  p.hline(11, 2, w - 16, '#66707d');
  p.hline(11, 5, w - 16, PAL.concrete0);
  p.rect(9, 0, 8, 9, PAL.concrete4); // servo housing: the brightest thing up here
  p.frame(9, 0, 8, 9, PAL.concrete0);
  p.hline(10, 1, 6, '#78838f');
  return p;
}

/** Drawn pointing right (+x); the scene rotates it about its left-hand pivot. */
function drawCameraHead(): Painter {
  const p = new Painter(18, 12, 27);
  // body
  p.rect(0, 3, 13, 7, PAL.concrete3);
  p.vgrad(0, 3, 13, 7, '#6c7784', PAL.concrete2);
  p.frame(0, 3, 13, 7, PAL.concrete0);
  // sun hood, kicked forward
  p.rect(2, 1, 9, 2, PAL.concrete4);
  p.hline(2, 1, 9, '#78838f');
  p.px(11, 2, PAL.concrete0);
  // lens barrel and glass
  p.rect(12, 4, 4, 5, PAL.concrete4);
  p.frame(12, 4, 4, 5, PAL.concrete0);
  p.rect(15, 5, 3, 3, PAL.cyan1);
  p.rect(16, 6, 2, 2, PAL.cyan3);
  return p;
}

function drawWindowGlow(): Painter {
  const p = new Painter(14, 12, 28);
  p.vgrad(0, 0, 14, 12, '#6b5a2a', '#2a2410');
  p.speckle(0, 0, 14, 12, PAL.amber1, 0.2);
  p.vline(6, 0, 12, PAL.concrete1);
  return p;
}

// --------------------------------------------------------------------- Mara

type Pose = 'idle' | 'walk0' | 'walk1' | 'walk2' | 'walk3' | 'reach' | 'work';

const COAT = '#26454d';
const COAT_HI = '#33606a';
const HAIR = '#1d1524';

function drawMara(pose: Pose): Painter {
  const p = new Painter(12, 30, 40);
  const bent = pose === 'reach';
  const bob = pose === 'walk1' || pose === 'walk3' ? 1 : 0;
  const top = (bent ? 4 : 0) + bob;

  if (bent) {
    // hunched over the grate
    p.rect(3, top + 4, 7, 4, HAIR);
    p.rect(4, top + 7, 5, 3, PAL.skin);
    p.rect(2, top + 9, 9, 9, COAT);
    p.hline(2, top + 9, 9, COAT_HI);
    p.rect(3, top + 17, 3, 8, PAL.concrete1);
    p.rect(7, top + 17, 3, 8, PAL.concrete1);
    p.rect(9, top + 13, 3, 4, PAL.skinDark); // arm down into the bars
    p.rect(2, 28, 9, 2, PAL.ink);
    return p;
  }

  // head
  p.rect(3, top + 1, 6, 5, HAIR);
  p.rect(4, top + 4, 5, 3, PAL.skin);
  p.px(8, top + 5, PAL.skinDark);
  p.rect(3, top + 6, 6, 1, HAIR); // collar-length hair, wet
  // coat: long, cheap, dark cyan under sodium light
  p.rect(2, top + 7, 8, 13, COAT);
  p.hline(2, top + 7, 8, COAT_HI);
  p.vline(2, top + 7, 13, COAT_HI);
  p.rect(5, top + 8, 2, 11, '#1c363d'); // buttoned seam
  p.px(9, top + 10, PAL.amber1); // courier tag on the shoulder
  // legs
  const stride =
    pose === 'walk0' ? 2 : pose === 'walk2' ? -2 : 0;
  p.rect(3 - Math.max(0, stride), top + 20, 3, 8, PAL.concrete1);
  p.rect(6 + Math.max(0, -stride), top + 20, 3, 8, PAL.concrete1);
  if (pose === 'walk0' || pose === 'walk2') {
    p.rect(2, 28, 4, 2, PAL.ink);
    p.rect(7, 28, 4, 2, PAL.ink);
  } else {
    p.rect(3, 28, 6, 2, PAL.ink);
  }
  // arms
  if (pose === 'work') {
    p.rect(9, top + 9, 3, 3, PAL.skinDark);
    p.rect(0, top + 10, 2, 4, COAT);
  } else {
    p.rect(1, top + 10, 2, 7, COAT);
    p.rect(9, top + 10, 2, 7, COAT);
  }
  return p;
}

// ----------------------------------------------------------------- item icons

function drawItemIcon(id: string): Painter {
  const p = new Painter(16, 16, 50);
  switch (id) {
    case 'shard':
      p.rect(3, 3, 10, 10, '#20313a');
      p.frame(3, 3, 10, 10, PAL.cyan0);
      p.rect(5, 5, 6, 2, PAL.cyan1);
      p.rect(5, 8, 4, 1, PAL.concrete4);
      // the crack, and the burned name field
      p.line(9, 3, 6, 12, PAL.ink);
      p.rect(9, 9, 3, 3, PAL.red1);
      break;
    case 'knife':
      p.rect(4, 10, 7, 3, PAL.concrete2); // grip
      p.hline(4, 10, 7, PAL.concrete4);
      p.line(10, 9, 13, 3, PAL.pale); // ceramic blade
      p.line(11, 9, 14, 4, PAL.bright);
      p.px(13, 3, PAL.bright);
      break;
    case 'strip':
      p.line(3, 12, 4, 5, PAL.concrete4);
      p.line(4, 5, 9, 3, PAL.concrete4);
      p.line(9, 3, 12, 6, PAL.pale);
      p.line(12, 6, 11, 9, PAL.pale);
      p.px(11, 10, PAL.cyan2);
      break;
    case 'badge':
      p.rect(2, 4, 12, 9, '#20313a');
      p.frame(2, 4, 12, 9, PAL.cyan1);
      p.rect(4, 6, 4, 4, PAL.concrete1); // portrait: burned out
      p.speckle(4, 6, 4, 4, PAL.amber0, 0.4);
      p.rect(9, 6, 4, 1, PAL.cyan2);
      p.rect(9, 8, 3, 1, PAL.concrete4);
      p.rect(9, 10, 4, 1, PAL.concrete4);
      p.rect(2, 2, 5, 2, PAL.concrete3); // clip
      break;
    case 'key':
      p.rect(5, 3, 6, 7, PAL.concrete3);
      p.frame(5, 3, 6, 7, PAL.concrete0);
      p.rect(6, 5, 4, 1, PAL.green);
      p.rect(6, 7, 3, 1, PAL.cyan2);
      p.rect(6, 10, 4, 4, PAL.concrete1); // contacts
      p.vline(7, 10, 4, PAL.amber2);
      p.vline(9, 10, 4, PAL.amber2);
      break;
    case 'ration':
      p.rect(3, 5, 10, 7, PAL.amber1);
      p.hline(3, 5, 10, PAL.amber2);
      p.frame(3, 5, 10, 7, PAL.amber0);
      p.rect(5, 7, 6, 1, '#3a2a08');
      p.rect(5, 9, 4, 1, '#3a2a08');
      p.speckle(3, 5, 10, 7, PAL.amber3, 0.1);
      break;
    default:
      p.frame(3, 3, 10, 10, PAL.concrete4);
  }
  return p;
}

// ------------------------------------------------------------------- cursors

function cursorUrl(draw: (p: Painter) => void, size = 16): string {
  const p = new Painter(size, size, 60);
  draw(p);
  return p.canvas.toDataURL();
}

export interface CursorSet {
  walk: string;
  look: string;
  hand: string;
  talk: string;
  no: string;
}

export function buildCursors(): CursorSet {
  const outline = (p: Painter, pts: [number, number][], color: string) => {
    for (const [x, y] of pts) p.px(x, y, color);
  };
  return {
    walk: cursorUrl((p) => {
      // a soft crosshair with a boot-print centre
      p.hline(1, 8, 5, PAL.cyan2);
      p.hline(11, 8, 5, PAL.cyan2);
      p.vline(8, 1, 5, PAL.cyan2);
      p.vline(8, 11, 5, PAL.cyan2);
      p.rect(6, 6, 5, 5, PAL.ink);
      p.rect(7, 7, 3, 3, PAL.cyan3);
    }),
    look: cursorUrl((p) => {
      // eye
      p.line(2, 8, 8, 3, PAL.cyan3);
      p.line(8, 3, 14, 8, PAL.cyan3);
      p.line(2, 8, 8, 13, PAL.cyan3);
      p.line(8, 13, 14, 8, PAL.cyan3);
      p.rect(6, 6, 5, 5, PAL.ink);
      p.rect(7, 7, 3, 3, PAL.cyan2);
      p.px(8, 8, PAL.bright);
    }),
    hand: cursorUrl((p) => {
      p.rect(5, 4, 2, 6, PAL.bright);
      p.rect(7, 6, 2, 4, PAL.bright);
      p.rect(9, 7, 2, 3, PAL.bright);
      p.rect(4, 9, 8, 5, PAL.bright);
      outline(p, [[4, 3], [7, 5], [9, 6], [11, 6], [3, 9], [12, 9], [3, 14], [12, 14]], PAL.ink);
      p.frame(4, 9, 8, 5, PAL.ink);
      p.px(6, 12, PAL.cyan1);
    }),
    talk: cursorUrl((p) => {
      p.rect(2, 3, 12, 8, PAL.bright);
      p.frame(2, 3, 12, 8, PAL.ink);
      p.rect(4, 11, 3, 3, PAL.bright);
      p.px(4, 14, PAL.ink);
      p.rect(4, 6, 8, 1, PAL.cyan0);
      p.rect(4, 8, 5, 1, PAL.cyan0);
    }),
    no: cursorUrl((p) => {
      p.frame(3, 3, 10, 10, PAL.red2);
      p.line(4, 4, 11, 11, PAL.red2);
      p.line(11, 4, 4, 11, PAL.red2);
    }),
  };
}

// ------------------------------------------------------------ live-text bits

/** The graffiti wall. Regenerated whenever the wall changes its mind. */
export function makeGraffiti(scene: Phaser.Scene, text: string, fade = false): void {
  const { w, h } = PROPS.graffiti;
  const p = new Painter(w, h, 70);
  const color = fade ? '#59636e' : '#8d97a3';
  const lines = p.textBlock(text, 1, 4, w - 2, color, { size: 8, lineHeight: 11 });
  // drips under a few letters: spray paint on a wet wall
  const rnd = p.rnd;
  for (let i = 0; i < 14; i++) {
    const x = 2 + Math.floor(rnd() * (w - 4));
    const y = 6 + Math.floor(rnd() * Math.max(1, lines * 11));
    const len = 2 + Math.floor(rnd() * 5);
    p.vline(x, y, len, '#6b7681');
  }
  put(scene, 'graffiti', p);
}

/** Advertisement copy. */
export function makeAdScreen(scene: Phaser.Scene, text: string, hostile: boolean): void {
  const w = PROPS.ad.w - 6;
  const h = PROPS.ad.h - 6;
  const p = new Painter(w, h, 71);
  p.vgrad(0, 0, w, h, hostile ? '#2a0e10' : '#0b1a20', '#050a0d');
  // a scanline wash *under* the type, so the type stays crisp
  p.scanlines(0, 0, w, h, '#00000030', 3);
  // two dead pixel columns, pushed to the bezel where they cost no legibility
  p.vline(1, 0, h, PAL.ink);
  p.vline(w - 2, 0, h, PAL.ink);
  p.textBlock(text, 3, 4, w - 6, hostile ? PAL.red2 : PAL.cyan3, {
    size: 7,
    lineHeight: 9,
    threshold: 90,
  });
  p.text('SECTOR 12', 3, h - 7, '#3b4550', { size: 5 });
  put(scene, 'ad-screen', p);
}

/** The terminal's little screen. */
export function makeTerminalScreen(scene: Phaser.Scene, text: string, tone: 'idle' | 'busy' | 'deny' | 'ok'): void {
  const w = PROPS.terminal.w - 6;
  const h = 14;
  const p = new Painter(w, h, 72);
  const bg = tone === 'deny' ? '#200a0a' : tone === 'ok' ? '#0a2013' : '#07161a';
  const fg = tone === 'deny' ? PAL.red2 : tone === 'ok' ? PAL.green : tone === 'busy' ? PAL.amber2 : PAL.cyan2;
  p.rect(0, 0, w, h, bg);
  p.scanlines(0, 0, w, h, '#00000040', 3);
  text.split('\n').forEach((ln, i) => {
    p.text(ln.slice(0, 5), 1, 1 + i * 7, fg, { size: 7, threshold: 85 });
  });
  put(scene, 'term-screen', p);
}

// ------------------------------------------------------------------ assembly

export const ITEM_ICON_KEYS = ['shard', 'knife', 'strip', 'badge', 'key', 'ration'] as const;

/** Called once from the boot scene. */
export function buildTextures(scene: Phaser.Scene): void {
  put(scene, 'bg', drawBackground());
  put(scene, 'sign', drawSign());
  put(scene, 'ad-frame', drawAdFrame());
  put(scene, 'hopper', drawHopper());
  put(scene, 'rubble', drawRubble());
  put(scene, 'dispenser', drawDispenser());
  put(scene, 'grate', drawGrate());
  put(scene, 'grate-empty', drawGrateEmpty());
  put(scene, 'puddle', drawPuddle());
  put(scene, 'stencil', drawStencil());
  put(scene, 'conduit', drawConduit());
  put(scene, 'recess', drawRecess());
  put(scene, 'drone', drawDrone(false));
  put(scene, 'drone-fixed', drawDrone(true));
  put(scene, 'terminal', drawTerminal());
  put(scene, 'door', drawDoor(false));
  put(scene, 'door-open', drawDoor(true));
  put(scene, 'cam-mount', drawCameraMount());
  put(scene, 'cam-head', drawCameraHead());
  put(scene, 'window-glow', drawWindowGlow());

  for (const pose of ['idle', 'walk0', 'walk1', 'walk2', 'walk3', 'reach', 'work'] as Pose[]) {
    put(scene, `mara-${pose}`, drawMara(pose));
  }
}

/** Item icons live in the DOM inventory, so they are handed back as canvases. */
export function itemIconCanvas(id: string): HTMLCanvasElement {
  return drawItemIcon(id).canvas;
}
