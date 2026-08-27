import { describe, expect, it, vi } from "vitest";
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
});
