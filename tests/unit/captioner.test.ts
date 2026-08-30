import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { CaptionerValidationError, createCaptioner, type CaptionState } from "../../src/index";

const state: CaptionState = {
  id: "bridge-out",
  name: "Broken bridge",
  descriptions: {
    en: "The bridge has collapsed. Find another path across the ravine.",
    es: "El puente se ha derrumbado. Busca otra ruta para cruzar el barranco."
  },
  focusOrder: [
    {
      id: "rope",
      labels: { en: "Coiled rope", es: "Cuerda enrollada" },
      descriptions: { en: "Press E to pick up.", es: "Pulsa E para recogerla." }
    },
    {
      id: "ledge",
      labels: { en: "Narrow ledge", es: "Cornisa estrecha" }
    }
  ]
};

describe("createCaptioner", () => {
  it("supports the documented activation and subscription flow", () => {
    const captioner = createCaptioner({ locale: "en", states: [state] });
    const listener = vi.fn();
    const unsubscribe = captioner.subscribe(listener);

    expect(captioner.activate("bridge-out")).toMatchObject({
      stateId: "bridge-out",
      stateName: "Broken bridge",
      locale: "en",
      resolvedLocale: "en",
      description: state.descriptions.en,
      activeCue: null
    });
    expect(listener).toHaveBeenCalledTimes(2);

    unsubscribe();
    captioner.destroy();
  });

  it("resolves regional locales, language fallback, and ordered cues", () => {
    const captioner = createCaptioner({ states: [state], fallbackLocale: "en" });
    captioner.activate("bridge-out");

    expect(captioner.setLocale("es-MX")).toMatchObject({ resolvedLocale: "es", description: state.descriptions.es });
    expect(captioner.moveFocus("next").activeCue).toMatchObject({ id: "rope", label: "Cuerda enrollada", position: 1, total: 2 });
    expect(captioner.moveFocus("last").activeCue).toMatchObject({ id: "ledge", position: 2 });
    expect(captioner.moveFocus("next").activeCue).toMatchObject({ id: "rope", position: 1 });
  });

  it("validates language tags, content, IDs, and duplicate registrations", () => {
    expect(() => createCaptioner({ locale: "not_a_locale" })).toThrow(CaptionerValidationError);
    expect(() => createCaptioner({ states: [{ ...state, id: "bad id" }] })).toThrow(/State ID/);
    expect(() => createCaptioner({ states: [{ ...state, descriptions: { en: " " } }] })).toThrow(/non-blank/);

    const captioner = createCaptioner({ states: [state] });
    expect(() => captioner.register(state)).toThrow(/already registered/);
    expect(() => captioner.activate("unknown")).toThrow(/Register it before activation/);
  });

  it("registerMany is atomic when an incoming state is invalid", () => {
    const captioner = createCaptioner();
    expect(() => captioner.registerMany([state, { ...state, id: "bridge-out" }])).toThrow(/already registered/);
    expect(() => captioner.activate("bridge-out")).toThrow(/Unknown state/);
  });

  it("returns false when on-device speech is unavailable", () => {
    const captioner = createCaptioner({ states: [state] });
    captioner.activate("bridge-out");
    expect(captioner.speak()).toBe(false);
  });

  it("uses the active cue's resolved fallback locale for speech", () => {
    const speak = vi.fn();
    class FakeUtterance {
      lang = "";
      voice: SpeechSynthesisVoice | null = null;
      constructor(readonly text: string) {}
    }
    vi.stubGlobal("SpeechSynthesisUtterance", FakeUtterance);
    vi.stubGlobal("window", {
      speechSynthesis: { cancel: vi.fn(), getVoices: () => [], speak }
    });

    try {
      const captioner = createCaptioner({
        locale: "es-MX",
        fallbackLocale: "en",
        states: [{
          id: "gate",
          name: "Gate",
          descriptions: { es: "La puerta está cerrada.", en: "The gate is closed." },
          focusOrder: [{ id: "lever", labels: { en: "Lever" }, descriptions: { en: "Press E." } }]
        }]
      });
      captioner.activate("gate");
      const snapshot = captioner.moveFocus("next");

      expect(snapshot.activeCue).toMatchObject({ label: "Lever", description: "Press E.", resolvedLocale: "en" });
      expect(captioner.speak()).toBe(true);
      expect(speak).toHaveBeenCalledWith(expect.objectContaining({ text: "Lever. Press E. 1 of 1.", lang: "en" }));
      captioner.destroy();
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("keeps a newer live region when a stale mount cleanup runs", () => {
    class FakeRegion {
      dataset: Record<string, string> = {};
      style: Record<string, string> = {};
      className = "";
      lang = "";
      textContent = "";
      parent: FakeHost | null = null;
      setAttribute(): void {}
      remove(): void { this.parent?.regions.delete(this); }
    }
    class FakeHost {
      readonly regions = new Set<FakeRegion>();
      readonly ownerDocument = { createElement: () => new FakeRegion() };
      insertAdjacentElement(_where: InsertPosition, region: Element): void {
        const managed = region as unknown as FakeRegion;
        managed.parent = this;
        this.regions.add(managed);
      }
    }
    vi.stubGlobal("Element", FakeHost);

    try {
      const captioner = createCaptioner();
      const first = new FakeHost();
      const second = new FakeHost();
      const unmountFirst = captioner.mount(first as unknown as Element);
      const unmountSecond = captioner.mount(second as unknown as Element);

      expect(first.regions.size).toBe(0);
      expect(second.regions.size).toBe(1);
      unmountFirst();
      expect(second.regions.size).toBe(1);
      unmountSecond();
      expect(second.regions.size).toBe(0);
      captioner.destroy();
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("keeps the published artifact zero-dependency", () => {
    const manifest = JSON.parse(readFileSync(new URL("../../package.json", import.meta.url), "utf8")) as { dependencies?: Record<string, string> };
    expect(manifest.dependencies ?? {}).toEqual({});
  });

  it("runs the documented library lifecycle @claim:library-api", () => {
    const captioner = createCaptioner();
    const listener = vi.fn();
    const unsubscribe = captioner.subscribe(listener);
    captioner.register(state);
    expect(captioner.activate("bridge-out").stateId).toBe("bridge-out");
    expect(captioner.setLocale("es-MX").resolvedLocale).toBe("es");
    expect(captioner.moveFocus("next").activeCue?.id).toBe("rope");
    expect(captioner.getSnapshot().activeCue?.id).toBe("rope");
    expect(listener).toHaveBeenCalled();
    unsubscribe();
    captioner.destroy();
    expect(() => captioner.register(state)).toThrow(/destroyed/);
  });

  it("validates tags and speaks action fallback in its resolved language @claim:language-tags-and-fallback", () => {
    expect(() => createCaptioner({ locale: "not_a_locale" })).toThrow(CaptionerValidationError);
    const speak = vi.fn();
    class FakeUtterance {
      lang = "";
      voice: SpeechSynthesisVoice | null = null;
      constructor(readonly text: string) {}
    }
    vi.stubGlobal("SpeechSynthesisUtterance", FakeUtterance);
    vi.stubGlobal("window", { speechSynthesis: { cancel: vi.fn(), getVoices: () => [], speak } });
    try {
      const captioner = createCaptioner({
        locale: "es-MX", fallbackLocale: "en",
        states: [{ id: "gate", name: "Gate", descriptions: { es: "La puerta está cerrada." }, focusOrder: [{ id: "lever", labels: { en: "Lever" }, descriptions: { en: "Press E." } }] }]
      });
      captioner.activate("gate");
      expect(captioner.moveFocus("next").activeCue?.resolvedLocale).toBe("en");
      expect(captioner.speak()).toBe(true);
      expect(speak).toHaveBeenCalledWith(expect.objectContaining({ lang: "en" }));
      captioner.destroy();
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("adds a polite announcement only when mounting asks for one @claim:mounted-announcement", () => {
    class FakeRegion {
      dataset: Record<string, string> = {};
      style: Record<string, string> = {};
      className = "";
      lang = "";
      textContent = "";
      attributes = new Map<string, string>();
      parent: FakeHost | null = null;
      setAttribute(name: string, value: string): void { this.attributes.set(name, value); }
      remove(): void { this.parent?.regions.delete(this); }
    }
    class FakeHost {
      readonly regions = new Set<FakeRegion>();
      readonly ownerDocument = { createElement: () => new FakeRegion() };
      insertAdjacentElement(_where: InsertPosition, region: Element): void {
        const managed = region as unknown as FakeRegion;
        managed.parent = this;
        this.regions.add(managed);
      }
    }
    vi.stubGlobal("Element", FakeHost);
    try {
      const captioner = createCaptioner();
      const announced = new FakeHost();
      const silent = new FakeHost();
      captioner.mount(announced as unknown as Element);
      captioner.mount(silent as unknown as Element, { liveRegion: false });
      expect(announced.regions.size).toBe(0);
      expect(silent.regions.size).toBe(0);
      // Mounting a second host replaces the first managed region. Re-mount the
      // announced host to assert the region's observable accessibility role.
      captioner.mount(announced as unknown as Element);
      const region = [...announced.regions][0];
      expect(region?.attributes.get("role")).toBe("status");
      expect(region?.attributes.get("aria-live")).toBe("polite");
      captioner.destroy();
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
