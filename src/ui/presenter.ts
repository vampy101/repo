import { bannerText, checkDetail } from '../game/checks';
import type { CheckResult, Line, Prompt, Reaction, Speaker, Toast } from '../game/types';

const SPEAKER_CLASS: Record<Speaker, string> = {
  MARA: 'mara',
  CIVIC: 'civic',
  TERMINAL: 'civic',
  'SW-9': 'drone',
  ALARM: 'alarm',
  NARRATOR: '',
};

const SPEAKER_LABEL: Record<Speaker, string> = {
  MARA: 'MARA VEY',
  CIVIC: 'CIVIC',
  TERMINAL: 'ACCESS TERMINAL',
  'SW-9': 'UNIT SW-9',
  ALARM: '⚠ SECTOR ADVISORY',
  NARRATOR: 'CHECKPOINT 7',
};

function el<T extends HTMLElement>(id: string): T {
  const node = document.getElementById(id);
  if (!node) throw new Error(`missing element #${id}`);
  return node as T;
}

/**
 * Owns every piece of transient text: the dialogue box and its choices, XP
 * toasts, stat-check banners and the whispers from the drain.
 */
export class Presenter {
  private readonly box = el('dialogue');
  private readonly speaker = el('dialogue-speaker');
  private readonly text = el('dialogue-text');
  private readonly choicesList = el<HTMLUListElement>('dialogue-choices');
  private readonly hint = el('dialogue-hint');
  private readonly toastHost = el('toasts');
  private readonly banner = el('check-banner');
  private readonly subtitle = el('subtitle');

  private queue: Line[] = [];
  private pendingPrompt: Prompt | null = null;
  private onChoose: ((choiceId: string) => void) | null = null;
  private bannerTimer = 0;
  private whisperTimer = 0;

  constructor() {
    this.box.addEventListener('click', (e) => {
      if ((e.target as HTMLElement).closest('#dialogue-choices')) return;
      this.advance();
    });
    this.box.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  /** Called with whatever a player action produced. */
  play(reaction: Reaction, onChoose?: (choiceId: string) => void): void {
    for (const t of reaction.toasts) this.toast(t);
    if (reaction.check) this.showCheck(reaction.check);
    this.queue.push(...reaction.lines);
    if (reaction.prompt) {
      this.pendingPrompt = reaction.prompt;
      this.onChoose = onChoose ?? null;
    }
    if (!this.queue.length && !this.pendingPrompt) return;
    this.step();
  }

  get open(): boolean {
    return !this.box.classList.contains('hidden');
  }

  get awaitingChoice(): boolean {
    return this.choicesList.childElementCount > 0;
  }

  /** Advance one line; if the queue is empty, show the prompt or close. */
  advance(): void {
    if (this.awaitingChoice) return; // a decision is a decision
    if (this.queue.length) {
      this.step();
      return;
    }
    if (this.pendingPrompt) {
      this.step();
      return;
    }
    this.close();
  }

  private step(): void {
    if (this.queue.length) {
      const line = this.queue.shift()!;
      this.box.classList.remove('hidden');
      this.box.className = `${SPEAKER_CLASS[line.who]}`.trim();
      this.speaker.textContent = SPEAKER_LABEL[line.who];
      this.text.textContent = line.text;
      this.choicesList.replaceChildren();
      const more = this.queue.length > 0 || this.pendingPrompt !== null;
      this.hint.textContent = more
        ? 'click / space to continue · esc to close'
        : 'click / space to close · esc to close';
      return;
    }
    if (this.pendingPrompt) {
      const prompt = this.pendingPrompt;
      this.pendingPrompt = null;
      this.box.classList.remove('hidden');
      // Keep whoever just spoke; the question is still on screen above the list.
      if (!this.text.textContent) {
        this.box.className = 'civic';
        this.speaker.textContent = 'CHOOSE';
      }
      this.choicesList.replaceChildren(
        ...prompt.choices.map((choice, i) => {
          const li = document.createElement('li');
          li.textContent = `${i + 1}. ${choice.text}`;
          if (choice.spent) li.classList.add('spent');
          li.addEventListener('click', (e) => {
            e.stopPropagation();
            this.pick(prompt.id, choice.id);
          });
          return li;
        }),
      );
      this.hint.textContent = 'choose: click a line, or press 1-9 · esc to walk away';
      return;
    }
    this.close();
  }

  private pick(promptId: string, choiceId: string): void {
    void promptId;
    const fn = this.onChoose;
    this.choicesList.replaceChildren();
    this.onChoose = null;
    this.queue = [];
    this.close();
    fn?.(choiceId);
  }

  /** Keyboard: space/enter advances, digits pick a choice. */
  key(k: string): boolean {
    if (!this.open) return false;
    if (this.awaitingChoice) {
      const n = Number.parseInt(k, 10);
      if (!Number.isNaN(n) && n >= 1 && n <= this.choicesList.childElementCount) {
        (this.choicesList.children[n - 1] as HTMLElement).click();
        return true;
      }
      if (k === 'Escape') {
        this.close();
        return true;
      }
      return true; // swallow everything else while a choice is up
    }
    if (k === ' ' || k === 'Enter') {
      this.advance();
      return true;
    }
    if (k === 'Escape') {
      this.close();
      return true;
    }
    return false;
  }

  close(): void {
    this.queue = [];
    this.pendingPrompt = null;
    this.onChoose = null;
    this.choicesList.replaceChildren();
    this.text.textContent = '';
    this.box.classList.add('hidden');
  }

  toast(t: Toast): void {
    const node = document.createElement('div');
    node.className = `toast ${t.tone === 'good' ? '' : t.tone}`.trim();
    node.textContent = t.text;
    this.toastHost.appendChild(node);
    while (this.toastHost.childElementCount > 4) this.toastHost.firstElementChild?.remove();
    window.setTimeout(() => node.classList.add('fade'), 2400);
    window.setTimeout(() => node.remove(), 3000);
  }

  showCheck(check: CheckResult): void {
    const tone =
      check.grade === 'SUCCESS' ? 'ok' : check.grade === 'PARTIAL SUCCESS' ? 'partial' : 'fail';
    this.banner.className = tone;
    this.banner.innerHTML = `<span>${bannerText(check)}</span>`;
    window.clearTimeout(this.bannerTimer);
    this.bannerTimer = window.setTimeout(() => this.banner.classList.add('hidden'), 1900);
    this.toast({
      text: checkDetail(check),
      tone: tone === 'ok' ? 'good' : tone === 'partial' ? 'warn' : 'bad',
    });
  }

  whisper(text: string): void {
    this.subtitle.textContent = `“${text}”`;
    this.subtitle.classList.remove('hidden');
    this.subtitle.style.opacity = '1';
    window.clearTimeout(this.whisperTimer);
    this.whisperTimer = window.setTimeout(() => {
      this.subtitle.style.opacity = '0';
      window.setTimeout(() => this.subtitle.classList.add('hidden'), 500);
    }, 3200);
  }
}
