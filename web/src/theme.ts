import { normalizeTheme, type ThemeName } from "./workspace";

/** Colors are a workspace/profile setting; changing them never rebuilds plots. */
export function applyTheme(theme: ThemeName): void {
  const name = normalizeTheme(theme);
  if (document.documentElement.dataset.theme === name) return;
  document.documentElement.dataset.theme = name;
  window.dispatchEvent(new Event("pyrpl-theme-change"));
}
