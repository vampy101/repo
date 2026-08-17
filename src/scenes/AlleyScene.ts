import Phaser from 'phaser';
import { PAL } from '../art/painter';
import {
  CAMERA_PIVOT,
  PROPS,
  buildCursors,
  buildTextures,
  itemIconCanvas,
  makeAdScreen,
  makeGraffiti,
  makeTerminalScreen,
  type CursorSet,
} from '../art/textures';
import { ITEMS } from '../data/items';
import {
  BLIND_SPOT,
  BLOCKERS,
  CAMERA_ZONE,
  GROUND,
  HOTSPOTS,
  HOTSPOT_BY_ID,
  REACH,
  START_POS,
  VIEW_H,
  VIEW_W,
  rectContains,
  type HotspotDef,
} from '../data/scene';
import type { Engine } from '../game/engine';
import { NavMesh, type Pt } from '../game/nav';
import type { Effect, HotspotId, ItemId, Reaction, Verb, WinPath } from '../game/types';

export interface AlleyHost {
  engine: Engine;
  /** Runs a player action, then presents it and saves. */
  act(fn: () => Reaction): void;
  /** Presents something the world did on its own; no autosave storm. */
  ambient(r: Reaction): void;
  whisper(text: string): void;
  dialogueOpen(): boolean;
  advanceDialogue(): void;
  blocked(): boolean;
  /** The scene calls this once create() has finished and it is safe to drive. */
  sceneReady(scene: AlleyScene): void;
  onWin(path: WinPath): void;
  setStatusLine(text: string): void;
  onSelectItem(item: ItemId | null): void;
}

const WALK_SPEED = 54; // px/sec
const STEP_TIME = 130; // ms per walk frame
const WALK_FRAMES = ['mara-walk0', 'mara-walk1', 'mara-walk2', 'mara-walk3'];

/** Camera patrol keyframes: [seconds, degrees]. 90 deg = straight down at the door. */
const PATROL: [number, number][] = [
  [0, 90],
  [3.0, 90],
  [4.5, 170],
  [7.0, 170],
  [8.5, 90],
];
const PATROL_LOOP = 8.5;
const DOOR_WATCH_ARC = 34; // degrees either side of 90 that still covers the apron

interface Pending {
  hotspot: HotspotId;
  verb: Verb;
  item: ItemId | null;
}

interface Drop {
  x: number;
  y: number;
  v: number;
  len: number;
}

export class AlleyScene extends Phaser.Scene {
  private host!: AlleyHost;
  private nav!: NavMesh;
  private cursors!: CursorSet;
  private itemCursors = new Map<ItemId, string>();

  private mara!: Phaser.GameObjects.Image;
  private path: Pt[] = [];
  private pending: Pending | null = null;
  private stepTimer = 0;
  private stepFrame = 0;
  private poseHold = 0;
  private facing = 1;

  private camHead!: Phaser.GameObjects.Image;
  private camCone!: Phaser.GameObjects.Graphics;
  private lamps!: Phaser.GameObjects.Graphics;
  private hints!: Phaser.GameObjects.Graphics;
  private rainGfx!: Phaser.GameObjects.Graphics;
  private flash!: Phaser.GameObjects.Rectangle;

  private grateImg!: Phaser.GameObjects.Image;
  private doorImg!: Phaser.GameObjects.Image;
  private droneImg!: Phaser.GameObjects.Image;
  private graffitiImg!: Phaser.GameObjects.Image;
  private conduitImg!: Phaser.GameObjects.Image;
  private adScreen!: Phaser.GameObjects.Image;
  private termScreen!: Phaser.GameObjects.Image;
  private windowGlows: Phaser.GameObjects.Image[] = [];

  private drops: Drop[] = [];
  private camPhase = 0;
  private camAngle = 90;
  private maintenanceLeft = 0;
  private doorWindowLeft = 0;
  private loiterTimer = 0;
  private hideTimer = 0;
  private adTimer = 0;
  private whisperTimer = 8;
  private eyeTimer = 5;
  private breathT = 0;
  private hoverText = '';
  private lastTier = 1;
  private lastDoor = '';
  private lastTermKey = '';
  private hintsOn = false;
  private ready = false;
  private toldAboutBlindSpot = false;
  private winTriggered = false;

  constructor() {
    super({ key: 'alley' });
  }

  init(): void {
    // The Game constructor makes the registry available before any scene boots,
    // which is earlier than SceneManager.add() can hand back an instance.
    this.host = this.registry.get('host') as AlleyHost;
  }

  preload(): void {
    buildTextures(this);
    this.cursors = buildCursors();
  }

