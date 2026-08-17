import Phaser from 'phaser';
import { sfx } from './audio/sfx';
import { OPENING } from './data/lines';
import { Engine } from './game/engine';
import { clearSave, hasSave, load, save } from './game/save';
import { newGame } from './game/state';
import { ITEMS } from './data/items';
import { VIEW_H, VIEW_W } from './data/scene';
import type { ItemId, ProfileId, Reaction, WinPath } from './game/types';
import { AlleyScene, type AlleyHost } from './scenes/AlleyScene';
import { Hud } from './ui/hud';
import { currentScale, installLayout } from './ui/layout';
import { Modal } from './ui/modal';
import { Presenter } from './ui/presenter';

class App implements AlleyHost {
  engine = new Engine(newGame('courier'));
  private presenter = new Presenter();
  private modal = new Modal();
  private hud: Hud;
  private game: Phaser.Game | null = null;
  private scene: AlleyScene | null = null;
  private applyLayout: () => void;
  /** last thing the cursor was over, so the status line survives a re-render */
  private hoverLine = '';
  private winShown = false;
  private inWinAnimation = false;

  constructor() {
    this.applyLayout = installLayout();
    this.hud = new Hud({
      onSelect: (item) => this.selectItem(item),
      onExamineItem: (item) => this.act(() => this.engine.examineItem(item)),
      onUseOnSelf: (item) => this.act(() => this.engine.use(item, 'self')),
      onToggleHotspots: () => {
        const on = this.scene?.toggleHints() ?? false;
        this.hud.setHotspotsOn(on);
      },
      onToggleAudio: () => {
        sfx.init();
        sfx.setMuted(!sfx.muted);
        this.hud.setAudioOn(!sfx.muted);
      },
      onRestart: () =>
        this.modal.showConfirm(
          'RESTART THE SCENE?',
          'Back to the mouth of the alley with the same build, nothing learned, nothing carried. The autosave is overwritten.',
          () => this.restart(this.engine.state.profile),
        ),
      onClearSave: () =>
        this.modal.showConfirm(
          'CLEAR THE SAVE?',
          'Erases the autosave from this browser and returns to the build select. CIVIC keeps its copy, obviously.',
          () => {
            clearSave(window.localStorage);
            this.showTitle();
          },
        ),
    });

    window.addEventListener('resize', () => {
      this.applyLayout();
      this.game?.scale.setZoom(currentScale());
    });
    window.addEventListener('keydown', (e) => this.onKey(e));
    document.addEventListener('contextmenu', (e) => e.preventDefault());
    window.addEventListener('beforeunload', () => this.persist());
  }

  // ------------------------------------------------------------ lifecycle

  showTitle(): void {
    this.presenter.close();
    this.modal.showTitle({
      hasSave: hasSave(window.localStorage),
      initial: this.engine.state.profile,
      onStart: (p) => this.startNew(p),
      onContinue: () => this.continueSaved(),
    });
    this.hud.render(this.engine);
    this.hud.setAudioOn(!sfx.muted);
  }

  private startNew(profile: ProfileId): void {
    sfx.init();
    this.engine = new Engine(newGame(profile));
    this.modal.hide();
    this.launch(true);
    this.present({ lines: [...OPENING], toasts: [], effects: [] });
  }

  private continueSaved(): void {
    sfx.init();
    const loaded = load(window.localStorage);
    this.engine = new Engine(loaded ?? newGame(this.engine.state.profile));
    this.modal.hide();
    this.launch(true);
    if (this.engine.finished) {
      this.showCompletion(this.engine.state.win ?? 'technical');
    } else {
      this.present({
        lines: [
          {
            who: 'NARRATOR',
            text: 'Still Checkpoint 7. Still raining. The alley has been holding your place.',
          },
        ],
        toasts: [{ text: 'SCENE RESTORED', tone: 'calm' }],
        effects: [],
      });
    }
  }

  private restart(profile: ProfileId): void {
    this.engine = new Engine(newGame(profile));
    this.winShown = false;
    this.inWinAnimation = false;
    this.modal.hide();
    this.scene?.resetToStart();
    this.persist();
    this.hud.render(this.engine);
    this.present({ lines: [...OPENING], toasts: [], effects: [] });
  }

  private launch(reset: boolean): void {
    this.winShown = false;
    this.inWinAnimation = false;
    if (!this.game) {
      this.game = new Phaser.Game({
        type: Phaser.AUTO,
        parent: 'stage',
        width: VIEW_W,
        height: VIEW_H,
        pixelArt: true,
        roundPixels: true,
        backgroundColor: '#05070c',
        banner: false,
        audio: { noAudio: true },
        scale: { mode: Phaser.Scale.NONE, zoom: currentScale() },
        scene: [AlleyScene],
      });
      this.game.registry.set('host', this);
    } else if (reset) {
      this.scene?.resetToStart();
    }
    this.hud.render(this.engine);
    this.refreshStatus();
    sfx.setTier(this.engine.tier);
  }

  // ------------------------------------------------------ AlleyHost surface

  act(fn: () => Reaction): void {
    if (this.blocked()) return;
    const before = this.engine.tier;
    const reaction = fn();
    this.present(reaction);
    if (this.engine.tier !== before) sfx.setTier(this.engine.tier);
    this.persist();
  }

  /** The world acting on its own: attention drift, expiring windows, whispers. */
  ambient(reaction: Reaction): void {
    const before = this.engine.tier;
    this.present(reaction);
    if (this.engine.tier !== before) sfx.setTier(this.engine.tier);
    this.persist();
  }

