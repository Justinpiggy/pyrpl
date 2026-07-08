export type PanelId = "scope" | "registers";

export interface PanelDefinition {
  id: PanelId;
  title: string;
  description: string;
  defaultEnabled: boolean;
  defaultSplitSizes?: [number, number];
}

export const PANEL_DEFINITIONS: PanelDefinition[] = [
  {
    id: "scope",
    title: "Scope",
    description: "Oscilloscope controls and live waveform",
    defaultEnabled: true,
    defaultSplitSizes: [28, 72],
  },
  {
    id: "registers",
    title: "Register Debug",
    description: "Raw monitor_server register read/write",
    defaultEnabled: false,
  },
];

export function panelDefinition(panelId: PanelId): PanelDefinition {
  const definition = PANEL_DEFINITIONS.find((panel) => panel.id === panelId);
  if (!definition) {
    throw new Error(`Unknown panel ${panelId}`);
  }
  return definition;
}