  create(): void {
    this.nav = new NavMesh(GROUND, BLOCKERS, VIEW_W, VIEW_H);

    // The three live-text textures must exist before anything references them.
    const engine = this.host.engine;
    makeGraffiti(this, engine.graffitiText, engine.graffitiStage === 0);
    makeAdScreen(this, engine.adLine(), engine.tier >= 4);
    makeTerminalScreen(this, 'RES?\nSRV', 'idle');

    this.add.image(0, 0, 'bg').setOrigin(0, 0).setDepth(0);

    // ---- wall furniture -------------------------------------------------
    this.place('sign', PROPS.sign, 20);
    this.place('ad-frame', PROPS.ad, 20);
    this.adScreen = this.add
      .image(PROPS.ad.x + 3, PROPS.ad.y + 3, 'ad-screen')
      .setOrigin(0, 0)
      .setDepth(21);
    this.conduitImg = this.place('conduit', PROPS.conduit, 20);
    this.graffitiImg = this.place('graffiti', PROPS.graffiti, 20);
    this.place('stencil', PROPS.stencil, 20);
    this.place('recess', PROPS.recess, 19);
    this.place('terminal', PROPS.terminal, 20);
    this.termScreen = this.add
      .image(PROPS.terminal.x + 3, PROPS.terminal.y + 4, 'term-screen')
      .setOrigin(0, 0)
      .setDepth(21);
    this.doorImg = this.place('door', PROPS.door, 20);
    this.place('cam-mount', PROPS.camera, 22);
    this.camCone = this.add.graphics().setDepth(6);
    this.camHead = this.add
      .image(CAMERA_PIVOT.x, CAMERA_PIVOT.y, 'cam-head')
      .setOrigin(0.12, 0.5)
      .setDepth(23);

    for (const [wx, wy] of [
      [262, 20],
      [284, 22],
      [296, 38],
      [266, 40],
    ] as const) {
      const g = this.add.image(wx, wy, 'window-glow').setOrigin(0, 0).setDepth(18).setAlpha(0);
      this.windowGlows.push(g);
    }

    // ---- ground furniture ----------------------------------------------
    this.grateImg = this.place('grate', PROPS.grate, 6);
    this.place('puddle', PROPS.puddle, 5);
    this.place('dispenser', PROPS.dispenser, 151);
    this.place('rubble', PROPS.rubble, 153);
    this.droneImg = this.place('drone', PROPS.drone, 152);
    this.place('hopper', PROPS.hopper, 177);

    this.lamps = this.add.graphics().setDepth(24);

    // ---- Mara ------------------------------------------------------------
    this.mara = this.add
      .image(START_POS.x, START_POS.y, 'mara-idle')
      .setOrigin(0.5, 1)
      .setDepth(START_POS.y);

    // ---- weather and overlays -------------------------------------------
    this.rainGfx = this.add.graphics().setDepth(900);
    for (let i = 0; i < 90; i++) {
      this.drops.push({
        x: Math.random() * (VIEW_W + 40) - 20,
        y: Math.random() * VIEW_H,
        v: 150 + Math.random() * 190,
        len: 2 + Math.floor(Math.random() * 4),
      });
    }
    this.hints = this.add.graphics().setDepth(950);
    this.flash = this.add
      .rectangle(0, 0, VIEW_W, VIEW_H, 0xd8433a, 0)
      .setOrigin(0, 0)
      .setDepth(960);

    // ---- input -----------------------------------------------------------
    this.input.mouse?.disableContextMenu();
    this.input.on('pointerdown', this.onPointerDown, this);
    this.input.on('pointermove', this.onPointerMove, this);
    // Leaving the canvas must drop the hover label, or a stale "LOOK AT ..."
    // outlives the cursor and hides the selected item in the HUD.
    this.game.canvas.addEventListener('mouseleave', () => {
      this.hoverText = '';
      this.host.setStatusLine('');
    });

    this.ready = true;
    this.syncWorldToState();
    this.host.sceneReady(this);
  }

  private place(
    key: string,
    at: { x: number; y: number },
    depth: number,
  ): Phaser.GameObjects.Image {
    return this.add.image(at.x, at.y, key).setOrigin(0, 0).setDepth(depth);
  }

  // ------------------------------------------------------------------ input

