import "@fontsource/atkinson-hyperlegible/latin-400.css";
import "@fontsource/atkinson-hyperlegible/latin-700.css";
import "./styles.css";
import { createCaptioner, CaptionerValidationError } from "../src/index";
import { emptyProject, sampleProject, type EditableCue, type EditableState, type Project } from "./sample";

const REAL_STORAGE_KEY = "a11y-playtest-captioner:project:v1";
const DEMO_STORAGE_KEY = "demo:a11y-playtest-captioner:project:v1";
const isDemo = location.pathname.replace(/\/$/, "") === "/demo" || new URLSearchParams(location.search).get("demo") === "1";
const STORAGE_KEY = isDemo ? DEMO_STORAGE_KEY : REAL_STORAGE_KEY;
const app = required<HTMLElement>("captioner-app");
const stateList = required<HTMLElement>("state-list");
const authorContent = required<HTMLElement>("author-content");
const reviewContent = required<HTMLElement>("review-content");
const saveState = required<HTMLElement>("save-state");
const toast = required<HTMLElement>("toast");
let startupMessage = "";
let project = loadProject();
let selectedId = project.states[0]?.id ?? null;
let selectedLocale = project.defaultLocale;
let cueIndex = -1;
let undoAction: (() => void) | null = null;
let toastTimer = 0;

if (isDemo) {
  document.title = "Demo — A11y Playtest Captioner";
  const demoUrl = new URL("/demo", location.origin).href;
  document.querySelector<HTMLLinkElement>("link[rel='canonical']")?.setAttribute("href", demoUrl);
  document.querySelector<HTMLMetaElement>("meta[property='og:url']")?.setAttribute("content", demoUrl);
  document.querySelector<HTMLMetaElement>("meta[name='description']")?.setAttribute("content", "Try the isolated sample workspace for browser-game caption authoring.");
  document.getElementById("demo-banner")?.removeAttribute("hidden");
}

function required<T extends HTMLElement>(id: string): T {
  const value = document.getElementById(id);
  if (!value) throw new Error(`Missing #${id}`);
  return value as T;
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function loadProject(): Project {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return isDemo ? sampleProject() : emptyProject();
    const parsed = JSON.parse(stored) as Project;
    validateProjectShape(parsed, false);
    return parsed;
  } catch {
    startupMessage = "The saved draft could not be read. A new local project was opened instead.";
    return emptyProject();
  }
}

function validateProjectShape(value: unknown, strict = true): asserts value is Project {
  if (!value || typeof value !== "object") throw new Error("The file does not contain a project object.");
  const candidate = value as Partial<Project>;
  if (candidate.version !== 1 || typeof candidate.name !== "string" || typeof candidate.defaultLocale !== "string" || !Array.isArray(candidate.states)) {
    throw new Error("Expected a version 1 caption project with name, defaultLocale, and states.");
  }
  Intl.getCanonicalLocales(candidate.defaultLocale);
  for (const state of candidate.states) {
    if (!state || typeof state !== "object" || typeof state.id !== "string" || typeof state.name !== "string" || !state.descriptions || typeof state.descriptions !== "object" || !Array.isArray(state.focusOrder)) {
      throw new Error("A saved state is incomplete.");
    }
  }
  if (strict && candidate.states.length) createCaptioner({ states: candidate.states }).destroy();
}

function currentState(): EditableState | undefined {
  return project.states.find((state) => state.id === selectedId);
}

function allLocales(state: EditableState): string[] {
  const locales = new Set(Object.keys(state.descriptions));
  state.focusOrder.forEach((cue) => {
    Object.keys(cue.labels).forEach((locale) => locales.add(locale));
    Object.keys(cue.descriptions).forEach((locale) => locales.add(locale));
  });
  return [...locales];
}

function esc(value: unknown): string {
  return String(value ?? "").replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
  })[character] ?? character);
}

function slug(value: string): string {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48) || "state";
}

function uniqueId(base: string, used: string[]): string {
  let candidate = base;
  let count = 2;
  while (used.includes(candidate)) candidate = `${base}-${count++}`;
  return candidate;
}

function save(message = "Saved locally"): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
    saveState.textContent = isDemo && message === "Saved locally" ? "Saved in demo only" : message;
    saveState.classList.remove("error-text");
  } catch {
    saveState.textContent = "Could not save in this browser";
    saveState.classList.add("error-text");
  }
}

