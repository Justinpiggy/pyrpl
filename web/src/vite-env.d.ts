interface Window {
  pyrplScope?: {
    getFrameSequence: () => number | null;
    getSampleCount: () => number;
    getXRange: () => { min: number; max: number };
    getYRange: () => { min: number; max: number };
    isChannelVisible: (channel: 1 | 2) => boolean;
    getEventCount: () => number;
    getTraceAverage: () => number;
    getRunningState: () => string;
    isPanelEnabled: (panelId: "scope" | "asg" | "housekeeping" | "registers") => boolean;
    getScopeSplitSizes: () => [number, number];
    getWorkspaceLayoutMode: () => "tabs" | "split-horizontal" | "split-vertical";
    getWorkspaceSplitSizes: () => number[];
    getActivePanelId: () => "scope" | "asg" | "housekeeping" | "registers" | null;
    getCsvLineCount: () => number;
    getDisplayedStats: () => { ch1Min: number; ch1Max: number; ch2Min: number; ch2Max: number } | null;
    moduleStatusText: () => string;
    statusText: () => string;
  };
}