  private onPointerDown(pointer: Phaser.Input.Pointer): void {
    if (this.host.blocked()) return;
    if (this.host.dialogueOpen()) {
      this.host.advanceDialogue();
      return;
    }
    const x = pointer.worldX;
    const y = pointer.worldY;
    const right = pointer.rightButtonDown() || pointer.button === 2;
    const engine = this.host.engine;
    const selected = engine.state.selected;

    // Clicking Mara with an item selected uses it on herself.
    if (!right && selected && this.overMara(x, y)) {
      this.host.act(() => engine.use(selected, 'self'));
      this.host.onSelectItem(null);
      return;
    }

    const hs = this.hotspotAt(x, y);
    if (!hs) {
      if (right) {
        this.host.act(() => this.lookAtNothing());
        return;
      }
      if (selected) {
        // A miss with an item selected just drops the selection, quietly.
        this.host.onSelectItem(null);
      }
      const target = this.nav.nearestWalkable(x, y);
      if (target) this.walkTo(target);
      return;
    }

    if (right) {
      this.approach(hs, 'examine', null);
      return;
    }
    if (selected) {
      this.approach(hs, 'use', selected);
      return;
    }
    this.approach(hs, hs.defaultVerb, null);
  }

  private lookAtNothing(): Reaction {
    const lines = [
      'Wet concrete and municipal opinion. That is the whole inventory of this alley.',
      'Rain. More rain. Rain with ambitions.',
      'Nothing there, and something is definitely watching me check.',
    ];
    const i = Math.floor(this.time.now / 997) % lines.length;
    return { lines: [{ who: 'MARA', text: lines[i] }], toasts: [], effects: [], refused: true };
  }

  private onPointerMove(pointer: Phaser.Input.Pointer): void {
    const x = pointer.worldX;
    const y = pointer.worldY;
    const engine = this.host.engine;
    const selected = engine.state.selected;
    const hs = this.hotspotAt(x, y);
    const canvas = this.game.canvas;

    let cursor = this.cursors.no;
    let label = '';

    if (selected) {
      const url = this.itemCursor(selected);
      if (hs) {
        cursor = url;
        label = `USE ${ITEMS[selected].name.toUpperCase()} ON ${hs.label.toUpperCase()}`;
      } else if (this.overMara(x, y)) {
        cursor = url;
        label = `USE ${ITEMS[selected].name.toUpperCase()} ON MYSELF`;
      } else if (this.nav.nearestWalkable(x, y, 4)) {
        cursor = this.cursors.walk;
        label = `${ITEMS[selected].name.toUpperCase()} SELECTED · CLICK A TARGET`;
      } else {
        cursor = url;
        label = `${ITEMS[selected].name.toUpperCase()} SELECTED`;
      }
    } else if (hs) {
      cursor =
        hs.defaultVerb === 'talk'
          ? this.cursors.talk
          : hs.defaultVerb === 'use'
            ? this.cursors.hand
            : this.cursors.look;
      const verb = hs.defaultVerb === 'talk' ? 'SPEAK TO' : hs.defaultVerb === 'use' ? 'USE' : 'LOOK AT';
      label = `${verb} ${hs.label.toUpperCase()}   (right click to examine)`;
    } else if (this.nav.nearestWalkable(x, y, 4)) {
      cursor = this.cursors.walk;
      label = 'WALK';
    }

    canvas.style.cursor = `url(${cursor}) 8 8, auto`;
    if (label !== this.hoverText) {
      this.hoverText = label;
      this.host.setStatusLine(label || this.host.engine.objective());
    }
  }

  private itemCursor(item: ItemId): string {
    let url = this.itemCursors.get(item);
    if (!url) {
      url = itemIconCanvas(item).toDataURL();
      this.itemCursors.set(item, url);
    }
    return url;
  }

  private overMara(x: number, y: number): boolean {
    return Math.abs(x - this.mara.x) <= 8 && y >= this.mara.y - 30 && y <= this.mara.y + 2;
  }

  /** Smallest matching rect wins, so a small prop inside a big one stays clickable. */
  private hotspotAt(x: number, y: number): HotspotDef | null {
    let best: HotspotDef | null = null;
    let bestArea = Infinity;
    for (const h of HOTSPOTS) {
      if (!rectContains(h.rect, x, y)) continue;
      // Large foreground props yield to the floor Mara can actually stand on.
      if (h.groundFirst && this.nav.isWalkable(x, y)) continue;
      const area = (h.rect.x2 - h.rect.x1) * (h.rect.y2 - h.rect.y1);
      if (area < bestArea) {
        bestArea = area;
        best = h;
      }
    }
    return best;
  }

  // ----------------------------------------------------------- walk & reach

  private walkTo(target: Pt): void {
    this.pending = null;
    this.path = this.nav.findPath({ x: this.mara.x, y: this.mara.y }, target);
  }

