interface Window {
  pyrplScope?: {
    getFrameSequence: () => number | null;
    getSampleCount: () => number;
    getXRange: () => { min: number; max: number };
    getYRange: () => { min: number; max: number };
    getScopeTimeLabels: () => string[];
    isChannelVisible: (channel: 1 | 2) => boolean;
    getEventCount: () => number;
    getTraceAverage: () => number;
    getRunningState: () => string;
    isPanelEnabled: (
      panelId:
        | "scope"
        | "asg"
        | "pid"
        | "iq"
        | "iir"
        | "trig"
        | "pwm"
        | "spectrumanalyzer"
        | "networkanalyzer"
        | "curveviewer"
        | "pyrplconfig"
        | "lockbox"
        | "housekeeping"
        | "telemetry"
        | "registers",
    ) => boolean;
    getScopeSplitSizes: () => [number, number];
    getWorkspaceLayoutMode: () => "tabs" | "split-horizontal" | "split-vertical";
    getWorkspaceSplitSizes: () => number[];
    getWorkspaceSplitPanelIds: () => Array<
      | "scope"
      | "asg"
      | "pid"
      | "iq"
      | "iir"
      | "trig"
      | "pwm"
      | "spectrumanalyzer"
      | "networkanalyzer"
      | "curveviewer"
      | "pyrplconfig"
      | "lockbox"
      | "housekeeping"
      | "telemetry"
      | "registers"
    >;
    getActivePanelId: () =>
      | "scope"
      | "asg"
      | "pid"
      | "iq"
      | "iir"
      | "trig"
      | "pwm"
      | "spectrumanalyzer"
      | "networkanalyzer"
      | "curveviewer"
      | "pyrplconfig"
      | "lockbox"
      | "housekeeping"
      | "telemetry"
      | "registers"
      | null;
    getCsvLineCount: () => number;
    getDisplayedStats: () => { ch1Min: number; ch1Max: number; ch2Min: number; ch2Max: number } | null;
    getDisplayedDataFingerprint: () => number | null;
    getScopeMathStats: () => { min: number; max: number } | null;
    getScopeXyStats: () => { xMin: number; xMax: number; yMin: number; yMax: number; maxDelta: number } | null;
    moduleStatusText: () => string;
    statusText: () => string;
    getSpectrumSeriesCount: () => number;
    getSpectrumBinCount: () => number;
    getSpectrumAverageCount: () => number;
    getSpectrumXRange: () => { min: number; max: number };
    getSpectrumYRange: () => { min: number; max: number };
    getSpectrumCurveData: () => {
      x: number[];
      series: Array<{ label: string; values: number[]; imaginary?: number[] }>;
      unit: string;
    } | null;
    getNetworkAnalyzerCurveData: () => {
      x: number[];
      real: number[];
      imaginary: number[];
    } | null;
    getNetworkAnalyzerView: () => {
      magnitude: { x: { min?: number; max?: number }; y: { min?: number; max?: number } };
      phase: { x: { min?: number; max?: number }; y: { min?: number; max?: number } };
      zeroSpan: boolean;
      logscale: boolean;
    };
    getIirXRange: () => { min: number; max: number } | null;
    getIirMagnitudeYRange: () => { min: number; max: number } | null;
    getIirPhaseYRange: () => { min: number; max: number } | null;
    getLockboxClassname: () => string | null;
    getLockboxStageCount: () => number;
  };
}
