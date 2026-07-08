import { PANEL_DEFINITIONS, type PanelId, panelDefinition } from "./panel-registry";

const WORKSPACE_STORAGE_KEY = "pyrpl-websocket.workspace.v1";
export type WorkspaceLayoutMode = "tabs" | "split-horizontal" | "split-vertical";

const DEFAULT_LAYOUT_MODE: WorkspaceLayoutMode = "tabs";
const DEFAULT_WORKSPACE_SPLIT_SIZES = [50, 50];

export interface PanelWorkspaceState {
  enabled: boolean;
  splitSizes?: [number, number];
}

export interface WorkspaceState {
  activePanelId: PanelId | null;
  layoutMode: WorkspaceLayoutMode;
  workspaceSplitSizes: number[];
  panels: Record<PanelId, PanelWorkspaceState>;
}

export function defaultWorkspaceState(): WorkspaceState {
  const panels = Object.fromEntries(
    PANEL_DEFINITIONS.map((panel) => [
      panel.id,
      {
        enabled: panel.defaultEnabled,
        splitSizes: panel.defaultSplitSizes,
      },
    ]),
  ) as Record<PanelId, PanelWorkspaceState>;
  return {
    activePanelId: firstEnabledPanel(panels),
    layoutMode: DEFAULT_LAYOUT_MODE,
    workspaceSplitSizes: [...DEFAULT_WORKSPACE_SPLIT_SIZES],
    panels,
  };
}

export function loadWorkspaceState(): WorkspaceState {
  let saved: unknown = null;
  try {
    saved = JSON.parse(window.localStorage.getItem(WORKSPACE_STORAGE_KEY) ?? "");
  } catch {
    return defaultWorkspaceState();
  }
  if (!saved || typeof saved !== "object") {
    return defaultWorkspaceState();
  }
  const payload = saved as Partial<WorkspaceState>;
  const fallback = defaultWorkspaceState();
  const panels = { ...fallback.panels };

  for (const definition of PANEL_DEFINITIONS) {
    const savedPanel = payload.panels?.[definition.id];
    panels[definition.id] = {
      enabled: typeof savedPanel?.enabled === "boolean" ? savedPanel.enabled : panels[definition.id].enabled,
      splitSizes: definition.defaultSplitSizes
        ? normalizeSplitSizes(savedPanel?.splitSizes, definition.defaultSplitSizes)
        : undefined,
    };
  }

  const activePanelId =
    payload.activePanelId && panels[payload.activePanelId]?.enabled
      ? payload.activePanelId
      : firstEnabledPanel(panels);

  return {
    activePanelId,
    layoutMode: normalizeLayoutMode(payload.layoutMode),
    workspaceSplitSizes: normalizeWorkspaceSplitSizes(payload.workspaceSplitSizes, DEFAULT_WORKSPACE_SPLIT_SIZES.length),
    panels,
  };
}

export function saveWorkspaceState(state: WorkspaceState): void {
  window.localStorage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(state));
}

export function firstEnabledPanel(panels: Record<PanelId, PanelWorkspaceState>): PanelId | null {
  return PANEL_DEFINITIONS.find((panel) => panels[panel.id]?.enabled)?.id ?? null;
}

export function normalizeLayoutMode(value: unknown): WorkspaceLayoutMode {
  if (value === "tabs" || value === "split-horizontal" || value === "split-vertical") {
    return value;
  }
  return DEFAULT_LAYOUT_MODE;
}

export function normalizeSplitSizes(
  value: unknown,
  fallback: [number, number] = panelDefinition("scope").defaultSplitSizes ?? [28, 72],
): [number, number] {
  if (Array.isArray(value) && value.length === 2) {
    const first = Number(value[0]);
    const second = Number(value[1]);
    if (Number.isFinite(first) && Number.isFinite(second) && first >= 15 && second >= 35) {
      const total = first + second;
      return [Math.round((first / total) * 1000) / 10, Math.round((second / total) * 1000) / 10];
    }
  }
  return [...fallback];
}

export function normalizeWorkspaceSplitSizes(value: unknown, paneCount: number): number[] {
  const fallback = Array.from({ length: paneCount }, () => Math.round((100 / paneCount) * 10) / 10);
  if (!Array.isArray(value) || value.length !== paneCount) {
    return fallback;
  }
  const sizes = value.map(Number);
  if (sizes.some((size) => !Number.isFinite(size) || size < 10)) {
    return fallback;
  }
  const total = sizes.reduce((sum, size) => sum + size, 0);
  if (total <= 0) {
    return fallback;
  }
  return sizes.map((size) => Math.round((size / total) * 1000) / 10);
}