  private approach(hs: HotspotDef, verb: Verb, item: ItemId | null): void {
    const dist = Math.hypot(this.mara.x - hs.stand.x, this.mara.y - hs.stand.y);
    if (dist <= REACH) {
      this.faceTowards(hs);
      this.runAction(hs.id, verb, item);
      return;
    }
    this.pending = { hotspot: hs.id, verb, item };
    this.path = this.nav.findPath({ x: this.mara.x, y: this.mara.y }, hs.stand);
    if (!this.path.length) {
      // Already there, or unreachable: act anyway rather than stall.
      this.faceTowards(hs);
      this.runAction(hs.id, verb, item);
      this.pending = null;
    }
  }

  private faceTowards(hs: HotspotDef): void {
    const cx = (hs.rect.x1 + hs.rect.x2) / 2;
    this.facing = cx >= this.mara.x ? 1 : -1;
    this.mara.setFlipX(this.facing < 0);
  }

  private runAction(id: HotspotId, verb: Verb, item: ItemId | null): void {
    const engine = this.host.engine;
    if (verb === 'use' && item) {
      this.setPose(id === 'grate' ? 'reach' : 'work', 550);
      this.host.act(() => engine.use(item, id));
      this.host.onSelectItem(null);
      return;
    }
    if (verb === 'talk') {
      this.host.act(() => engine.talk(id));
      return;
    }
    if (verb === 'use') {
      if (id === 'grate' || id === 'vending' || id === 'terminal') this.setPose('work', 500);
      this.host.act(() => engine.interact(id));
      return;
    }
    this.host.act(() => engine.examine(id));
  }

  private setPose(pose: 'reach' | 'work' | 'idle', ms: number): void {
    this.mara.setTexture(`mara-${pose}`);
    this.poseHold = ms;
  }

  // ------------------------------------------------------------- world sync

  /** Pushes engine state into the visible scene. Safe to call any time. */
  syncWorldToState(): void {
    if (!this.ready) return;
    const engine = this.host.engine;
    const s = engine.state;
    this.grateImg.setTexture(s.flags.gotBadge ? 'grate-empty' : 'grate');
    this.droneImg.setTexture(s.flags.droneRepaired ? 'drone-fixed' : 'drone');
    this.doorImg.setTexture(s.door === 'open' ? 'door-open' : 'door');
    if (s.flags.droneRepaired) this.droneImg.setY(PROPS.drone.y + 12);
    this.refreshGraffiti(false);
    this.refreshTerminal();
    this.lastDoor = s.door;
    if (s.flags.entered) this.mara.setAlpha(0);
    if (s.flags.terminalMaintenance && this.maintenanceLeft <= 0) this.maintenanceLeft = 60;
    if (s.door === 'disconnected' && this.doorWindowLeft <= 0) this.doorWindowLeft = 60;
  }

  resetToStart(): void {
    if (!this.ready) return;
    this.path = [];
    this.pending = null;
    this.mara.setPosition(START_POS.x, START_POS.y).setAlpha(1).setTexture('mara-idle');
    this.mara.setDepth(START_POS.y);
    this.maintenanceLeft = 0;
    this.doorWindowLeft = 0;
    this.loiterTimer = 0;
    this.hideTimer = 0;
    this.winTriggered = false;
    this.toldAboutBlindSpot = false;
    this.syncWorldToState();
  }

  toggleHints(): boolean {
    if (!this.ready) return false;
    this.hintsOn = !this.hintsOn;
    if (!this.hintsOn) this.hints.clear();
    return this.hintsOn;
  }

  private refreshGraffiti(flicker: boolean): void {
    makeGraffiti(this, this.host.engine.graffitiText, this.host.engine.graffitiStage === 0);
    this.graffitiImg.setTexture('graffiti');
    if (flicker) {
      this.graffitiImg.setAlpha(0.15);
      this.tweens.add({ targets: this.graffitiImg, alpha: 1, duration: 420, ease: 'Quad.easeIn' });
    }
  }

  private refreshAd(): void {
    makeAdScreen(this, this.host.engine.adLine(), this.host.engine.tier >= 4);
    this.adScreen.setTexture('ad-screen');
  }

  private refreshTerminal(): void {
    const engine = this.host.engine;
    const s = engine.state;
    // The screen is 16x14 pixels: two lines of five characters, no more.
    let text = 'RES?\nSRV';
    let tone: 'idle' | 'busy' | 'deny' | 'ok' = 'idle';
    if (s.flags.entered || s.door === 'open') {
      text = 'CLER\nERR';
      tone = 'ok';
    } else if (s.door === 'disconnected') {
      text = 'TEMP\nOPEN';
      tone = 'ok';
    } else if (s.flags.terminalMaintenance) {
      text = 'MNT\n4471';
      tone = 'busy';
    } else if (s.counters.scanFails > 0) {
      text = 'ID\nBAD';
      tone = 'deny';
    }
    const key = `${text}|${tone}`;
    if (key === this.lastTermKey) return;
    this.lastTermKey = key;
    makeTerminalScreen(this, text, tone);
    this.termScreen.setTexture('term-screen');
  }

