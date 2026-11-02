import { expect, test, type Page } from "@playwright/test";
import { PANEL_DEFINITIONS } from "../src/panel-registry";

const ids = PANEL_DEFINITIONS.map(panel => panel.id);
async function openPanel(page: Page, id: string, mode = "tabs", all = false) {
  const split = [id, ...ids.filter(other => other !== id).slice(0, 2)];
  let workspace = {
    activePanelId: id, layoutMode: mode === "minimum-pane" ? "split-horizontal" : mode, splitPanelIds: mode === "tabs" ? [id] : split,
    workspaceSplitSizes: mode === "tabs" ? [100] : mode === "minimum-pane" ? [18, 41, 41] : [33.33, 33.33, 33.34],
    panels: Object.fromEntries(ids.map(other => [other, {
      enabled: all || (mode === "tabs" ? other === id : split.includes(other)),
      ...(other === "scope" || other === "spectrumanalyzer" ? { splitSizes: [35, 65] } : {}),
    }])),
  };
  await page.route("**/api/workspace", async route => {
    if (route.request().method() === "POST") workspace = route.request().postDataJSON().workspace;
    await route.fulfill({ json: { workspace } });
  });
  await page.goto("/");
  await page.waitForFunction(() => document.querySelector("#lockbox-class")?.children.length);
  await expect(page.locator(`#${id}-panel`)).toBeVisible();
}

// Check reachability as well as geometry: scrollIntoView alone can hide overlapping
// cards by scrolling a clipped ancestor programmatically, so examine both.
async function layoutProblems(page: Page, id: string) {
  return page.locator(`#${id}-panel`).evaluate(panel => {
    const problems: string[] = [];
    const controls = [...panel.querySelectorAll<HTMLElement>("button,input,select,textarea")].filter(el => {
      const b = el.getBoundingClientRect(), s = getComputedStyle(el);
      return b.width && b.height && s.visibility !== "hidden" && s.display !== "none";
    });
    for (const el of controls) {
      const name = el.id || el.textContent?.trim() || el.tagName;
      const b = el.getBoundingClientRect();
      let scrollX = false, scrollY = false;
      for (let parent = el.parentElement; parent; parent = parent.parentElement) {
        const p = parent.getBoundingClientRect(), s = getComputedStyle(parent);
        if (["hidden", "clip"].includes(s.overflowX) && !scrollX && (b.left < p.left - 2 || b.right > p.right + 2)) problems.push(`${name}: clipped horizontally`);
        if (["hidden", "clip"].includes(s.overflowY) && !scrollY && (b.top < p.top - 2 || b.bottom > p.bottom + 2)) problems.push(`${name}: clipped vertically`);
        scrollX ||= ["auto", "scroll"].includes(s.overflowX) && parent.clientWidth > 0 && parent.scrollWidth > parent.clientWidth;
        scrollY ||= ["auto", "scroll"].includes(s.overflowY) && parent.clientHeight > 0 && parent.scrollHeight > parent.clientHeight;
      }
      if (el instanceof HTMLSelectElement && el.size <= 1 && b.width < 100) problems.push(`${name}: unreadable selector width ${b.width}`);
      if (el.matches(":disabled")) continue;
      el.scrollIntoView({ block: "center", inline: "nearest", behavior: "instant" });
      const target = el.getBoundingClientRect();
      const hit = document.elementFromPoint(target.x + target.width / 2, target.y + Math.min(target.height / 2, 14));
      if (hit !== el && !el.contains(hit)) problems.push(`${name}: covered by ${hit?.id || hit?.className || "viewport"}`);
    }
    return [...new Set(problems)];
  });
}

for (const [width, height, mode] of [
  [1280, 720, "tabs"], [900, 600, "tabs"], [800, 500, "tabs"], [1280, 420, "tabs"],
  [681, 768, "tabs"], [680, 768, "tabs"], [390, 844, "tabs"], [320, 700, "tabs"],
  [1280, 800, "minimum-pane"], [1280, 800, "split-horizontal"], [1280, 800, "split-vertical"],
] as const) {
  test(`all panels remain reachable at ${width}x${height} ${mode}`, async ({ browser }) => {
    test.setTimeout(120_000);
    for (const id of ids.filter(id => !process.env.PYRPL_TEST_PANEL || id === process.env.PYRPL_TEST_PANEL)) {
      const context = await browser.newContext({ viewport: { width, height } });
      const page = await context.newPage();
      try {
        await openPanel(page, id, mode);
        expect(await layoutProblems(page, id), id).toEqual([]);
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width + 2);
      } finally { await context.close(); }
    }
  });
}

