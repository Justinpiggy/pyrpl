export type PanelId =
  | "scope"
  | "asg"
  | "pid"
  | "iq"
  | "trig"
  | "pwm"
  | "spectrumanalyzer"
  | "housekeeping"
  | "registers";

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
    id: "asg",
    title: "ASG",
    description: "Arbitrary signal generator controls",
    defaultEnabled: false,
  },
  {
    id: "pid",
    title: "PID",
    description: "PID controller controls",
    defaultEnabled: false,
  },
  {
    id: "iq",
    title: "IQ",
    description: "IQ modulator and demodulator controls",
    defaultEnabled: false,
  },
  {
    id: "trig",
    title: "Trigger",
    description: "DSP trigger controls",
    defaultEnabled: false,
  },
  {
    id: "pwm",
    title: "PWM",
    description: "Auxiliary PWM routing controls",
    defaultEnabled: false,
  },
  {
    id: "spectrumanalyzer",
    title: "Spectrum Analyzer",
    description: "FFT spectrum analyzer controls and plot",
    defaultEnabled: false,
    defaultSplitSizes: [35, 65],
  },
  {
    id: "housekeeping",
    title: "Housekeeping",
    description: "LED and expansion connector I/O",
    defaultEnabled: false,
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