  // ---------------------------------------------------------------- effects

  applyEffects(effects: Effect[]): void {
    if (!this.ready) return;
    for (const e of effects) {
      switch (e.kind) {
        case 'graffiti': {
          const far = Math.abs(this.mara.x - (PROPS.graffiti.x + PROPS.graffiti.w / 2)) > 55;
          this.refreshGraffiti(far);
          break;
        }
        case 'camera-loop':
          this.maintenanceLeft = e.seconds;
          break;
        case 'camera-snap':
          this.camAngle = 200;
          break;
        case 'door':
          this.doorImg.setTexture(e.state === 'open' ? 'door-open' : 'door');
          if (e.state === 'disconnected') this.doorWindowLeft = 60;
          if (e.state === 'locked') this.doorWindowLeft = 0;
          this.refreshTerminal();
          break;
        case 'drone-fixed':
          this.droneImg.setTexture('drone-fixed');
          this.droneImg.setY(PROPS.drone.y + 12);
          break;
        case 'glitch':
          document.getElementById('rig')?.classList.remove('glitch');
          void document.getElementById('rig')?.offsetWidth;
          document.getElementById('rig')?.classList.add('glitch');
          this.cameras.main.shake(140, 0.004);
          break;
        case 'shake':
          this.cameras.main.shake(200, 0.002 * e.power);
          break;
        case 'whisper':
          this.host.whisper(e.text);
          break;
        case 'purge':
          this.doPurge();
          break;
        case 'win':
          this.doWin(e.path);
          break;
        case 'mara-pose':
          this.setPose(e.pose, e.seconds * 1000);
          break;
        case 'sfx':
          break; // handled by the host
      }
    }
    this.refreshTerminal();
  }

  private doPurge(): void {
    this.flash.setAlpha(0.55);
    this.tweens.add({ targets: this.flash, alpha: 0, duration: 900 });
    this.cameras.main.shake(500, 0.01);
    this.path = [];
    this.pending = null;
    this.maintenanceLeft = 0;
    this.doorWindowLeft = 0;
    this.mara.setPosition(START_POS.x, START_POS.y).setTexture('mara-idle');
    this.mara.setDepth(START_POS.y);
    this.doorImg.setTexture('door');
  }

  private doWin(path: WinPath): void {
    if (this.winTriggered) return;
    this.winTriggered = true;
    this.path = [];
    this.pending = null;
    this.camAngle = 200; // the lens turns away
    const doorMid = PROPS.door.x + PROPS.door.w / 2;
    this.tweens.add({
      targets: this.mara,
      x: doorMid,
      y: 152,
      alpha: 0,
      duration: 1400,
      ease: 'Sine.easeIn',
      onComplete: () => this.host.onWin(path),
    });
  }

  // ----------------------------------------------------------------- update

  override update(_time: number, delta: number): void {
    if (!this.ready) return;
    const dt = Math.min(delta, 50) / 1000;
    const engine = this.host.engine;
    const blocked = this.host.blocked();

    this.updateMara(dt);
    this.updateCamera(dt);
    this.updateRain(dt);
    this.updateLamps();
    this.updateHints();

    if (!blocked && !engine.finished) {
      engine.state.elapsed += dt;
      this.updateAttentionZones(dt);
      this.updateTimers(dt);
      this.updateAmbience(dt);
    }

    const tier = engine.tier;
    if (tier !== this.lastTier) {
      this.lastTier = tier;
      this.refreshAd();
    }
    if (engine.state.door !== this.lastDoor) {
      this.lastDoor = engine.state.door;
      this.refreshTerminal();
    }
  }