type ToastAction = {
  label: string;
  run: () => void;
  dismissFocus?: () => HTMLElement | null;
};

function showToast(message: string, action?: ToastAction): HTMLButtonElement | null {
  window.clearTimeout(toastTimer);
  undoAction = action?.run ?? null;
  toast.innerHTML = `${esc(message)}${action ? ` <button type="button" id="toast-action">${esc(action.label)}</button>` : ""}`;
  toast.hidden = false;
  const actionButton = action ? required<HTMLButtonElement>("toast-action") : null;
  if (actionButton && action) {
    actionButton.addEventListener("click", () => {
      undoAction?.();
      undoAction = null;
      const nextFocus = toast.contains(document.activeElement) ? action.dismissFocus?.() : null;
      toast.hidden = true;
      nextFocus?.focus();
    });
  }
  toastTimer = window.setTimeout(() => {
    const nextFocus = toast.contains(document.activeElement) ? action?.dismissFocus?.() : null;
    toast.hidden = true;
    undoAction = null;
    nextFocus?.focus();
  }, action ? 8000 : 5000);
  return actionButton;
}

function render(): void {
  renderStateList();
  renderAuthor();
  renderReview();
  bindWorkspace();
  app.setAttribute("aria-busy", "false");
}

function renderStateList(): void {
  if (!project.states.length) {
    stateList.innerHTML = `<div class="rail-empty"><span aria-hidden="true">＋</span><p>No states yet.</p><small>Add the first critical moment.</small></div>`;
    return;
  }
  stateList.innerHTML = project.states.map((state, index) => `
    <button class="state-item${state.id === selectedId ? " active" : ""}" type="button" data-select-state="${esc(state.id)}"${state.id === selectedId ? ' aria-current="true"' : ""}>
      <span class="state-index">${String(index + 1).padStart(2, "0")}</span>
      <span><strong>${esc(state.name)}</strong><small>${esc(state.id)}</small></span>
      ${state.id === selectedId ? '<em>Active</em>' : ""}
    </button>`).join("");
}

function stateButton(stateId: string | null): HTMLButtonElement | null {
  if (!stateId) return null;
  return [...stateList.querySelectorAll<HTMLButtonElement>("[data-select-state]")]
    .find((button) => button.dataset.selectState === stateId) ?? null;
}

function localeButton(locale: string): HTMLButtonElement | null {
  return [...document.querySelectorAll<HTMLButtonElement>("[data-locale]")]
    .find((button) => button.dataset.locale === locale) ?? null;
}

function cueItem(cueId: string): HTMLElement | null {
  return [...document.querySelectorAll<HTMLElement>("[data-cue-id]")]
    .find((item) => item.dataset.cueId === cueId) ?? null;
}

function renderAuthor(): void {
  const state = currentState();
  if (!state) {
    authorContent.innerHTML = `
      <div class="empty-state">
        <svg aria-hidden="true" viewBox="0 0 80 80"><path d="M16 20h48v34H42L28 66V54H16z"/><path d="M26 31h28M26 41h18"/></svg>
        <h4>Map your first critical moment</h4>
        <p>Start with a state where the objective or available action is only visible on the game canvas.</p>
        <button class="button primary" type="button" data-add-state>Add first state</button>
      </div>`;
    return;
  }
  const locales = allLocales(state);
  if (!locales.includes(selectedLocale)) selectedLocale = locales[0] ?? project.defaultLocale;
  const description = state.descriptions[selectedLocale] ?? "";
  authorContent.innerHTML = `
    <div class="author-fields">
      <div class="field-row two-up">
        <label>State name<input id="state-name" value="${esc(state.name)}" autocomplete="off" /></label>
        <label>State ID<input id="state-id" value="${esc(state.id)}" aria-describedby="id-help" autocomplete="off" spellcheck="false" /><small id="id-help">Used by your game code.</small></label>
      </div>
      <div class="language-bar" aria-label="Description languages">
        <div class="language-tabs">${locales.map((locale) => `<button type="button" data-locale="${esc(locale)}" class="language-tab${locale === selectedLocale ? " active" : ""}" aria-pressed="${locale === selectedLocale}">${esc(locale)}</button>`).join("")}</div>
        <form id="add-language-form" class="add-language-form">
          <label for="new-language">Language tag</label>
          <input id="new-language" name="language" placeholder="fr-CA" size="6" autocomplete="off" spellcheck="false" />
          <button type="submit">Add</button>
        </form>
      </div>
      <label class="description-field">State description <span>${esc(selectedLocale)}</span>
        <textarea id="state-description" rows="4" aria-describedby="description-help">${esc(description)}</textarea>
        <small id="description-help">Lead with the objective or change; describe only what affects the next decision.</small>
      </label>
      <div class="cue-heading">
        <div><h4>Focus order</h4><p>Actions are reviewed in this exact sequence.</p></div>
        <button class="button compact" id="add-cue" type="button">Add action</button>
      </div>
      <ol class="cue-list">${state.focusOrder.map((cue, index) => cueEditor(cue, index, state.focusOrder.length)).join("")}</ol>
      ${state.focusOrder.length ? "" : '<div class="cue-empty"><p>No actions in this state.</p><small>Add interactive objects or choices a reviewer should discover.</small></div>'}
      <button class="danger-button" id="delete-state" type="button">Delete “${esc(state.name)}”</button>
    </div>`;
}

