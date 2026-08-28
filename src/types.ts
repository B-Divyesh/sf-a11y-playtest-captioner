export type LocalizedText = Readonly<Record<string, string>>;

export interface CaptionCue {
  readonly id: string;
  readonly labels: LocalizedText;
  readonly descriptions?: LocalizedText;
}

export interface CaptionState {
  readonly id: string;
  readonly name: string;
  readonly descriptions: LocalizedText;
  readonly focusOrder?: readonly CaptionCue[];
}

export interface CaptionerOptions {
  readonly states?: readonly CaptionState[];
  readonly locale?: string;
  readonly fallbackLocale?: string;
  readonly speak?: boolean;
}

export type FocusDirection = "next" | "previous" | "first" | "last";

export interface ActiveCueSnapshot {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  /** The BCP 47 tag of the localized cue text currently being announced. */
  readonly resolvedLocale: string | null;
  readonly position: number;
  readonly total: number;
}

export interface CaptionerSnapshot {
  readonly stateId: string | null;
  readonly stateName: string;
  readonly locale: string;
  readonly resolvedLocale: string | null;
  readonly description: string;
  readonly activeCue: ActiveCueSnapshot | null;
}

export interface MountOptions {
  readonly liveRegion?: boolean;
}

export type CaptionerListener = (snapshot: CaptionerSnapshot) => void;

export interface Captioner {
  register(state: CaptionState): void;
  registerMany(states: readonly CaptionState[]): void;
  activate(id: string): CaptionerSnapshot;
  setLocale(languageTag: string): CaptionerSnapshot;
  moveFocus(direction: FocusDirection): CaptionerSnapshot;
  speak(): boolean;
  mount(element: Element, options?: MountOptions): () => void;
  connectKeyboard(target?: Window | HTMLElement): () => void;
  subscribe(listener: CaptionerListener): () => void;
  getSnapshot(): CaptionerSnapshot;
  destroy(): void;
}