  private updateMara(dt: number): void {
    if (this.poseHold > 0) {
      this.poseHold -= dt * 1000;
      if (this.poseHold <= 0 && !this.path.length) this.mara.setTexture('mara-idle');
    }

    if (this.path.length) {
      let budget = WALK_SPEED * dt;
      while (budget > 0 && this.path.length) {
        const next = this.path[0];
        const dx = next.x - this.mara.x;
        const dy = next.y - this.mara.y;
        const d = Math.hypot(dx, dy);
        if (d <= budget || d < 0.01) {
          this.mara.setPosition(next.x, next.y);
          this.path.shift();
          budget -= d;
        } else {
          this.mara.setPosition(this.mara.x + (dx / d) * budget, this.mara.y + (dy / d) * budget);
          if (Math.abs(dx) > 0.4) {
            this.facing = dx > 0 ? 1 : -1;
            this.mara.setFlipX(this.facing < 0);
          }
          budget = 0;
        }
      }
      this.stepTimer += dt * 1000;
      if (this.stepTimer >= STEP_TIME) {
        this.stepTimer = 0;
        this.stepFrame = (this.stepFrame + 1) % WALK_FRAMES.length;
      }
      this.mara.setTexture(WALK_FRAMES[this.stepFrame]);
      this.poseHold = 0;

      if (!this.path.length) {
        this.mara.setTexture('mara-idle');
        this.stepFrame = 0;
        const p = this.pending;
        if (p) {
          this.pending = null;
          const hs = HOTSPOT_BY_ID[p.hotspot];
          this.faceTowards(hs);
          this.runAction(p.hotspot, p.verb, p.item);
        }
      }
    }
    this.mara.setDepth(this.mara.y);
  }

  private updateCamera(dt: number): void {
    const engine = this.host.engine;
    if (this.winTriggered || engine.finished) {
      this.camAngle += (200 - this.camAngle) * Math.min(1, dt * 3);
    } else if (this.maintenanceLeft > 0) {
      // Calibration sweep: nose to the wall, counting tiles.
      this.camPhase += dt;
      const target = 182 + Math.sin(this.camPhase * 1.1) * 6;
      this.camAngle += (target - this.camAngle) * Math.min(1, dt * 4);
    } else if (engine.tierInfo.cameraTracks) {
      const dx = this.mara.x - CAMERA_PIVOT.x;
      const dy = Math.max(6, this.mara.y - 14 - CAMERA_PIVOT.y);
      let target = (Math.atan2(dy, dx) * 180) / Math.PI;
      if (target < 0) target += 360;
      target = Phaser.Math.Clamp(target, 62, 176);
      this.camAngle += (target - this.camAngle) * Math.min(1, dt * 2.4);
    } else {
      this.camPhase = (this.camPhase + dt) % PATROL_LOOP;
      this.camAngle = patrolAngle(this.camPhase);
    }
    this.camHead.setAngle(this.camAngle);

    // view cone: faint, and only once the city is actually paying attention
    this.camCone.clear();
    const tier = engine.tier;
    const blind = this.maintenanceLeft > 0;
    if (tier >= 2 || blind) {
      const rad = (this.camAngle * Math.PI) / 180;
      const spread = 0.3;
      const len = 96;
      const color = blind ? 0x2a7d86 : tier >= 4 ? 0xd8433a : 0x47b6bf;
      this.camCone.fillStyle(color, blind ? 0.05 : 0.05 + tier * 0.014);
      this.camCone.beginPath();
      this.camCone.moveTo(CAMERA_PIVOT.x, CAMERA_PIVOT.y);
      this.camCone.lineTo(
        CAMERA_PIVOT.x + Math.cos(rad - spread) * len,
        CAMERA_PIVOT.y + Math.sin(rad - spread) * len,
      );
      this.camCone.lineTo(
        CAMERA_PIVOT.x + Math.cos(rad + spread) * len,
        CAMERA_PIVOT.y + Math.sin(rad + spread) * len,
      );
      this.camCone.closePath();
      this.camCone.fillPath();
    }
  }

  /** Is the lens covering the terminal / door apron right now? */
  private get watchingApron(): boolean {
    if (this.maintenanceLeft > 0) return false;
    return Math.abs(this.camAngle - 90) <= DOOR_WATCH_ARC;
  }

  private updateAttentionZones(dt: number): void {
    const engine = this.host.engine;
    const x = this.mara.x;
    const y = this.mara.y;
    const inZone = rectContains(CAMERA_ZONE, x, y);
    const hidden = rectContains(BLIND_SPOT, x, y);
    const tracking = engine.tierInfo.cameraTracks && this.maintenanceLeft <= 0;

    if (hidden) {
      this.loiterTimer = 0;
      this.hideTimer += dt;
      if (!this.toldAboutBlindSpot) {
        this.toldAboutBlindSpot = true;
        this.host.ambient({
          lines: [
            {
              who: 'CIVIC',
              text: 'Citizen has entered an unmonitored volume. I have noted the volume, not the citizen. This is the best I can offer.',
            },
          ],
          toasts: [{ text: 'OUT OF SIGHT · attention will fall', tone: 'calm' }],
          effects: [],
        });
      }
      if (this.hideTimer >= 5) {
        this.hideTimer = 0;
        this.host.ambient(engine.lower(1, 'out of sight', 1));
      }
      return;
    }
    this.hideTimer = 0;

    const seen = (inZone && this.watchingApron) || (tracking && !hidden && inZone);
    if (seen) {
      this.loiterTimer += dt;
      if (this.loiterTimer >= 4.5) {
        this.loiterTimer = 0;
        this.host.ambient(engine.raise(1, 'loitering in the camera zone'));
      }
    } else {
      this.loiterTimer = Math.max(0, this.loiterTimer - dt * 0.5);
    }
  }