function cueEditor(cue: EditableCue, index: number, total: number): string {
  return `<li class="cue-item" data-cue-index="${index}" data-cue-id="${esc(cue.id)}">
    <div class="cue-order"><span>${String(index + 1).padStart(2, "0")}</span><div>
      <button type="button" data-cue-move="up" aria-label="Move ${esc(cue.labels[selectedLocale] || cue.id)} earlier" ${index === 0 ? "disabled" : ""}>↑</button>
      <button type="button" data-cue-move="down" aria-label="Move ${esc(cue.labels[selectedLocale] || cue.id)} later" ${index === total - 1 ? "disabled" : ""}>↓</button>
    </div></div>
    <div class="cue-fields">
      <label>Action label <input data-cue-field="label" value="${esc(cue.labels[selectedLocale] ?? "")}" placeholder="Loose rope" /></label>
      <label>Spoken hint <input data-cue-field="description" value="${esc(cue.descriptions[selectedLocale] ?? "")}" placeholder="Press E to pick it up." /></label>
    </div>
    <button type="button" class="remove-cue" data-cue-remove aria-label="Remove ${esc(cue.labels[selectedLocale] || cue.id)}">Remove</button>
  </li>`;
}

function resolved(texts: Record<string, string>, locale: string): { text: string; locale: string } {
  const keys = Object.keys(texts);
  const exact = keys.find((key) => key.toLowerCase() === locale.toLowerCase());
  const related = keys.find((key) => key.split("-")[0]?.toLowerCase() === locale.split("-")[0]?.toLowerCase());
  const fallback = keys.find((key) => key.toLowerCase() === project.defaultLocale.toLowerCase());
  const key = exact ?? related ?? fallback ?? keys[0] ?? locale;
  return { text: texts[key] ?? "", locale: key };
}

