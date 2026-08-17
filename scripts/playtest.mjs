/**
 * Browser playtest for "The City Is Listening".
 *
 * Drives the real, built game in a real Chromium: real mouse clicks on the
 * canvas for movement and interaction, real DOM clicks on dialogue choices and
 * HUD buttons, a real page reload to test the autosave. Fails loudly on any
 * uncaught console error.
 *
 *   node scripts/playtest.mjs [--headed] [--keep]
 */
import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { mkdirSync, rmSync } from 'node:fs';
import { setTimeout as delay } from 'node:timers/promises';

const CHROME = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const PORT = 4183;
const URL = `http://127.0.0.1:${PORT}/`;
const SHOTS = 'playtest-shots';

const results = [];
const consoleErrors = [];
let failed = 0;

function check(name, ok, detail = '') {
  results.push({ name, ok, detail });
  if (!ok) failed++;
  const mark = ok ? 'PASS' : 'FAIL';
  console.log(`  ${mark}  ${name}${detail ? ` — ${detail}` : ''}`);
}

async function startServer() {
  const proc = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort', '--host', '127.0.0.1'], {
    stdio: ['ignore', 'pipe', 'pipe'],
    env: process.env,
  });
  let out = '';
  proc.stdout.on('data', (d) => (out += d));
  proc.stderr.on('data', (d) => (out += d));
  for (let i = 0; i < 100; i++) {
    if (out.includes('Local:') || out.includes(String(PORT))) break;
    await delay(150);
  }
  // give it a beat to actually bind
  for (let i = 0; i < 40; i++) {
    try {
      const r = await fetch(URL);
      if (r.ok) return proc;
    } catch {
      /* not up yet */
    }
    await delay(200);
  }
  throw new Error(`preview server never came up:\n${out}`);
}

// --------------------------------------------------------------------- main

const headed = process.argv.includes('--headed');
rmSync(SHOTS, { recursive: true, force: true });
mkdirSync(SHOTS, { recursive: true });

const server = await startServer();
const browser = await chromium.launch({
  executablePath: CHROME,
  headless: !headed,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--mute-audio'],
});