test("short-window menu scrolls and tab titles retain one line", async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 420 });
  await openPanel(page, "scope", "tabs", true);
  await page.locator(".menu-dropdown summary").click();
  const menu = page.locator("#panel-menu");
  expect(await menu.evaluate(el => el.getBoundingClientRect().bottom)).toBeLessThanOrEqual(420);
  await menu.hover();
  await page.mouse.wheel(0, 1000);
  await expect.poll(() => menu.evaluate(el => el.scrollTop)).toBeGreaterThan(0);
  for (const tab of await page.locator(".workspace-tab").all()) {
    expect(await tab.evaluate(el => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
  }
});

test("Spectrum splitter is keyboard operable and persists its size", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await openPanel(page, "spectrumanalyzer");
  const controls = page.locator("#spectrum-controls-pane");
  const separator = page.locator("#spectrumanalyzer-panel [role=separator]");
  const initial = (await controls.boundingBox())!.height;
  await separator.focus();
  await page.keyboard.press("Shift+ArrowDown");
  const adjusted = (await controls.boundingBox())!.height;
  expect(adjusted).toBeGreaterThan(initial + 10);
  await page.reload();
  await expect(page.locator("#spectrumanalyzer-panel")).toBeVisible();
  await expect.poll(async () => Math.abs((await controls.boundingBox())!.height - adjusted)).toBeLessThan(2);
});

test("mobile Lockbox grows to contain all sections and keeps chrome compact", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openPanel(page, "lockbox");
  expect((await page.locator(".topbar").boundingBox())!.height).toBeLessThan(70);
  expect((await page.locator(".lockbox-grid").boundingBox())!.height).toBeGreaterThan(500);
  await page.locator("#lockbox-add-stage").scrollIntoViewIfNeeded();
  await expect(page.locator("#lockbox-add-stage")).toBeInViewport();
});

test("chart titles, canvases and legends fit after shrinking and growing", async ({ browser }) => {
  test.setTimeout(60_000);
  for (const id of ["iir", "networkanalyzer", "curveviewer", "lockbox"]) {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();
    try {
      await openPanel(page, id);
      for (const width of [1280, 390, 1280]) {
        await page.setViewportSize({ width, height: 900 });
        if (id === "networkanalyzer") {
          await expect.poll(() => page.locator(".network-plot-frame").first().evaluate(el => el.getBoundingClientRect().height)).toBeGreaterThanOrEqual(220);
        }
        await expect.poll(() => page.locator(`#${id}-panel .uplot`).evaluateAll(plots => plots.flatMap(plot => {
          const frame = plot.closest(".iir-plot-frame,.network-plot-frame,.curve-viewer-plot-frame,.lockbox-output-plot-frame,.lockbox-plot");
          const bounds = frame?.getBoundingClientRect();
          if (!bounds?.width || !bounds.height) return [];
          const canvas = plot.querySelector("canvas")?.getBoundingClientRect();
          const root = plot.getBoundingClientRect();
          return canvas && (canvas.right > bounds.right + 2 || canvas.bottom > bounds.bottom + 2 || root.bottom > bounds.bottom + 2)
            ? [plot.textContent?.slice(0, 40)] : [];
        })), id).toEqual([]);
      }
    } finally { await context.close(); }
  }
});

test("long errors wrap in the footer without hiding Dismiss", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 700 });
  await openPanel(page, "scope");
  await page.locator(".shell").evaluate(shell => shell.dispatchEvent(new CustomEvent("pyrpl-error", {
    bubbles: true, detail: "ConnectionError_".repeat(50),
  })));
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await page.getByRole("button", { name: "Dismiss", exact: true }).click();
  await expect(page.locator("#status-bar")).toBeHidden();
});