function renderReview(): void {
  const state = currentState();
  if (!state) {
    reviewContent.innerHTML = `<div class="review-empty"><p>Preview waiting</p><small>Choose a state to test its description and action order.</small></div>`;
    return;
  }
  const locales = allLocales(state);
  const stateText = resolved(state.descriptions, selectedLocale);
  const cue = cueIndex >= 0 ? state.focusOrder[cueIndex] : undefined;
  const label = cue ? resolved(cue.labels, selectedLocale) : null;
  const hint = cue ? resolved(cue.descriptions, selectedLocale) : null;
  reviewContent.innerHTML = `
    <div class="review-toolbar">
      <label for="review-language">Voice language</label>
      <select id="review-language">${locales.map((locale) => `<option value="${esc(locale)}"${locale === selectedLocale ? " selected" : ""}>${esc(locale)}</option>`).join("")}</select>
    </div>
    <div class="caption-monitor" id="caption-monitor" tabindex="0" aria-label="Keyboard rehearsal. Use left and right arrow keys to move through actions, Home and End to jump, and S to speak." lang="${esc(stateText.locale)}">
      <div class="monitor-top"><span>ACTIVE STATE</span><span>${esc(stateText.locale)}</span></div>
      <h4>${esc(state.name)}</h4>
      <p id="preview-description">${esc(stateText.text) || '<span class="missing-text">Description missing in this language.</span>'}</p>
      <div class="active-cue" id="active-cue" aria-live="polite" aria-atomic="true"${cue && label ? ` lang="${esc(label.locale)}"` : ""}>
        ${cue && label && hint ? `<span>ACTION ${cueIndex + 1} / ${state.focusOrder.length}</span><strong>${esc(label.text)}</strong><p>${esc(hint.text) || "No spoken hint yet."}</p>` : `<span>FOCUS ORDER</span><p>${state.focusOrder.length ? "Press Right arrow to begin the action review." : "No actions have been authored for this state."}</p>`}
      </div>
    </div>
    <div class="review-controls">
      <button type="button" id="previous-cue" aria-label="Previous action" ${state.focusOrder.length ? "" : "disabled"}>←</button>
      <button type="button" class="speak-button" id="speak-preview"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M5 10v4h4l5 4V6l-5 4zM17 9a4 4 0 0 1 0 6M19 6a8 8 0 0 1 0 12"/></svg> Speak <kbd>S</kbd></button>
      <button type="button" id="next-cue" aria-label="Next action" ${state.focusOrder.length ? "" : "disabled"}>→</button>
    </div>
    <p class="key-help"><kbd>←</kbd><kbd>→</kbd> actions <kbd>Home</kbd><kbd>End</kbd> jump</p>`;
}

function bindWorkspace(): void {
  document.querySelectorAll<HTMLElement>("[data-add-state]").forEach((button) => button.addEventListener("click", addState));
  document.querySelectorAll<HTMLButtonElement>("[data-select-state]").forEach((button) => button.addEventListener("click", () => {
    selectedId = button.dataset.selectState ?? null;
    const state = currentState();
    selectedLocale = state ? Object.keys(state.descriptions)[0] ?? project.defaultLocale : project.defaultLocale;
    cueIndex = -1;
    render();
    stateButton(selectedId)?.focus();
  }));
  document.querySelectorAll<HTMLButtonElement>("[data-locale]").forEach((button) => button.addEventListener("click", () => {
    selectedLocale = button.dataset.locale ?? project.defaultLocale;
    cueIndex = -1;
    render();
    localeButton(selectedLocale)?.focus();
  }));
  const state = currentState();
  if (!state) return;
  required<HTMLInputElement>("state-name").addEventListener("input", (event) => {
    state.name = (event.target as HTMLInputElement).value;
    save();
    syncRenderedStateName(state);
  });
  required<HTMLInputElement>("state-id").addEventListener("change", (event) => updateStateId(state, event.target as HTMLInputElement));
  required<HTMLTextAreaElement>("state-description").addEventListener("input", (event) => {
    state.descriptions[selectedLocale] = (event.target as HTMLTextAreaElement).value;
    save();
    renderReviewOnly();
  });
  const addLanguageForm = required<HTMLFormElement>("add-language-form");
  const languageInput = required<HTMLInputElement>("new-language");
  // Native constraint validation blocks a second submit before our submit
  // handler can run. Clear an error from a previous attempt as soon as the
  // author starts correcting the tag, so the corrected value can be submitted.
  languageInput.addEventListener("input", () => languageInput.setCustomValidity(""));
  addLanguageForm.addEventListener("submit", (event) => addLanguage(event, state));
  required<HTMLButtonElement>("add-cue").addEventListener("click", () => addCue(state));
  required<HTMLButtonElement>("delete-state").addEventListener("click", () => deleteState(state));
  document.querySelectorAll<HTMLElement>("[data-cue-index]").forEach((item) => bindCue(item, state));
  bindReview(state);
}

function renderReviewOnly(): void {
  renderReview();
  const state = currentState();
  if (state) bindReview(state);
}

function updateStateId(state: EditableState, input: HTMLInputElement): void {
  const next = input.value.trim();
  if (!/^[a-z0-9]+(?:[._-][a-z0-9]+)*$/i.test(next)) {
    input.setCustomValidity("Use letters, numbers, dots, underscores, or hyphens.");
    input.reportValidity();
    return;
  }
  if (project.states.some((item) => item !== state && item.id === next)) {
    input.setCustomValidity("That state ID is already in use.");
    input.reportValidity();
    return;
  }
  input.setCustomValidity("");
  state.id = next;
  selectedId = next;
  save();
  syncRenderedStateId(state);
}

