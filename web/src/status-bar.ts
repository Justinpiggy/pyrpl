// Keep diagnostic sources in place for their owning controls, but render them
// only in the footer. This also covers module panels created after startup.
export const DIAGNOSTIC_SOURCES = [
  "#session-line", "output[id$='-status']", "#status", ".iir-plot-status",
  "#scope-current-average", "#spectrum-current-average",
  "#plot-hint", "#spectrum-plot-hint", ".panel-header p", ".empty-workspace p",
].join(", ");

export function debugEnabled(search: string): boolean {
  const flag = new URLSearchParams(search).get("debug");
  return flag === "1" || flag === "true";
}

export function reportError(source: HTMLElement, message: string): void {
  source.textContent = message;
  source.dispatchEvent(new CustomEvent("pyrpl-error", { bubbles: true, detail: message }));
}

export function installStatusBar(shell: HTMLElement, debug: boolean): void {
  const footer = document.createElement("footer");
  footer.id = "status-bar";
  footer.hidden = !debug;
  footer.setAttribute("aria-label", "Application status");
  const diagnostics = document.createElement("div");
  diagnostics.id = "debug-status";
  diagnostics.hidden = !debug;
  diagnostics.setAttribute("aria-label", "Debug information");
  const alert = document.createElement("div");
  alert.id = "application-error";
  alert.hidden = true;
  const message = document.createElement("span");
  message.setAttribute("role", "alert");
  const dismiss = document.createElement("button");
  dismiss.type = "button";
  dismiss.textContent = "Dismiss";
  dismiss.addEventListener("click", () => {
    alert.hidden = true;
    message.textContent = "";
    footer.hidden = !debug;
  });
  alert.append(message, dismiss);
  footer.append(alert, diagnostics);
  shell.append(footer);
  shell.addEventListener("pyrpl-error", event => {
    message.textContent = (event as CustomEvent<string>).detail;
    alert.hidden = false;
    footer.hidden = false;
  });

  // No diagnostic observer or repaint work in normal operation.
  if (!debug) return;
  let scheduled = false;
  const render = () => {
    scheduled = false;
    const items: HTMLElement[] = [];
    for (const source of shell.querySelectorAll<HTMLElement>(DIAGNOSTIC_SOURCES)) {
      const panel = source.closest<HTMLElement>(".workspace-panel");
      if (panel?.hidden || source.closest<HTMLElement>(".empty-workspace")?.hidden) continue;
      const text = source.textContent?.trim();
      if (!text) continue;
      const item = document.createElement("span");
      item.dataset.source = source.id || source.className || "description";
      const label = panel?.querySelector("h2")?.textContent;
      item.textContent = label ? `${label}: ${text}` : text;
      items.push(item);
    }
    diagnostics.replaceChildren(...items);
  };
  const observer = new MutationObserver(() => {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(render);
  });
  for (const child of shell.children) {
    if (child !== footer) observer.observe(child, {
      subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ["hidden"],
    });
  }
  render();
}