  private present(reaction: Reaction): void {
    this.scene?.applyEffects(reaction.effects);
    for (const e of reaction.effects) {
      if (e.kind === 'sfx') sfx.play(e.name);
      if (e.kind === 'win') this.inWinAnimation = true;
    }
    const promptId = reaction.prompt?.id;
    this.presenter.play(
      reaction,
      promptId
        ? (choiceId) => {
            const r = this.engine.choose(promptId, choiceId);
            this.present(r);
            this.persist();
          }
        : undefined,
    );
    this.hud.render(this.engine);
    this.refreshStatus();
  }

  whisper(text: string): void {
    this.presenter.whisper(text);
  }

  dialogueOpen(): boolean {
    return this.presenter.open;
  }

  advanceDialogue(): void {
    this.presenter.advance();
  }

  blocked(): boolean {
    return this.modal.open || this.inWinAnimation;
  }

  setStatusLine(text: string): void {
    this.hoverLine = text;
    this.refreshStatus();
  }

  /**
   * Priority: what the cursor is over, then the selected item, then the
   * current objective. Nothing else may write to this line.
   */
  private refreshStatus(): void {
    if (this.hoverLine) {
      this.hud.setStatusLine(this.hoverLine);
      return;
    }
    const sel = this.engine.state.selected;
    if (sel) {
      this.hud.setStatusLine(`SELECTED · ${ITEMS[sel].hint}`);
      return;
    }
    this.hud.setStatusLine(this.engine.objective());
  }

  onSelectItem(item: ItemId | null): void {
    this.selectItem(item);
  }

  /** Phaser hands the scene over as soon as its create() has run. */
  sceneReady(scene: AlleyScene): void {
    this.scene = scene;
    scene.syncWorldToState();
    this.hud.render(this.engine);
    this.refreshStatus();
  }

  onWin(path: WinPath): void {
    this.inWinAnimation = false;
    this.showCompletion(path);
  }

  private showCompletion(path: WinPath): void {
    if (this.winShown) return;
    this.winShown = true;
    this.persist();
    this.hud.render(this.engine);
    this.modal.showCompletion({ ...this.engine.summary(), path }, {
      onReplay: () => this.restart(this.engine.state.profile),
      onAlternate: () => {
        clearSave(window.localStorage);
        this.engine = new Engine(newGame(this.engine.state.profile));
        this.scene?.resetToStart();
        this.showTitle();
      },
    });
  }

  // ---------------------------------------------------------------- helpers

  private selectItem(item: ItemId | null): void {
    this.engine.state.selected = item;
    this.hud.render(this.engine);
    this.refreshStatus();
  }

  private persist(): void {
    save(this.engine.state, window.localStorage);
  }

  private onKey(e: KeyboardEvent): void {
    if (this.presenter.key(e.key)) {
      e.preventDefault();
      return;
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      const on = this.scene?.toggleHints() ?? false;
      this.hud.setHotspotsOn(on);
      return;
    }
    if (e.key === 'Escape') {
      if (this.engine.state.selected) this.selectItem(null);
      return;
    }
    if (e.key === 'm' || e.key === 'M') {
      sfx.init();
      sfx.setMuted(!sfx.muted);
      this.hud.setAudioOn(!sfx.muted);
    }
  }

  // --------------------------------------------------------- test hook-up

  testApi() {
    return {
      engine: () => this.engine,
      state: () => this.engine.state,
      summary: () => this.engine.summary(),
      objective: () => this.engine.objective(),
      scene: () => this.scene?.debugApi(),
      ready: () => this.scene?.isReady() === true,
      examine: (id: string) => this.act(() => this.engine.examine(id as never)),
      interact: (id: string) => this.act(() => this.engine.interact(id as never)),
      talk: (id: string) => this.act(() => this.engine.talk(id as never)),
      useItem: (item: string, target: string) =>
        this.act(() => this.engine.use(item as ItemId, target as never)),
      choose: (promptId: string, choiceId: string) => {
        const r = this.engine.choose(promptId, choiceId);
        this.present(r);
        this.persist();
      },
      /** Reads the choices currently on screen. */
      choices: () =>
        [...document.querySelectorAll('#dialogue-choices li')].map((li) => li.textContent ?? ''),
      clickChoice: (n: number) => {
        const li = document.querySelectorAll('#dialogue-choices li')[n];
        (li as HTMLElement | undefined)?.click();
      },
      dialogueText: () => document.getElementById('dialogue-text')?.textContent ?? '',
      dialogueOpen: () => this.presenter.open,
      closeDialogue: () => this.presenter.close(),
      modalOpen: () => this.modal.open,
      modalText: () => document.getElementById('modal')?.textContent ?? '',
      select: (item: string | null) => this.selectItem(item as ItemId | null),
      start: (profile: string) => this.startNew(profile as ProfileId),
      restart: () => this.restart(this.engine.state.profile),
      clearSave: () => clearSave(window.localStorage),
      hasSave: () => hasSave(window.localStorage),
      saveNow: () => this.persist(),
      setAttention: (n: number) => {
        this.engine.state.stats.attention = n;
        this.hud.render(this.engine);
      },
      teleport: (x: number, y: number) => this.scene?.debugApi().teleport(x, y),
    };
  }
}

const app = new App();
(window as unknown as { __CIL: ReturnType<App['testApi']> }).__CIL = app.testApi();
app.showTitle();