function syncRenderedStateName(state: EditableState): void {
  const active = stateList.querySelector<HTMLElement>(".state-item.active");
  active?.querySelector("strong")?.replaceChildren(state.name);
  const deleteButton = document.getElementById("delete-state");
  if (deleteButton) deleteButton.textContent = `Delete “${state.name}”`;
  const previewHeading = document.querySelector("#caption-monitor h4");
  if (previewHeading) previewHeading.textContent = state.name;
}

function syncRenderedStateId(state: EditableState): void {
  const active = stateList.querySelector<HTMLElement>(".state-item.active");
  if (!active) return;
  active.dataset.selectState = state.id;
  active.querySelector("small")?.replaceChildren(state.id);
}

function addLanguage(event: SubmitEvent, state: EditableState): void {
  event.preventDefault();
  const input = required<HTMLInputElement>("new-language");
  try {
    const [locale] = Intl.getCanonicalLocales(input.value.trim());
    if (!locale) throw new Error();
    if (allLocales(state).includes(locale)) {
      input.setCustomValidity("That language is already in this state.");
      input.reportValidity();
      return;
    }
    input.setCustomValidity("");
    state.descriptions[locale] = "";
    state.focusOrder.forEach((cue) => { cue.labels[locale] = ""; cue.descriptions[locale] = ""; });
    selectedLocale = locale;
    cueIndex = -1;
    save();
    render();
    required<HTMLTextAreaElement>("state-description").focus();
  } catch {
    input.setCustomValidity("Enter a valid BCP 47 language tag, such as fr or pt-BR.");
    input.reportValidity();
  }
}

function bindCue(item: HTMLElement, state: EditableState): void {
  const index = Number(item.dataset.cueIndex);
  const cue = state.focusOrder[index];
  if (!cue) return;
  item.querySelector<HTMLInputElement>("[data-cue-field='label']")?.addEventListener("input", (event) => {
    cue.labels[selectedLocale] = (event.target as HTMLInputElement).value;
    save();
    renderReviewOnly();
  });
  item.querySelector<HTMLInputElement>("[data-cue-field='description']")?.addEventListener("input", (event) => {
    cue.descriptions[selectedLocale] = (event.target as HTMLInputElement).value;
    save();
    renderReviewOnly();
  });
  item.querySelector<HTMLButtonElement>("[data-cue-move='up']")?.addEventListener("click", () => moveCue(state, index, -1));
  item.querySelector<HTMLButtonElement>("[data-cue-move='down']")?.addEventListener("click", () => moveCue(state, index, 1));
  item.querySelector<HTMLButtonElement>("[data-cue-remove]")?.addEventListener("click", () => removeCue(state, index));
}

function addState(): void {
  const id = uniqueId("new-state", project.states.map((state) => state.id));
  project.states.push({ id, name: "New game state", descriptions: { [project.defaultLocale]: "" }, focusOrder: [] });
  selectedId = id;
  selectedLocale = project.defaultLocale;
  cueIndex = -1;
  save("New state saved locally");
  render();
  required<HTMLInputElement>("state-name").select();
}

function addCue(state: EditableState): void {
  const id = uniqueId("action", state.focusOrder.map((cue) => cue.id));
  const labels = Object.fromEntries(allLocales(state).map((locale) => [locale, ""]));
  const descriptions = Object.fromEntries(allLocales(state).map((locale) => [locale, ""]));
  state.focusOrder.push({ id, labels, descriptions });
  cueIndex = state.focusOrder.length - 1;
  save("Action added and saved");
  render();
  document.querySelector<HTMLInputElement>(`[data-cue-index="${cueIndex}"] [data-cue-field="label"]`)?.focus();
}