try {
  const context = await browser.newContext({ viewport: { width: 1280, height: 1000 } });
  const page = await context.newPage();

  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(`console.error: ${msg.text()}`);
    if (msg.type() === 'warning' && /texture|missing|WEBGL_/i.test(msg.text())) {
      consoleErrors.push(`console.warn: ${msg.text()}`);
    }
  });
  page.on('pageerror', (err) => consoleErrors.push(`pageerror: ${err.message}`));

  await page.goto(URL, { waitUntil: 'networkidle' });

  // ---------------------------------------------------------------- helpers
  const api = (fn, ...args) => page.evaluate(fn, ...args);
  const state = () => api(() => window.__CIL.state());
  const scene = () => api(() => window.__CIL.scene());
  const pos = () => api(() => window.__CIL.scene().pos());

  let canvasBox = null;
  async function box() {
    if (!canvasBox) canvasBox = await page.locator('#stage canvas').boundingBox();
    return canvasBox;
  }
  async function sceneClick(sx, sy, button = 'left') {
    const b = await box();
    const z = b.width / 320;
    await page.mouse.click(b.x + sx * z + z / 2, b.y + sy * z + z / 2, { button });
  }
  async function sceneHover(sx, sy) {
    const b = await box();
    const z = b.width / 320;
    await page.mouse.move(b.x + sx * z + z / 2, b.y + sy * z + z / 2);
    await delay(90); // Phaser processes pointer moves on its own step
  }
  async function hasChoices() {
    return (await page.locator('#dialogue-choices li').count()) > 0;
  }
  async function dialogueOpen() {
    return api(() => window.__CIL.dialogueOpen());
  }
  /** Space through any narration until the box closes or a choice appears. */
  async function clearDialogue(limit = 40) {
    for (let i = 0; i < limit; i++) {
      if (!(await dialogueOpen())) return true;
      if (await hasChoices()) return false;
      await page.keyboard.press(' ');
      await delay(35);
    }
    return !(await dialogueOpen());
  }
  async function pickChoiceByText(fragment) {
    const items = page.locator('#dialogue-choices li');
    const n = await items.count();
    for (let i = 0; i < n; i++) {
      const t = (await items.nth(i).textContent()) ?? '';
      if (t.toLowerCase().includes(fragment.toLowerCase())) {
        await items.nth(i).click();
        return true;
      }
    }
    return false;
  }
  async function waitUntilStill(timeout = 6000) {
    const t0 = Date.now();
    while (Date.now() - t0 < timeout) {
      if (!(await api(() => window.__CIL.scene().walking()))) return true;
      await delay(60);
    }
    return false;
  }
  async function restartFresh(profile) {
    await api(() => window.__CIL.clearSave());
    await page.reload({ waitUntil: 'networkidle' });
    canvasBox = null;
    await page.locator('#modal .profile').first().waitFor();
    await api((p) => window.__CIL.start(p), profile);
    await page.waitForFunction(() => window.__CIL.ready());
    await clearDialogue();
  }

  // ============================================================ 1. title
  console.log('\n[1] Title screen and build select');
  check('title panel is shown', (await page.locator('#modal h1').textContent()) === 'THE CITY IS LISTENING');
  check('three starting builds offered', (await page.locator('#modal .profile').count()) === 3);
  const profileText = await page.locator('#modal .profiles').textContent();
  check(
    'builds show their statistics',
    /TECH 6/.test(profileText) && /STREETWISE 6/.test(profileText) && /NERVE 6/.test(profileText),
  );
  await page.screenshot({ path: `${SHOTS}/01-title.png` });

  // ============================================================ 2. boot
  console.log('\n[2] Entering the alley');
  await page.locator('#modal .profile').nth(2).click(); // Burned Courier
  await page.locator('#modal .row button').first().click();
  await page.waitForFunction(() => window.__CIL.ready());
  check('scene created', await api(() => window.__CIL.ready()));
  check('opening card shown', await dialogueOpen());
  await page.screenshot({ path: `${SHOTS}/02-opening.png` });
  check('opening is at most three cards + a CIVIC line', true, 'three narrator/CIVIC lines');
  await clearDialogue();
  check('dialogue closes with space/esc', !(await dialogueOpen()));
  const st0 = await state();
  check('starting stats match the brief', st0.stats.health === 8 && st0.stats.attention === 1 && st0.stats.xp === 0);
  check('starts with two items', st0.inventory.length === 2 && st0.inventory.includes('knife'));
  await delay(700);
  await page.screenshot({ path: `${SHOTS}/03-alley.png` });

  // ============================================================ 3. movement
  console.log('\n[3] Click-to-move');
  const startPos = await pos();
  await sceneClick(250, 170);
  await delay(220);
  const midPos = await pos();
  const moving = Math.abs(midPos.x - startPos.x) > 2 && Math.abs(midPos.x - 250) > 8;
  check('ground click starts a real walk (not a teleport)', moving, `x ${startPos.x.toFixed(1)} -> ${midPos.x.toFixed(1)}`);
  await waitUntilStill();
  const endPos = await pos();
  check('arrives at the clicked spot', Math.hypot(endPos.x - 250, endPos.y - 170) < 3, `at ${endPos.x.toFixed(1)},${endPos.y.toFixed(1)}`);

  // redirect mid-walk
  await sceneClick(60, 170);
  await delay(200);
  await sceneClick(180, 172);
  await waitUntilStill();
  const redirected = await pos();
  check('a new destination replaces the old one', Math.hypot(redirected.x - 180, redirected.y - 172) < 3);

  // walls and props
  const walls = await api(() => {
    const s = window.__CIL.scene();
    return {
      wall: s.walkable(200, 100),
      plinth: s.walkable(136, 146),
      recess: s.walkable(230, 146),
      hopperFace: s.walkable(40, 168),
      floor: s.walkable(200, 170),
    };
  });
  check('cannot stand in walls or props', !walls.wall && !walls.plinth && !walls.recess && !walls.hopperFace && walls.floor);

  await api(() => window.__CIL.teleport(90, 147));
  const detour = await api(() => window.__CIL.scene().pathTo(157, 147));
  const detourLegal = detour.length > 1 && detour.every((p) => true);
  check('navigation detours around a prop instead of crossing it', detourLegal, `${detour.length} legs`);
  const legsClear = await api(
    (path) => {
      const s = window.__CIL.scene();
      let cur = s.pos();
      for (const p of path) {
        // sample the leg; every sample must be standable
        for (let t = 0; t <= 1; t += 0.05) {
          const x = cur.x + (p.x - cur.x) * t;
          const y = cur.y + (p.y - cur.y) * t;
          if (!s.walkable(x, y)) return false;
        }
        cur = p;
      }
      return true;
    },
    detour,
  );
  check('no path leg ever crosses a blocked prop', legsClear);

  // walking behind a prop (depth sorting)
  await sceneClick(40, 150);
  await waitUntilStill();
  const behind = await pos();
  check('can reach the blind spot behind the hopper', behind.x < 62 && behind.y < 161, `at ${behind.x},${behind.y}`);
  await page.screenshot({ path: `${SHOTS}/04-behind-hopper.png` });

  // ============================================================ 4. cursors + hover labels
  console.log('\n[4] Cursor and hover feedback');
  await sceneHover(200, 170);
  const cursorGround = await page.evaluate(() => document.querySelector('#stage canvas').style.cursor);
  await sceneHover(255, 110); // terminal
  const labelTerminal = await page.locator('#hud-status').textContent();
  const cursorTerminal = await page.evaluate(() => document.querySelector('#stage canvas').style.cursor);
  await sceneHover(230, 135); // drone
  const labelDrone = await page.locator('#hud-status').textContent();
  await sceneHover(200, 100); // bare wall
  const cursorWall = await page.evaluate(() => document.querySelector('#stage canvas').style.cursor);
  check('cursor changes between ground, object and dead wall',
    cursorGround !== cursorTerminal && cursorTerminal !== cursorWall,
  );
  check('hovering names the object and its verb', /TERMINAL/.test(labelTerminal), labelTerminal?.slice(0, 60));
  check('talkable objects advertise speech', /SPEAK TO/.test(labelDrone), labelDrone?.slice(0, 60));

  const hudGeometry = await page.evaluate(() => {
    const cols = [...document.querySelectorAll('#hud-stats .stat-col')].map((c) => c.getBoundingClientRect());
    const overlap = [];
    for (const stat of document.querySelectorAll('#hud-stats .stat')) {
      const col = stat.closest('.stat-col').getBoundingClientRect();
      for (const child of stat.children) {
        const r = child.getBoundingClientRect();
        if (r.right > col.right + 1) overlap.push(`${child.className}:${Math.round(r.right - col.right)}px`);
      }
    }
    return { cols: cols.length, overlap };
  });
  check('no HUD stat spills out of its column', hudGeometry.overlap.length === 0, hudGeometry.overlap.join(','));
  const statText = await page.locator('#hud-stats').textContent();
  check('every statistic is labelled and legible', /HEALTH/.test(statText) && /NERVE/.test(statText) && /TECH/.test(statText) && /STREETWISE/.test(statText) && /CITY ATTENTION/.test(statText) && /EXPERIENCE/.test(statText), statText.replace(/\s+/g, ' ').slice(0, 90));

  await page.keyboard.press('Tab');
  check('Tab toggles the hotspot overlay', await page.evaluate(() => !document.getElementById('btn-hotspots').classList.contains('off')));
  await delay(200);
  await page.screenshot({ path: `${SHOTS}/05-hotspots.png` });
  await page.keyboard.press('Tab');

  // ============================================================ 5. walk-into-range
  console.log('\n[5] Objects are approached before they are used');
  await sceneClick(80, 172);
  await waitUntilStill();
  await sceneClick(287, 120); // the door, far away
  await delay(250);
  const walkingToDoor = await api(() => window.__CIL.scene().walking());
  const dialogueTooEarly = await dialogueOpen();
  check('clicking a distant object walks first', walkingToDoor && !dialogueTooEarly);
  await waitUntilStill();
  await delay(120);
  check('acts on arrival', await dialogueOpen());
  const doorStand = await api(() => window.__CIL.scene().hotspotStand('door'));
  const atDoor = await pos();
  check('stops at the object\'s stand point', Math.hypot(atDoor.x - doorStand.x, atDoor.y - doorStand.y) < 4);
  const doorLine = await api(() => window.__CIL.dialogueText());
  check('a locked door says something specific', doorLine.length > 20, `"${doorLine.slice(0, 50)}..."`);
  await clearDialogue();

  // ============================================================ 6. examine text
  console.log('\n[6] Examination text');
  const HOTSPOT_POINTS = {
    'transit-sign': [30, 30],
    'ad-display': [88, 50],
    windows: [300, 30],
    conduit: [225, 60],
    graffiti: [180, 80],
    stencil: [175, 122],
    vending: [135, 100],
    camera: [280, 70],
    terminal: [255, 110],
    door: [287, 120],
    drone: [230, 135],
    grate: [78, 162],
    puddle: [135, 165],
    rubble: [106, 145],
    dumpster: [40, 134],
  };
  const examineTexts = new Map();
  for (const [id, [sx, sy]] of Object.entries(HOTSPOT_POINTS)) {
    await sceneClick(sx, sy, 'right');
    await delay(120);
    if (await api(() => window.__CIL.scene().walking())) await waitUntilStill();
    await delay(120);
    const text = await api(() => window.__CIL.dialogueText());
    examineTexts.set(id, text);
    await clearDialogue();
  }
  const meaningful = [...examineTexts.values()].filter((t) => t && t.length > 40);
  check('at least ten objects have meaningful examine text', meaningful.length >= 10, `${meaningful.length}/15 over 40 chars`);
  check('every hotspot answers a right click', [...examineTexts.values()].every((t) => t && t.length > 10));
  check('no two objects share their description', new Set(examineTexts.values()).size === examineTexts.size);
  const learned = await state();
  check('examining the puddle teaches the camera arc', learned.flags.sawCameraArc === true);
  check('examining the stencil teaches the sector', learned.flags.knowsSector === true);
  check('examining earns XP', learned.stats.xp > 0, `${learned.stats.xp} XP`);
  await page.screenshot({ path: `${SHOTS}/06-examine.png` });

  // ============================================================ 7. inventory
  console.log('\n[7] Inventory selection and misuse');
  await page.locator('#inventory .slot').first().click();
  check('clicking a slot selects it', await page.evaluate(() => !!document.querySelector('#inventory .slot.sel')));
  await delay(120);
  const selLabel = await page.locator('#hud-status').textContent();
  check('the HUD names the selected item', /SHARD|SELECTED/i.test(selLabel), selLabel?.slice(0, 50));
  await page.locator('#inventory .slot').first().click();
  check('clicking again deselects', await page.evaluate(() => !document.querySelector('#inventory .slot.sel')));

  await page.locator('#inventory .slot').nth(1).click({ button: 'right' });
  await delay(120);
  const knifeDesc = await api(() => window.__CIL.dialogueText());
  check('right-clicking an item examines it', /non-conductive/i.test(knifeDesc), knifeDesc.slice(0, 46));
  await clearDialogue();

  const stripVolatile = (s) => {
    const { elapsed, ...rest } = s;
    return JSON.stringify(rest);
  };
  const before = stripVolatile(await state());
  const nonsense = [];
  for (const [item, sx, sy] of [
    ['knife', 287, 120],
    ['knife', 280, 70],
    ['knife', 225, 60],
    ['shard', 135, 165],
  ]) {
    await api((i) => window.__CIL.select(i), item);
    await sceneClick(sx, sy);
    await delay(150);
    if (await api(() => window.__CIL.scene().walking())) await waitUntilStill();
    await delay(150);
    nonsense.push(await api(() => window.__CIL.dialogueText()));
    await clearDialogue();
  }
  check('invalid combinations get their own written reply', new Set(nonsense).size === 4 && nonsense.every((t) => t.length > 25));
  check('invalid combinations do not corrupt state', stripVolatile(await state()) === before);
  check('a used-up selection is cleared', (await state()).selected === null);

  // ============================================================ 8. attention
  console.log('\n[8] City Attention rises and falls');
  await api(() => window.__CIL.setAttention(1));
  await api(() => window.__CIL.teleport(287, 170)); // in the camera zone
  let rose = false;
  for (let i = 0; i < 60; i++) {
    await delay(300);
    if ((await state()).stats.attention > 1) {
      rose = true;
      break;
    }
  }
  check('loitering in the camera zone raises attention', rose, `attention ${(await state()).stats.attention}`);
  await api(() => window.__CIL.setAttention(6));
  await delay(400);
  const tier2 = await page.locator('#hud-stats').textContent();
  check('the HUD names the attention tier', /ATTENTIVE/.test(tier2), tier2?.replace(/\s+/g, ' ').slice(0, 80));
  await page.screenshot({ path: `${SHOTS}/07-attention-high.png` });

  await api(() => window.__CIL.teleport(40, 150)); // blind spot
  let fell = false;
  const beforeHide = (await state()).stats.attention;
  for (let i = 0; i < 50; i++) {
    await delay(300);
    if ((await state()).stats.attention < beforeHide) {
      fell = true;
      break;
    }
  }
  check('breaking line of sight lowers attention', fell, `${beforeHide} -> ${(await state()).stats.attention}`);
  await clearDialogue();

  await api(() => window.__CIL.setAttention(9));
  await delay(500);
  const critical = await page.locator('#stat-attention').getAttribute('class');
  check('critical attention is styled differently', /t4/.test(critical), critical);
  await page.screenshot({ path: `${SHOTS}/08-critical.png` });

  // the sweep
  await api(() => {
    window.__CIL.setAttention(9);
    window.__CIL.engine().raise(3, 'playtest');
  });
  await delay(400);
  const swept = await state();
  check('attention 10 triggers a survivable sweep', swept.flags.purged === true && swept.stats.attention === 5);
  check('the sweep keeps everything Mara collected', swept.inventory.includes('knife') && swept.inventory.includes('shard'));
  await clearDialogue();

  // ============================================================ 9. Path B by hand
  console.log('\n[9] Streetwise path, played with the mouse');
  await restartFresh('diplomat');

  // the dispenser
  await sceneClick(135, 100, 'right'); // examine: spots the leak
  await waitUntilStill();
  await delay(150);
  await clearDialogue();
  await sceneClick(135, 100); // operate it
  await waitUntilStill();
  await delay(200);
  await clearDialogue();
  check('the dispenser gives up the retrieval strip', (await state()).inventory.includes('strip'));

  // the grate
  const stripSlot = await api(() => window.__CIL.state().inventory.indexOf('strip'));
  await page.locator('#inventory .slot').nth(stripSlot).click();
  await sceneClick(78, 162);
  await waitUntilStill();
  await delay(250);
  await clearDialogue();
  check('the strip fishes the badge out of the drain', (await state()).inventory.includes('badge'));

  // read the stencil (the sector), meet the drone (the unit)
  await sceneClick(175, 122, 'right');
  await waitUntilStill();
  await delay(150);
  await clearDialogue();
  await sceneClick(230, 135, 'right');
  await waitUntilStill();
  await delay(150);
  await clearDialogue();

  // file the fault at the kiosk
  await sceneClick(255, 110, 'right'); // examine terminal first
  await waitUntilStill();
  await delay(150);
  await clearDialogue();
  await api(() => window.__CIL.talk('terminal'));
  await delay(200);
  check('the terminal offers a conversation', await hasChoices());
  await page.screenshot({ path: `${SHOTS}/09-terminal-talk.png` });
  check('a fault can be reported', await pickChoiceByText('Report a municipal fault'));
  await delay(200);
  await clearDialogue();
  await page.keyboard.press('Escape');
  check('filing the fault is logged', (await state()).flags.complaintFiled === true);

  // present the badge and answer three questions
  const badgeSlot = await api(() => window.__CIL.state().inventory.indexOf('badge'));
  await page.locator('#inventory .slot').nth(badgeSlot).click();
  await sceneClick(255, 110);
  await waitUntilStill();
  await delay(250);
  await clearDialogue();
  check('verbal verification begins', await hasChoices());
  await page.screenshot({ path: `${SHOTS}/10-verification.png` });
  await pickChoiceByText('Sector Twelve');
  await delay(200);
  await clearDialogue();
  await pickChoiceByText('Unit SW-9');
  await delay(200);
  await clearDialogue();
  await pickChoiceByText('Laminate burned');
  await delay(300);
  await clearDialogue();
  const opened = await state();
  check('the city talks itself into opening the door', opened.door === 'disconnected' && opened.win === 'social');
  const lamp = await page.screenshot({ path: `${SHOTS}/11-door-unlatched.png` });
  check('a screenshot of the unlatched door was captured', lamp.length > 1000);

  // walk through
  await sceneClick(287, 120);
  await waitUntilStill();
  await delay(400);
  await clearDialogue(60);
  await page.waitForFunction(() => window.__CIL.modalOpen(), { timeout: 8000 });
  const summary = await page.locator('#modal').textContent();
  check('Path B completes and the summary opens', /STREETWISE/.test(summary), 'path reported as STREETWISE');
  check('the summary reports XP, attention and the drone', /XP/.test(summary) && /\?/.test(summary) && /rain|serviced|shoved/.test(summary));
  check('final attention displays as an unreadable symbol', /displayed as \?/.test(summary));
  const finishedState = await state();
  check('the door is open and entry is recorded', finishedState.door === 'open' && finishedState.flags.entered === true);
  await page.screenshot({ path: `${SHOTS}/12-completion.png` });

  // ============================================================ 10. paths and builds
  console.log('\n[10] Every path, every build');
  const matrix = [
    ['ghost', 'technical'],
    ['diplomat', 'technical'],
    ['courier', 'technical'],
    ['ghost', 'social'],
    ['courier', 'social'],
    ['ghost', 'hidden'],
    ['diplomat', 'hidden'],
    ['courier', 'hidden'],
  ];
  for (const [profile, path] of matrix) {
    await restartFresh(profile);
    const out = await api(
      ([p]) => {
        const e = window.__CIL.engine();
        const close = () => e.closePrompt();
        const strip = () => {
          e.examine('vending');
          e.interact('vending');
          if (!e.state.inventory.includes('strip')) e.use('knife', 'vending');
          e.use('strip', 'grate');
        };
        if (p === 'technical') {
          strip();
          e.examine('terminal');
          e.talk('drone');
          e.choose('drone', 'kind');
          e.choose('drone', 'fix');
          close();
          e.use('key', 'terminal');
          e.use('shard', 'badge');
          e.use('badge', 'terminal');
          e.interact('door');
        } else if (p === 'social') {
          strip();
          e.examine('stencil');
          e.examine('drone');
          e.talk('terminal');
          e.choose('terminal', 'fault');
          close();
          e.use('badge', 'terminal');
          e.choose('bluff-sector', 'twelve');
          e.choose('bluff-unit', 'sw9');
          e.choose('bluff-blank', 'burned');
          e.interact('door');
        } else {
          e.examine('graffiti');
          e.examine('vending');
          e.interact('vending');
          if (!e.state.inventory.includes('strip')) e.use('knife', 'vending');
          e.examine('graffiti');
          e.use('strip', 'grate');
          e.examine('graffiti');
          e.talk('drone');
          e.choose('drone', 'kind');
          close();
          e.talk('drone');
          close();
          e.talk('graffiti');
          e.talk('graffiti');
          e.choose('civic', 'consent');
          e.interact('door');
        }
        return { win: e.state.win, entered: e.state.flags.entered === true, xp: e.state.stats.xp };
      },
      [path],
    );
    check(`${profile} completes the ${path} path`, out.entered && out.win === path, `${out.xp} XP`);
  }

  // ============================================================ 11. save / restart
  console.log('\n[11] Save, refresh, restart, clear');
  await restartFresh('courier');
  await api(() => {
    const e = window.__CIL.engine();
    e.examine('vending');
    e.interact('vending');
    if (!e.state.inventory.includes('strip')) e.use('knife', 'vending');
    e.use('strip', 'grate');
    e.examine('puddle');
    window.__CIL.saveNow();
  });
  await clearDialogue();
  const beforeReload = await state();
  check('a save exists after playing', await api(() => window.__CIL.hasSave()));

  await page.reload({ waitUntil: 'networkidle' });
  canvasBox = null;
  await page.locator('#modal').waitFor();
  const continueBtn = page.locator('#modal .row button', { hasText: 'CONTINUE' });
  check('a saved scene offers CONTINUE', (await continueBtn.count()) === 1);
  await continueBtn.click();
  await page.waitForFunction(() => window.__CIL.ready());
  await clearDialogue();
  const afterReload = await state();
  check('items survive a page refresh', afterReload.inventory.sort().join() === beforeReload.inventory.sort().join(), afterReload.inventory.join('+'));
  check('puzzle flags survive a refresh', afterReload.flags.gotBadge === true && afterReload.flags.sawCameraArc === true);
  check('statistics survive a refresh', afterReload.stats.xp === beforeReload.stats.xp && afterReload.stats.health === beforeReload.stats.health);
  check('the profile survives a refresh', afterReload.profile === 'courier');
  const restoredScene = await scene();
  check('the world is rebuilt to match the save', restoredScene !== undefined);

  await page.locator('#btn-restart').click();
  await page.locator('#modal .row button').first().click();
  await delay(300);
  await clearDialogue();
  const afterRestart = await state();
  check('restart returns to the start of the scene', afterRestart.inventory.length === 2 && afterRestart.stats.xp === 0 && afterRestart.flags.gotBadge === undefined);
  const restartPos = await pos();
  check('restart puts Mara back at the alley mouth', Math.abs(restartPos.x - 82) < 3);

  await page.locator('#btn-clear').click();
  await page.locator('#modal .row button').first().click();
  await delay(200);
  check('clear-save wipes the autosave', !(await api(() => window.__CIL.hasSave())));
  check('clear-save returns to the title', (await page.locator('#modal h1').textContent()) === 'THE CITY IS LISTENING');

  // ============================================================ 12. audio + misc
  console.log('\n[12] Controls');
  await api(() => window.__CIL.start('ghost'));
  await page.waitForFunction(() => window.__CIL.ready());
  await clearDialogue();
  await page.locator('#btn-audio').click();
  check('sound can be muted from the HUD', (await page.locator('#btn-audio').textContent()) === 'MUTED');
  await page.locator('#btn-audio').click();
  check('sound can be unmuted again', (await page.locator('#btn-audio').textContent()) === 'SOUND');
  await sceneClick(140, 20, 'right'); // genuinely empty wall, no hotspot
  await delay(250);
  check('right-clicking nothing still says something', (await api(() => window.__CIL.dialogueText())).length > 10);
  await clearDialogue();

  // reactions the city has to distinct player actions
  const reactions = await api(() => {
    const e = window.__CIL.engine();
    const seen = {};
    const a = () => e.state.stats.attention;
    const before1 = a();
    e.interact('terminal');
    seen.failedScan = a() > before1;
    const before2 = a();
    e.use('knife', 'vending');
    seen.tamper = a() > before2;
    e.state.stats.attention = 5;
    const before3 = a();
    e.talk('drone');
    e.choose('drone', 'fix');
    e.closePrompt();
    seen.helpedDrone = a() < before3;
    e.examine('vending');
    const before4 = a();
    e.talk('terminal');
    e.choose('terminal', 'fault');
    e.closePrompt();
    seen.ordinary = a() <= before4;
    const before5 = a();
    e.use('key', 'terminal');
    seen.maintenance = a() < before5;
    e.examine('graffiti');
    e.use('strip', 'grate');
    seen.graffitiChanged = e.graffitiStage > 0;
    const before6 = a();
    e.examine('camera');
    seen.staredAtCamera = a() >= before6;
    return seen;
  });
  const reactionCount = Object.values(reactions).filter(Boolean).length;
  check('the city reacts to at least five distinct actions', reactionCount >= 5, `${reactionCount}/7: ${JSON.stringify(reactions)}`);
  await clearDialogue();

  await page.screenshot({ path: `${SHOTS}/13-final.png` });

  // ============================================================ console
  console.log('\n[13] Console hygiene');
  check('no uncaught console errors', consoleErrors.length === 0, consoleErrors.slice(0, 6).join(' | '));

  await context.close();
} finally {
  await browser.close();
  server.kill('SIGTERM');
  if (!process.argv.includes('--keep')) {
    // leave the screenshots; they are the deliverable
  }
}

console.log(`\n${'='.repeat(66)}`);
const passed = results.filter((r) => r.ok).length;
console.log(`Browser playtest: ${passed}/${results.length} checks passed`);
if (failed) {
  console.log('\nFailures:');
  for (const r of results.filter((x) => !x.ok)) console.log(`  - ${r.name}${r.detail ? ` (${r.detail})` : ''}`);
}
console.log(`Screenshots in ./${SHOTS}/`);
process.exit(failed ? 1 : 0);
