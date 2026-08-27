export interface EditableCue {
  id: string;
  labels: Record<string, string>;
  descriptions: Record<string, string>;
}

export interface EditableState {
  id: string;
  name: string;
  descriptions: Record<string, string>;
  focusOrder: EditableCue[];
}

export interface Project {
  version: 1;
  name: string;
  defaultLocale: string;
  states: EditableState[];
}

export const emptyProject = (): Project => ({
  version: 1,
  name: "Untitled game",
  defaultLocale: "en",
  states: []
});

export const sampleProject = (): Project => ({
  version: 1,
  name: "Signal Hollow",
  defaultLocale: "en",
  states: [
    {
      id: "ravine-crossing",
      name: "Ravine crossing",
      descriptions: {
        en: "A broken bridge blocks the path north. Secure the loose rope to cross.",
        es: "Un puente roto bloquea el camino al norte. Asegura la cuerda suelta para cruzar."
      },
      focusOrder: [
        {
          id: "loose-rope",
          labels: { en: "Loose rope", es: "Cuerda suelta" },
          descriptions: { en: "Press E to pick it up.", es: "Pulsa E para recogerla." }
        },
        {
          id: "anchor-post",
          labels: { en: "Anchor post", es: "Poste de anclaje" },
          descriptions: { en: "Attach the rope here after collecting it.", es: "Sujeta la cuerda aquí después de recogerla." }
        }
      ]
    },
    {
      id: "watcher-alert",
      name: "Watcher alert",
      descriptions: {
        en: "A watcher is searching the lower path. Stay behind the stone cover.",
        es: "Un vigilante registra el camino inferior. Quédate detrás de la cobertura de piedra."
      },
      focusOrder: [
        {
          id: "stone-cover",
          labels: { en: "Stone cover", es: "Cobertura de piedra" },
          descriptions: { en: "Hold C to crouch behind it.", es: "Mantén C para agacharte detrás." }
        }
      ]
    }
  ]
});