function moveCue(state: EditableState, index: number, offset: number): void {
  const target = index + offset;
  if (target < 0 || target >= state.focusOrder.length) return;
  const [cue] = state.focusOrder.splice(index, 1);
  if (!cue) return;
  state.focusOrder.splice(target, 0, cue);
  cueIndex = target;
  save("Focus order updated");
  render();
  const movedItem = cueItem(cue.id);
  const sameDirection = movedItem?.querySelector<HTMLButtonElement>(`[data-cue-move="${offset > 0 ? "down" : "up"}"]`);
  const reverseDirection = movedItem?.querySelector<HTMLButtonElement>(`[data-cue-move="${offset > 0 ? "up" : "down"}"]`);
  (sameDirection && !sameDirection.disabled ? sameDirection : reverseDirection)?.focus();
}

function removeCue(state: EditableState, index: number): void {
  const [removed] = state.focusOrder.splice(index, 1);
  if (!removed) return;
  cueIndex = Math.min(cueIndex, state.focusOrder.length - 1);
  save("Action removed");
  render();
  const focusAfterRemoval = (): HTMLElement | null => {
    const remaining = document.querySelectorAll<HTMLButtonElement>("[data-cue-remove]");
    return remaining[Math.min(index, remaining.length - 1)] ?? document.getElementById("add-cue");
  };
  showToast(`Removed “${removed.labels[selectedLocale] || removed.id}”.`, {
    label: "Undo",
    run: () => {
      state.focusOrder.splice(index, 0, removed);
      save("Action restored");
      render();
      cueItem(removed.id)?.querySelector<HTMLButtonElement>("[data-cue-remove]")?.focus();
    },
    dismissFocus: focusAfterRemoval
  })?.focus();
}

function deleteState(state: EditableState): void {
  const index = project.states.indexOf(state);
  project.states.splice(index, 1);
  selectedId = project.states[index]?.id ?? project.states[index - 1]?.id ?? null;
  cueIndex = -1;
  save("State removed");
  render();
  const focusAfterDeletion = (): HTMLElement | null => stateButton(selectedId) ?? document.getElementById("add-state");
  showToast(`Deleted “${state.name}”.`, {
    label: "Undo",
    run: () => {
      project.states.splice(index, 0, state);
      selectedId = state.id;
      save("State restored");
      render();
      document.getElementById("delete-state")?.focus();
    },
    dismissFocus: focusAfterDeletion
  })?.focus();
}

function bindReview(state: EditableState): void {
  const monitor = document.getElementById("caption-monitor");
  required<HTMLSelectElement>("review-language").addEventListener("change", (event) => {
    selectedLocale = (event.target as HTMLSelectElement).value;
    cueIndex = -1;
    render();
    document.getElementById("review-language")?.focus();
  });
  required<HTMLButtonElement>("previous-cue").addEventListener("click", () => stepCue(state, "previous", "previous-cue"));
  required<HTMLButtonElement>("next-cue").addEventListener("click", () => stepCue(state, "next", "next-cue"));
  required<HTMLButtonElement>("speak-preview").addEventListener("click", () => speakPreview(state));
  monitor?.addEventListener("keydown", (event) => {
    const key = (event as KeyboardEvent).key;
    if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(key)) {
      event.preventDefault();
      stepCue(state, key === "ArrowLeft" ? "previous" : key === "Home" ? "first" : key === "End" ? "last" : "next", "caption-monitor");
    } else if (key.toLowerCase() === "s") {
      event.preventDefault();
      speakPreview(state);
    }
  });
}

function stepCue(state: EditableState, direction: "next" | "previous" | "first" | "last", focusId?: string): void {
  const total = state.focusOrder.length;
  if (!total) return;
  if (direction === "first") cueIndex = 0;
  else if (direction === "last") cueIndex = total - 1;
  else if (direction === "next") cueIndex = (cueIndex + 1 + total) % total;
  else cueIndex = (cueIndex - 1 + total) % total;
  renderReviewOnly();
  if (focusId) document.getElementById(focusId)?.focus();
}

