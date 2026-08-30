import type {
  ActiveCueSnapshot,
  CaptionCue,
  Captioner,
  CaptionerListener,
  CaptionerOptions,
  CaptionerSnapshot,
  CaptionState,
  FocusDirection,
  LocalizedText,
  MountOptions
} from "./types.js";

export type {
  ActiveCueSnapshot,
  CaptionCue,
  Captioner,
  CaptionerListener,
  CaptionerOptions,
  CaptionerSnapshot,
  CaptionState,
  FocusDirection,
  LocalizedText,
  MountOptions
} from "./types.js";

export class CaptionerValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CaptionerValidationError";
  }
}

const ID_PATTERN = /^[a-z0-9]+(?:[._-][a-z0-9]+)*$/i;

function canonicalLocale(languageTag: string, field = "locale"): string {
  const value = languageTag.trim();
  try {
    const [canonical] = Intl.getCanonicalLocales(value);
    if (!canonical) throw new Error();
    return canonical;
  } catch {
    throw new CaptionerValidationError(`${field} must be a valid BCP 47 language tag; received “${languageTag}”.`);
  }
}

function assertId(value: string, field: string): void {
  if (!ID_PATTERN.test(value)) {
    throw new CaptionerValidationError(`${field} must use letters, numbers, dots, underscores, or hyphens; received “${value}”.`);
  }
}

function normalizeLocalizedText(value: LocalizedText, field: string): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new CaptionerValidationError(`${field} must be an object keyed by BCP 47 language tags.`);
  }
  const normalized: Record<string, string> = {};
  for (const [tag, text] of Object.entries(value)) {
    const locale = canonicalLocale(tag, `${field} key`);
    if (typeof text !== "string" || !text.trim()) {
      throw new CaptionerValidationError(`${field}.${tag} must contain non-blank text.`);
    }
    if (normalized[locale]) {
      throw new CaptionerValidationError(`${field} contains duplicate language tag “${locale}”.`);
    }
    normalized[locale] = text.trim();
  }
  if (!Object.keys(normalized).length) {
    throw new CaptionerValidationError(`${field} needs at least one localized string.`);
  }
  return normalized;
}

function normalizeCue(cue: CaptionCue, stateId: string): CaptionCue {
  assertId(cue.id, `Cue ID in state “${stateId}”`);
  return Object.freeze({
    id: cue.id,
    labels: Object.freeze(normalizeLocalizedText(cue.labels, `Cue “${cue.id}” labels`)),
    ...(cue.descriptions
      ? { descriptions: Object.freeze(normalizeLocalizedText(cue.descriptions, `Cue “${cue.id}” descriptions`)) }
      : {})
  });
}

function normalizeState(state: CaptionState): CaptionState {
  if (!state || typeof state !== "object") {
    throw new CaptionerValidationError("State must be an object.");
  }
  assertId(state.id, "State ID");
  if (typeof state.name !== "string" || !state.name.trim()) {
    throw new CaptionerValidationError(`State “${state.id}” needs a name.`);
  }
  const cueIds = new Set<string>();
  const focusOrder = (state.focusOrder ?? []).map((cue) => {
    const normalized = normalizeCue(cue, state.id);
    if (cueIds.has(normalized.id)) {
      throw new CaptionerValidationError(`State “${state.id}” contains duplicate cue ID “${normalized.id}”.`);
    }
    cueIds.add(normalized.id);
    return normalized;
  });
  return Object.freeze({
    id: state.id,
    name: state.name.trim(),
    descriptions: Object.freeze(normalizeLocalizedText(state.descriptions, `State “${state.id}” descriptions`)),
    focusOrder: Object.freeze(focusOrder)
  });
}

function resolveText(texts: LocalizedText | undefined, locale: string, fallbackLocale: string): [string, string | null] {
  if (!texts) return ["", null];
  const keys = Object.keys(texts);
  const exact = keys.find((key) => key.toLowerCase() === locale.toLowerCase());
  const base = locale.split("-")[0]?.toLowerCase();
  const related = keys.find((key) => key.split("-")[0]?.toLowerCase() === base);
  const fallback = keys.find((key) => key.toLowerCase() === fallbackLocale.toLowerCase());
  const key = exact ?? related ?? fallback ?? keys[0];
  return key ? [texts[key] ?? "", key] : ["", null];
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  return target.matches("input, textarea, select, [contenteditable='true']");
}