  private updateTimers(dt: number): void {
    const engine = this.host.engine;
    if (this.maintenanceLeft > 0) {
      this.maintenanceLeft -= dt;
      if (this.maintenanceLeft <= 0) {
        this.maintenanceLeft = 0;
        this.host.ambient(engine.endMaintenance());
      }
    }
    if (this.doorWindowLeft > 0) {
      this.doorWindowLeft -= dt;
      if (this.doorWindowLeft <= 0) {
        this.doorWindowLeft = 0;
        this.host.ambient(engine.expireDoor());
      }
    }
  }

  private updateAmbience(dt: number): void {
    const engine = this.host.engine;

    this.adTimer += dt;
    if (this.adTimer >= 11) {
      this.adTimer = 0;
      this.refreshAd();
    }

    this.whisperTimer -= dt;
    if (this.whisperTimer <= 0) {
      this.whisperTimer = engine.tierInfo.whisperEvery;
      if (!this.host.dialogueOpen()) this.host.whisper(engine.whisper());
    }

    // windows opening like eyes, once the city is interested
    this.eyeTimer -= dt;
    if (this.eyeTimer <= 0) {
      this.eyeTimer = Math.max(3, 11 - engine.tier * 1.6);
      if (engine.tier >= 2) {
        const g = this.windowGlows[Math.floor(Math.random() * this.windowGlows.length)];
        this.tweens.killTweensOf(g);
        g.setAlpha(0);
        this.tweens.add({
          targets: g,
          alpha: { from: 0, to: 0.85 },
          duration: 220,
          yoyo: true,
          hold: 380 + Math.random() * 700,
        });
      }
    }

    // the architecture breathing
    this.breathT += dt;
    const amp = 0.05 + engine.tier * 0.035;
    const t = (Math.sin(this.breathT * 1.05) + 1) / 2;
    this.conduitImg.setAlpha(1 - amp * (1 - t) * 0.5);
    const violet = Phaser.Display.Color.Interpolate.ColorWithColor(
      new Phaser.Display.Color(255, 255, 255),
      new Phaser.Display.Color(198, 176, 255),
      100,
      Math.round(t * 100 * Math.min(1, engine.tier / 3)),
    );
    this.conduitImg.setTint(
      Phaser.Display.Color.GetColor(violet.r, violet.g, violet.b),
    );
  }

  private updateRain(dt: number): void {
    const g = this.rainGfx;
    g.clear();
    g.lineStyle(1, 0x8fe6e8, 0.14);
    g.beginPath();
    for (const d of this.drops) {
      d.y += d.v * dt;
      d.x += d.v * dt * 0.16;
      if (d.y > VIEW_H) {
        d.y = -6 - Math.random() * 20;
        d.x = Math.random() * (VIEW_W + 40) - 30;
      }
      if (d.x > VIEW_W + 8) d.x = -8;
      g.moveTo(Math.round(d.x), Math.round(d.y));
      g.lineTo(Math.round(d.x - d.len * 0.16), Math.round(d.y - d.len));
    }
    g.strokePath();
    // splashes on the wet ground
    g.fillStyle(0xcfd6d8, 0.1);
    for (let i = 0; i < 12; i++) {
      const x = Math.floor(Math.random() * VIEW_W);
      const y = 141 + Math.floor(Math.random() * 38);
      g.fillRect(x, y, 1, 1);
    }
  }