function speakPreview(state: EditableState): void {
  if (!("speechSynthesis" in window) || typeof SpeechSynthesisUtterance === "undefined") {
    showToast("Speech synthesis is not available in this browser. Try a current desktop or mobile browser.");
    return;
  }
  const stateText = resolved(state.descriptions, selectedLocale);
  const cue = cueIndex >= 0 ? state.focusOrder[cueIndex] : undefined;
  const cueLabel = cue ? resolved(cue.labels, selectedLocale) : null;
  const cueHint = cue ? resolved(cue.descriptions, selectedLocale) : null;
  const cueText = cueLabel && cueHint ? `${cueLabel.text}. ${cueHint.text}` : "";
  const text = cueText || `${state.name}. ${stateText.text}`;
  if (!text.trim()) {
    showToast("Write a description before speaking this state.");
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = cueLabel?.locale ?? stateText.locale;
  window.speechSynthesis.speak(utterance);
  showToast(`Speaking in ${utterance.lang}.`);
}

function replaceProject(next: Project, message: string): void {
  const previous = clone(project);
  project = clone(next);
  selectedId = project.states[0]?.id ?? null;
  selectedLocale = project.defaultLocale;
  cueIndex = -1;
  save(message);
  render();
  showToast(message, {
    label: "Undo",
    run: () => {
      project = previous;
      selectedId = project.states[0]?.id ?? null;
      selectedLocale = project.defaultLocale;
      save("Previous project restored");
      render();
      stateButton(selectedId)?.focus();
    },
    dismissFocus: () => stateButton(selectedId) ?? document.getElementById("add-state")
  });
}

function resetDemo(): void {
  project = sampleProject();
  selectedId = project.states[0]?.id ?? null;
  selectedLocale = project.defaultLocale;
  cueIndex = -1;
  save("Demo reset with sample data");
  render();
  stateButton(selectedId)?.focus();
  showToast("Demo reset with sample data.");
}

function startForReal(): void {
  try {
    localStorage.removeItem(DEMO_STORAGE_KEY);
  } finally {
    window.location.assign("/");
  }
}

required<HTMLButtonElement>("add-state").addEventListener("click", addState);
required<HTMLButtonElement>("load-sample").addEventListener("click", () => replaceProject(sampleProject(), "Example project loaded"));
required<HTMLInputElement>("import-file").addEventListener("change", async (event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  try {
    const value: unknown = JSON.parse(await file.text());
    validateProjectShape(value);
    replaceProject(value, `Imported ${file.name}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "The selected file could not be read.";
    showToast(`Import failed: ${message}`);
  } finally {
    input.value = "";
  }
});
required<HTMLButtonElement>("export-project").addEventListener("click", () => {
  try {
    validateProjectShape(project);
    const blob = new Blob([`${JSON.stringify(project, null, 2)}\n`], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${slug(project.name)}-captions.json`;
    link.click();
    URL.revokeObjectURL(link.href);
    showToast("Project JSON exported.");
  } catch (error) {
    const message = error instanceof CaptionerValidationError || error instanceof Error ? error.message : "Complete the required fields first.";
    showToast(`Export blocked: ${message}`);
  }
});
required<HTMLButtonElement>("copy-install").addEventListener("click", async (event) => {
  try {
    await navigator.clipboard.writeText("npm install a11y-playtest-captioner");
    (event.currentTarget as HTMLButtonElement).textContent = "Copied";
  } catch {
    showToast("Copy was blocked. Select the install command manually.");
  }
});

if (isDemo) {
  required<HTMLButtonElement>("reset-demo").addEventListener("click", resetDemo);
  required<HTMLButtonElement>("start-for-real").addEventListener("click", startForReal);
}

const offlineStatus = required<HTMLElement>("offline-status");
function updateConnection(isOnline = navigator.onLine): void {
  const text = offlineStatus.querySelector("span:last-child");
  offlineStatus.classList.toggle("offline", !isOnline);
  if (text) text.textContent = isOnline ? "Ready offline after first visit" : "Offline — local editing still works";
}
// The events are authoritative when a browser's network stack changes. This
// avoids depending on a stale navigator.onLine value during a reload.
window.addEventListener("online", () => updateConnection(true));
window.addEventListener("offline", () => updateConnection(false));
updateConnection();

render();
if (isDemo) save("Demo sample ready");
if (startupMessage) showToast(startupMessage);

if ("serviceWorker" in navigator && import.meta.env.PROD) {
  navigator.serviceWorker.register("/sw.js").catch(() => {
    offlineStatus.classList.add("offline");
    const text = offlineStatus.querySelector("span:last-child");
    if (text) text.textContent = "Offline cache unavailable; local drafts still work";
  });
}