export function createCaptioner(options: CaptionerOptions = {}): Captioner {
  const states = new Map<string, CaptionState>();
  const listeners = new Set<CaptionerListener>();
  const cleanup = new Set<() => void>();
  let locale = canonicalLocale(options.locale ?? "en");
  const fallbackLocale = canonicalLocale(options.fallbackLocale ?? "en", "fallbackLocale");
  let activeStateId: string | null = null;
  let cueIndex = -1;
  let liveRegion: HTMLElement | null = null;
  let destroyed = false;

  function assertUsable(): void {
    if (destroyed) throw new Error("This captioner has been destroyed.");
  }

  function snapshot(): CaptionerSnapshot {
    const state = activeStateId ? states.get(activeStateId) : undefined;
    if (!state) {
      return Object.freeze({ stateId: null, stateName: "", locale, resolvedLocale: null, description: "", activeCue: null });
    }
    const [description, resolvedLocale] = resolveText(state.descriptions, locale, fallbackLocale);
    const cue = cueIndex >= 0 ? state.focusOrder?.[cueIndex] : undefined;
    let activeCue: ActiveCueSnapshot | null = null;
    if (cue) {
      const [label, labelLocale] = resolveText(cue.labels, locale, fallbackLocale);
      const [cueDescription, descriptionLocale] = resolveText(cue.descriptions, locale, fallbackLocale);
      activeCue = Object.freeze({
        id: cue.id,
        label,
        description: cueDescription,
        // A cue may fall back independently of its parent state's description.
        // Prefer its required label tag so fallback text reaches a matching
        // browser voice instead of inheriting the state description's tag.
        resolvedLocale: labelLocale ?? descriptionLocale,
        position: cueIndex + 1,
        total: state.focusOrder?.length ?? 0
      });
    }
    return Object.freeze({ stateId: state.id, stateName: state.name, locale, resolvedLocale, description, activeCue });
  }

  function announcement(value: CaptionerSnapshot): string {
    if (!value.stateId) return "";
    const cue = value.activeCue;
    return cue
      ? `${cue.label}. ${cue.description} ${cue.position} of ${cue.total}.`.replace(/\s+/g, " ").trim()
      : `${value.stateName}. ${value.description}`.trim();
  }

  function announcementLocale(value: CaptionerSnapshot): string {
    return value.activeCue?.resolvedLocale ?? value.resolvedLocale ?? locale;
  }

  function emit(): CaptionerSnapshot {
    const value = snapshot();
    if (liveRegion) {
      liveRegion.lang = announcementLocale(value);
      liveRegion.textContent = announcement(value);
    }
    listeners.forEach((listener) => listener(value));
    if (options.speak) speak();
    return value;
  }

  function register(state: CaptionState): void {
    assertUsable();
    const normalized = normalizeState(state);
    if (states.has(normalized.id)) {
      throw new CaptionerValidationError(`A state with ID “${normalized.id}” is already registered.`);
    }
    states.set(normalized.id, normalized);
  }

  function registerMany(nextStates: readonly CaptionState[]): void {
    assertUsable();
    const normalized = nextStates.map(normalizeState);
    const incoming = new Set<string>();
    for (const state of normalized) {
      if (states.has(state.id) || incoming.has(state.id)) {
        throw new CaptionerValidationError(`A state with ID “${state.id}” is already registered.`);
      }
      incoming.add(state.id);
    }
    normalized.forEach((state) => states.set(state.id, state));
  }

  function activate(id: string): CaptionerSnapshot {
    assertUsable();
    if (!states.has(id)) throw new CaptionerValidationError(`Unknown state “${id}”. Register it before activation.`);
    activeStateId = id;
    cueIndex = -1;
    return emit();
  }

  function setLocale(languageTag: string): CaptionerSnapshot {
    assertUsable();
    locale = canonicalLocale(languageTag);
    return emit();
  }

  function moveFocus(direction: FocusDirection): CaptionerSnapshot {
    assertUsable();
    const cues = activeStateId ? states.get(activeStateId)?.focusOrder ?? [] : [];
    if (!cues.length) return emit();
    if (direction === "first") cueIndex = 0;
    else if (direction === "last") cueIndex = cues.length - 1;
    else if (direction === "next") cueIndex = (cueIndex + 1 + cues.length) % cues.length;
    else if (direction === "previous") cueIndex = (cueIndex - 1 + cues.length) % cues.length;
    else throw new CaptionerValidationError(`Unknown focus direction “${String(direction)}”.`);
    return emit();
  }

  function speak(): boolean {
    assertUsable();
    if (typeof window === "undefined" || !("speechSynthesis" in window) || typeof SpeechSynthesisUtterance === "undefined") return false;
    const value = snapshot();
    const text = announcement(value);
    if (!text) return false;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = announcementLocale(value);
    const base = utterance.lang.split("-")[0]?.toLowerCase();
    utterance.voice = window.speechSynthesis.getVoices().find((voice) => voice.lang.toLowerCase() === utterance.lang.toLowerCase())
      ?? window.speechSynthesis.getVoices().find((voice) => voice.lang.split("-")[0]?.toLowerCase() === base)
      ?? null;
    window.speechSynthesis.speak(utterance);
    return true;
  }

  function mount(element: Element, mountOptions: MountOptions = {}): () => void {
    assertUsable();
    if (!(element instanceof Element)) throw new TypeError("mount() requires a DOM Element.");
    liveRegion?.remove();
    liveRegion = null;
    let region: HTMLElement | null = null;
    if (mountOptions.liveRegion !== false) {
      region = element.ownerDocument.createElement("div");
      region.dataset.a11yPlaytestCaptioner = "live-region";
      region.className = "a11y-playtest-captioner-live-region";
      region.setAttribute("role", "status");
      region.setAttribute("aria-live", "polite");
      region.setAttribute("aria-atomic", "true");
      Object.assign(region.style, {
        border: "0", clip: "rect(0 0 0 0)", clipPath: "inset(50%)", height: "1px",
        margin: "-1px", overflow: "hidden", padding: "0", position: "absolute", whiteSpace: "nowrap", width: "1px"
      });
      element.insertAdjacentElement("afterend", region);
      liveRegion = region;
      emit();
    }
    const unmount = () => {
      // A stale cleanup owns only its own region, never a later remount.
      region?.remove();
      if (liveRegion === region) liveRegion = null;
      cleanup.delete(unmount);
    };
    cleanup.add(unmount);
    return unmount;
  }

  function connectKeyboard(target: Window | HTMLElement = window): () => void {
    assertUsable();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || isEditableTarget(event.target)) return;
      const keyMap: Partial<Record<string, FocusDirection>> = {
        ArrowRight: "next", ArrowLeft: "previous", Home: "first", End: "last"
      };
      const direction = keyMap[event.key];
      if (direction) {
        event.preventDefault();
        moveFocus(direction);
      } else if (event.key.toLowerCase() === "s" && !event.altKey && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        speak();
      }
    };
    target.addEventListener("keydown", onKeyDown as EventListener);
    const disconnect = () => {
      target.removeEventListener("keydown", onKeyDown as EventListener);
      cleanup.delete(disconnect);
    };
    cleanup.add(disconnect);
    return disconnect;
  }

  function subscribe(listener: CaptionerListener): () => void {
    assertUsable();
    listeners.add(listener);
    listener(snapshot());
    return () => listeners.delete(listener);
  }

  function destroy(): void {
    if (destroyed) return;
    [...cleanup].forEach((dispose) => dispose());
    listeners.clear();
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    destroyed = true;
  }

  if (options.states) registerMany(options.states);

  return { register, registerMany, activate, setLocale, moveFocus, speak, mount, connectKeyboard, subscribe, getSnapshot: snapshot, destroy };
}