  private updateLamps(): void {
    const engine = this.host.engine;
    const g = this.lamps;
    g.clear();

    // camera status light at the lens
    const rad = (this.camAngle * Math.PI) / 180;
    const lx = Math.round(CAMERA_PIVOT.x + Math.cos(rad) * 13);
    const ly = Math.round(CAMERA_PIVOT.y + Math.sin(rad) * 13);
    const blind = this.maintenanceLeft > 0;
    const alert = engine.tier >= 3;
    const lampColor = blind ? 0x2a7d86 : alert ? 0xd8433a : this.watchingApron ? 0xf0a33c : 0x47b6bf;
    const blink = blind ? 1 : Math.floor(this.time.now / (alert ? 220 : 700)) % 2 === 0 ? 1 : 0.35;
    g.fillStyle(lampColor, 0.95 * (blind ? 0.5 : blink));
    g.fillRect(lx, ly, 2, 2);

    // door status lamp: red locked · amber unlatched · green open
    const s = engine.state;
    const doorLamp = s.door === 'open' ? 0x7fd98a : s.door === 'disconnected' ? 0xf0a33c : 0xd8433a;
    const dx = PROPS.door.x + PROPS.door.w / 2 - 2;
    const dy = PROPS.door.y + 3;
    const pulse = s.door === 'disconnected' ? (Math.floor(this.time.now / 260) % 2 === 0 ? 1 : 0.3) : 1;
    g.fillStyle(doorLamp, 0.95 * pulse);
    g.fillRect(dx, dy, 4, 2);
    g.fillStyle(doorLamp, 0.18);
    g.fillRect(dx - 3, dy - 1, 10, 4);

    // terminal caret
    if (Math.floor(this.time.now / 500) % 2 === 0) {
      g.fillStyle(0x8fe6e8, 0.8);
      g.fillRect(PROPS.terminal.x + 4, PROPS.terminal.y + 16, 2, 1);
    }

    // drone fault lamp flickers while it is still broken and frightened
    if (!s.flags.droneRepaired) {
      const jitter = Math.sin(this.time.now / 90) * 0.5;
      this.droneImg.setX(PROPS.drone.x + jitter);
      if (Math.floor(this.time.now / 320) % 3 === 0) {
        g.fillStyle(0xd8433a, 0.8);
        g.fillRect(PROPS.drone.x + 15, PROPS.drone.y + 5, 4, 2);
      }
    } else {
      // repaired: it gets on with its round
      const sweep = PROPS.drone.x + Math.sin(this.time.now / 2600) * 22;
      this.droneImg.setX(Math.round(sweep));
      this.droneImg.setFlipX(Math.cos(this.time.now / 2600) < 0);
    }
  }

  private updateHints(): void {
    if (!this.hintsOn) return;
    const g = this.hints;
    g.clear();
    g.lineStyle(1, 0x47b6bf, 0.75);
    for (const h of HOTSPOTS) {
      g.strokeRect(h.rect.x1 + 0.5, h.rect.y1 + 0.5, h.rect.x2 - h.rect.x1 - 1, h.rect.y2 - h.rect.y1 - 1);
      g.fillStyle(0x47b6bf, 0.5);
      g.fillRect(h.stand.x - 1, h.stand.y - 1, 3, 3);
    }
    g.lineStyle(1, 0xf0a33c, 0.35);
    g.strokeRect(GROUND.x1 + 0.5, GROUND.y1 + 0.5, GROUND.x2 - GROUND.x1 - 1, GROUND.y2 - GROUND.y1 - 1);
    for (const b of BLOCKERS) {
      g.lineStyle(1, 0xd8433a, 0.4);
      g.strokeRect(b.x1 + 0.5, b.y1 + 0.5, b.x2 - b.x1 - 1, b.y2 - b.y1 - 1);
    }
  }

  // ------------------------------------------------------- test/debug access

  /** Used by the automated browser playtest to drive the scene deterministically. */
  isReady(): boolean {
    return this.ready;
  }

  debugApi() {
    return {
      pos: () => ({ x: this.mara.x, y: this.mara.y }),
      walking: () => this.path.length > 0,
      teleport: (x: number, y: number) => {
        this.path = [];
        this.pending = null;
        const p = this.nav.nearestWalkable(x, y);
        if (p) this.mara.setPosition(p.x, p.y);
      },
      camAngle: () => this.camAngle,
      maintenanceLeft: () => this.maintenanceLeft,
      doorWindowLeft: () => this.doorWindowLeft,
      hotspotStand: (id: HotspotId) => HOTSPOT_BY_ID[id].stand,
      pathTo: (x: number, y: number) => this.nav.findPath({ x: this.mara.x, y: this.mara.y }, { x, y }),
      walkable: (x: number, y: number) => this.nav.isWalkable(x, y),
      palette: PAL,
    };
  }
}

function patrolAngle(t: number): number {
  for (let i = 0; i < PATROL.length - 1; i++) {
    const [t0, a0] = PATROL[i];
    const [t1, a1] = PATROL[i + 1];
    if (t >= t0 && t <= t1) {
      const k = t1 === t0 ? 0 : (t - t0) / (t1 - t0);
      return a0 + (a1 - a0) * k;
    }
  }
  return 90;
}
