import { expect, test, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";

async function countPaintedPixels(canvas: HTMLCanvasElement): Promise<number> {
  const context = canvas.getContext("2d");
  if (!context) {
    return 0;
  }
  const image = context.getImageData(0, 0, canvas.width, canvas.height);
  let painted = 0;
  for (let index = 3; index < image.data.length; index += 4) {
    if (image.data[index] !== 0) {
      painted += 1;
    }
  }
  return painted;
}

async function canvasFingerprint(canvas: HTMLCanvasElement): Promise<number> {
  const context = canvas.getContext("2d");
  if (!context) {
    return 0;
  }
  const image = context.getImageData(0, 0, canvas.width, canvas.height);
  let hash = 2166136261;
  for (let index = 0; index < image.data.length; index += 4) {
    hash ^= image.data[index];
    hash = Math.imul(hash, 16777619);
    hash ^= image.data[index + 1];
    hash = Math.imul(hash, 16777619);
    hash ^= image.data[index + 2];
    hash = Math.imul(hash, 16777619);
    hash ^= image.data[index + 3];
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

async function plotFingerprint(page: Page): Promise<number> {
  return page.locator("#scope-plot canvas").evaluateAll((canvases) => {
    let combined = 2166136261;
    for (const canvas of canvases) {
      const context = canvas.getContext("2d");
      if (!context) {
        continue;
      }
      const image = context.getImageData(0, 0, canvas.width, canvas.height);
      for (let index = 0; index < image.data.length; index += 4) {
        combined ^= image.data[index];
        combined = Math.imul(combined, 16777619);
        combined ^= image.data[index + 1];
        combined = Math.imul(combined, 16777619);
        combined ^= image.data[index + 2];
        combined = Math.imul(combined, 16777619);
        combined ^= image.data[index + 3];
        combined = Math.imul(combined, 16777619);
      }
    }
    return combined >>> 0;
  });
}

test("scope plot auto-renders a frame and zoom stays bounded", async ({ page }) => {
  const browserMessages: string[] = [];
  page.on("pageerror", (error) => browserMessages.push(error.message));
  page.on("console", (message) => browserMessages.push(message.text()));
  await page.addInitScript(() => {
    window.localStorage.clear();
  });

  await page.goto("/");
  await expect(page.locator("#scope-panel")).toBeVisible();
  await expect(page.locator("#empty-workspace")).toBeHidden();
  expect(await page.evaluate(() => window.pyrplScope?.isPanelEnabled("scope"))).toBe(true);

  await page.locator(".menu-dropdown summary").click();
  await page.locator("#panel-scope-enabled").setChecked(false);
  await expect(page.locator("#scope-panel")).toBeHidden();
  await expect(page.locator("#empty-workspace")).toBeVisible();
  expect(await page.evaluate(() => window.pyrplScope?.isPanelEnabled("scope"))).toBe(false);
  await expect(page.locator("#connect-scope")).toHaveText("Run");

  await page.locator(".menu-dropdown summary").click();
  await page.locator("#panel-scope-enabled").setChecked(true);
  await expect(page.locator("#scope-panel")).toBeVisible();
  await expect(page.locator("#empty-workspace")).toBeHidden();
  expect(await page.evaluate(() => window.pyrplScope?.isPanelEnabled("scope"))).toBe(true);
  expect(await page.evaluate(() => window.pyrplScope?.getActivePanelId())).toBe("scope");

  await page.locator(".menu-dropdown summary").click();
  await page.locator("#panel-registers-enabled").setChecked(true);
  expect(await page.evaluate(() => window.pyrplScope?.isPanelEnabled("registers"))).toBe(true);
  await expect(page.locator(".workspace-tab")).toHaveText(["Scope", "Register Debug"]);
  await page.getByRole("button", { name: "Register Debug" }).click();
  await expect(page.locator("#registers-panel")).toBeVisible();
  await expect(page.locator("#scope-panel")).toBeHidden();
  expect(await page.evaluate(() => window.pyrplScope?.getActivePanelId())).toBe("registers");
  await page.locator("#register-read-addr").fill("0x40100014");
  await page.locator("#register-read-length").fill("1");
  await page.locator("#register-read").click();
  await expect(page.locator("#register-status")).toContainText("read 1 word");
  await expect(page.locator("#register-output")).toHaveValue(/0x40100014/);

  await page.locator(".menu-dropdown summary").click();
  await page.locator("#workspace-layout-mode").selectOption("split-horizontal");
  expect(await page.evaluate(() => window.pyrplScope?.getWorkspaceLayoutMode())).toBe("split-horizontal");
  await expect(page.locator("#scope-panel")).toBeVisible();
  await expect(page.locator("#registers-panel")).toBeVisible();
  const initialWorkspaceSplitSizes = await page.evaluate(() => window.pyrplScope?.getWorkspaceSplitSizes());
  expect(initialWorkspaceSplitSizes).toEqual([50, 50]);
  const workspaceGutterBox = await page.locator("#workspace-panels > .gutter-horizontal").boundingBox();
  expect(workspaceGutterBox).toBeTruthy();
  if (!workspaceGutterBox) {
    return;
  }
  const workspaceHandleBox = await page.locator("#workspace-panels > .gutter-horizontal").evaluate((element) => {
    const gutter = element.getBoundingClientRect();
    const marker = window.getComputedStyle(element, "::before");
    const markerHeight = Number.parseFloat(marker.height);
    return {
      gutterHeight: gutter.height,
      markerHeight,
      expectedTop: (gutter.height - markerHeight) / 2,
    };
  });
  expect(workspaceHandleBox.expectedTop).toBeGreaterThan(40);
  expect(workspaceHandleBox.expectedTop).toBeLessThan(workspaceHandleBox.gutterHeight / 2);
  await page.mouse.move(workspaceGutterBox.x + workspaceGutterBox.width / 2, workspaceGutterBox.y + workspaceGutterBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(workspaceGutterBox.x + workspaceGutterBox.width / 2 + 80, workspaceGutterBox.y + workspaceGutterBox.height / 2, {
    steps: 8,
  });
  await page.mouse.up();
  const draggedWorkspaceSplitSizes = await page.evaluate(() => window.pyrplScope?.getWorkspaceSplitSizes());
  expect(draggedWorkspaceSplitSizes).toBeTruthy();
  expect(draggedWorkspaceSplitSizes![0]).toBeGreaterThan(initialWorkspaceSplitSizes![0]);
  expect(draggedWorkspaceSplitSizes![1]).toBeLessThan(initialWorkspaceSplitSizes![1]);

  await page.locator("#workspace-layout-mode").selectOption("tabs");
  expect(await page.evaluate(() => window.pyrplScope?.getWorkspaceLayoutMode())).toBe("tabs");
  await page.locator(".menu-dropdown summary").click();
  await page.getByRole("button", { name: "Scope" }).click();
  await expect(page.locator("#scope-panel")).toBeVisible();
  await expect(page.locator("#registers-panel")).toBeHidden();
  expect(await page.evaluate(() => window.pyrplScope?.getActivePanelId())).toBe("scope");

  await expect(page.locator("#status")).toContainText("Frame 0");
  await expect(page.locator(".gutter-vertical")).toBeVisible();
  const initialSplitSizes = await page.evaluate(() => window.pyrplScope?.getScopeSplitSizes());
  expect(initialSplitSizes).toEqual([28, 72]);
  const gutterBox = await page.locator(".gutter-vertical").boundingBox();
  expect(gutterBox).toBeTruthy();
  if (!gutterBox) {
    return;
  }
  await page.mouse.move(gutterBox.x + gutterBox.width / 2, gutterBox.y + gutterBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(gutterBox.x + gutterBox.width / 2, gutterBox.y + gutterBox.height / 2 + 70, { steps: 8 });
  await page.mouse.up();
  const draggedSplitSizes = await page.evaluate(() => window.pyrplScope?.getScopeSplitSizes());
  expect(draggedSplitSizes).toBeTruthy();
  expect(draggedSplitSizes![0]).toBeGreaterThan(initialSplitSizes![0]);
  expect(draggedSplitSizes![1]).toBeLessThan(initialSplitSizes![1]);

  await expect(page.locator("#sample-count")).toHaveCount(0);
  await expect(page.locator("#connect-scope")).toHaveText("Stop");
  await expect(page.locator("#status")).toContainText(/Frame [1-9]/);
  await expect(page.locator("#module-status")).toContainText("running_continuous");
  expect(await page.evaluate(() => window.pyrplScope?.getRunningState())).toBe("running_continuous");
  await expect(page.locator(".uplot")).toBeVisible();

  const paintedPixels = await page.locator("#scope-plot canvas").first().evaluate(countPaintedPixels);
  expect(paintedPixels).toBeGreaterThan(1000);

  const initialFingerprint = await plotFingerprint(page);
  const initialSequence = await page.evaluate(() => window.pyrplScope?.getFrameSequence());
  await page.waitForFunction(
    (sequence) => {
      const next = window.pyrplScope?.getFrameSequence();
      return typeof next === "number" && typeof sequence === "number" && next > sequence + 2;
    },
    initialSequence,
  );
  const laterFingerprint = await plotFingerprint(page);
  expect(laterFingerprint).not.toBe(initialFingerprint);

  const initialRange = await page.evaluate(() => window.pyrplScope?.getXRange());
  expect(initialRange).toBeTruthy();
  expect(initialRange!.min).toBe(0);
  expect(initialRange!.max - initialRange!.min).toBeCloseTo(1.073741824, 6);
  const initialYRange = await page.evaluate(() => window.pyrplScope?.getYRange());
  expect(initialYRange).toEqual({ min: -1.1, max: 1.1 });

  await page.locator("#zoom-in").click();
  const buttonZoomedRange = await page.evaluate(() => window.pyrplScope?.getXRange());
  expect(buttonZoomedRange).toBeTruthy();
  expect(buttonZoomedRange!.max - buttonZoomedRange!.min).toBeLessThan(initialRange!.max - initialRange!.min);

  await page.locator("#zoom-y-in").click();
  const buttonZoomedYRange = await page.evaluate(() => window.pyrplScope?.getYRange());
  expect(buttonZoomedYRange).toBeTruthy();
  expect(buttonZoomedYRange!.max - buttonZoomedYRange!.min).toBeLessThan(initialYRange!.max - initialYRange!.min);

  await page.locator("#pan-right").click();
  const xOffsetRange = await page.evaluate(() => window.pyrplScope?.getXRange());
  expect(xOffsetRange).toBeTruthy();
  expect(xOffsetRange!.max - xOffsetRange!.min).toBeCloseTo(
    buttonZoomedRange!.max - buttonZoomedRange!.min,
    6,
  );
  expect(xOffsetRange!.min).toBeGreaterThan(buttonZoomedRange!.min);

  await page.locator("#pan-up").click();
  const yOffsetRange = await page.evaluate(() => window.pyrplScope?.getYRange());
  expect(yOffsetRange).toBeTruthy();
  expect(yOffsetRange!.max - yOffsetRange!.min).toBeCloseTo(
    buttonZoomedYRange!.max - buttonZoomedYRange!.min,
    6,
  );
  expect(yOffsetRange!.min).toBeLessThan(buttonZoomedYRange!.min);

  await page.locator("#zoom-reset").click();
  await expect.poll(() => page.evaluate(() => window.pyrplScope?.getXRange())).toEqual(initialRange);
  await expect.poll(() => page.evaluate(() => window.pyrplScope?.getYRange())).toEqual(initialYRange);

  await page.waitForTimeout(700);
  const streamedRange = await page.evaluate(() => window.pyrplScope?.getXRange());
  const streamedYRange = await page.evaluate(() => window.pyrplScope?.getYRange());
  expect(streamedRange).toEqual(initialRange);
  expect(streamedYRange).toEqual(initialYRange);

  await page.locator("#pause-scope").click();
  await expect(page.locator("#status")).toContainText("Paused");
  expect(await page.evaluate(() => window.pyrplScope?.getRunningState())).toBe("paused_continuous");
  await expect(page.locator("#connect-scope")).toHaveText("Run");

  await page.locator("#connect-scope").click();
  await expect(page.locator("#connect-scope")).toHaveText("Stop");
  expect(await page.evaluate(() => window.pyrplScope?.getRunningState())).toBe("running_continuous");

  const plot = page.locator(".u-over");
  const box = await plot.boundingBox();
  expect(box).toBeTruthy();
  if (!box) {
    return;
  }

  await page.locator("#zoom-in").click();
  const beforeDragPan = await page.evaluate(() => window.pyrplScope?.getXRange());
  expect(beforeDragPan).toBeTruthy();

  await page.mouse.move(box.x + box.width * 0.55, box.y + box.height * 0.5);
  await page.mouse.down({ button: "left" });
  await page.mouse.move(box.x + box.width * 0.2, box.y + box.height * 0.5, { steps: 8 });
  await page.mouse.up();

  const dragPannedRange = await page.evaluate(() => window.pyrplScope?.getXRange());
  expect(dragPannedRange).toBeTruthy();
  expect(dragPannedRange!.max - dragPannedRange!.min).toBeCloseTo(
    beforeDragPan!.max - beforeDragPan!.min,
    6,
  );
  expect(dragPannedRange!.min).toBeGreaterThan(beforeDragPan!.min);

  const beforeRightZoom = dragPannedRange;
  await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.5);
  await page.mouse.down({ button: "right" });
  await page.mouse.move(box.x + box.width * 0.72, box.y + box.height * 0.34, { steps: 8 });
  await page.mouse.up({ button: "right" });

  const zoomedRange = await page.evaluate(() => window.pyrplScope?.getXRange());
  const zoomedYRange = await page.evaluate(() => window.pyrplScope?.getYRange());
  expect(zoomedRange).toBeTruthy();
  expect(zoomedYRange).toBeTruthy();
  expect(zoomedRange!.max - zoomedRange!.min).toBeLessThan(beforeRightZoom!.max - beforeRightZoom!.min);
  expect(zoomedYRange!.max - zoomedYRange!.min).toBeLessThan(initialYRange!.max - initialYRange!.min);

  await page.waitForTimeout(700);
  const laterRange = await page.evaluate(() => window.pyrplScope?.getXRange());
  expect(laterRange).toEqual(zoomedRange);

  await page.mouse.wheel(0, -1200);
  const afterWheelRange = await page.evaluate(() => window.pyrplScope?.getXRange());
  expect(afterWheelRange).toEqual(laterRange);

  expect(await page.evaluate(() => window.pyrplScope?.getSampleCount())).toBe(16384);
  expect(await page.evaluate(() => window.pyrplScope?.getCsvLineCount())).toBe(16385);
  const downloadPromise = page.waitForEvent("download");
  await page.locator("#save-curve").click();
  const download = await downloadPromise;
  const csvPath = await download.path();
  expect(csvPath).toBeTruthy();
  const csv = readFileSync(csvPath!, "utf8");
  const csvLines = csv.trimEnd().split("\n");
  expect(csvLines[0]).toBe("time,ch1,ch2");
  expect(csvLines.length).toBe(16385);
  expect(csvLines[1].split(",").length).toBe(3);

  await page.locator("#show-ch2").setChecked(false);
  expect(await page.evaluate(() => window.pyrplScope?.isChannelVisible(2))).toBe(false);
  await page.locator("#show-ch2").setChecked(true);
  expect(await page.evaluate(() => window.pyrplScope?.isChannelVisible(2))).toBe(true);

  await page.locator("#zoom-reset").click();
  await page.locator("#show-ch2").setChecked(false);
  await page.locator("#scope-input1").selectOption("off");
  await expect(page.locator("#module-status")).toContainText("input1 = off");
  const sequenceBeforeBaseline = await page.evaluate(() => window.pyrplScope?.getFrameSequence());
  await page.waitForFunction((previousSequence) => {
    const nextSequence = window.pyrplScope?.getFrameSequence();
    return (
      typeof nextSequence === "number" &&
      typeof previousSequence === "number" &&
      nextSequence > previousSequence + 1
    );
  }, sequenceBeforeBaseline);

  const baselineStats = await page.evaluate(() => window.pyrplScope?.getDisplayedStats());
  expect(baselineStats).toBeTruthy();
  expect(Math.abs(baselineStats!.ch1Min)).toBeLessThan(0.0001);
  expect(Math.abs(baselineStats!.ch1Max)).toBeLessThan(0.0001);

  const initialEventCount = await page.evaluate(() => window.pyrplScope?.getEventCount() ?? 0);
  const sequenceBeforeInput = await page.evaluate(() => window.pyrplScope?.getFrameSequence());
  await page.locator("#scope-input1").selectOption("asg0");
  await expect(page.locator("#module-status")).toContainText("input1 = asg0");
  await page.waitForFunction((eventCount) => (window.pyrplScope?.getEventCount() ?? 0) > eventCount, initialEventCount);
  await page.waitForFunction((previousSequence) => {
    const nextSequence = window.pyrplScope?.getFrameSequence();
    return (
      typeof nextSequence === "number" &&
      typeof previousSequence === "number" &&
      nextSequence > previousSequence + 1
    );
  }, sequenceBeforeInput);
  const afterInputStats = await page.evaluate(() => window.pyrplScope?.getDisplayedStats());
  expect(afterInputStats).toBeTruthy();
  expect(afterInputStats!.ch1Max - afterInputStats!.ch1Min).toBeGreaterThan(0.75);
  const input1 = await page.evaluate(async () => {
    const response = await fetch("/api/modules/scope/attributes/input1");
    const payload = await response.json();
    return payload.value;
  });
  expect(input1).toBe("asg0");
  await page.locator("#show-ch2").setChecked(true);

  await page.locator("#scope-run-mode").selectOption("single");
  await expect(page.locator("#module-status")).toContainText("run_mode = single");

  await page.locator("#scope-duration").selectOption("0.134217728");
  await expect(page.locator("#module-status")).toContainText("duration = 134.2 ms");
  const durationRange = await page.evaluate(() => window.pyrplScope?.getXRange());
  expect(durationRange!.min).toBe(0);
  expect(durationRange!.max - durationRange!.min).toBeCloseTo(0.134217728, 6);

  await page.locator("#scope-average").setChecked(true);
  await expect(page.locator("#module-status")).toContainText("average = true");

  await page.locator("#scope-trace-average").fill("8");
  await page.locator("#scope-trace-average").blur();
  await expect(page.locator("#module-status")).toContainText("trace_average = 8");
  expect(await page.evaluate(() => window.pyrplScope?.getTraceAverage())).toBe(8);

  await page.locator("#scope-threshold").fill("0.25");
  await page.locator("#scope-threshold").blur();
  await expect(page.locator("#module-status")).toContainText("threshold = 0.25");

  await page.locator("#scope-input2").selectOption("asg0");
  await expect(page.locator("#module-status")).toContainText("input2 = asg0");
  await page.locator("#scope-trigger").selectOption("ch1_positive_edge");
  await expect(page.locator("#module-status")).toContainText("trigger_source = ch1_positive_edge");
  await page.locator("#scope-threshold").fill("0");
  await page.locator("#scope-threshold").blur();
  await page.locator("#scope-hysteresis").fill("0.01");
  await page.locator("#scope-hysteresis").blur();
  await expect(page.locator("#scope-trigger-test")).toHaveCount(0);

  await page.locator("#scope-threshold").fill("0.25");
  await page.locator("#scope-threshold").blur();
  await expect(page.locator("#module-status")).toContainText("threshold = 0.25");

  await page.locator("#scope-state-name").fill("state-a");
  await page.locator("#scope-state-save").click();
  await expect(page.locator("#module-status")).toContainText(/saved state state-a|1 saved state/);
  await expect(page.locator("#scope-state-select")).toHaveValue("state-a");

  await page.locator("#scope-threshold").fill("-0.25");
  await page.locator("#scope-threshold").blur();
  await expect(page.locator("#module-status")).toContainText("threshold = -0.25");

  await page.locator("#scope-state-name").fill("");
  await page.locator("#scope-state-select").selectOption("state-a");
  await page.locator("#scope-state-load").click();
  await expect(page.locator("#scope-threshold")).toHaveValue("0.25");
  const loadedThreshold = await page.evaluate(async () => {
    const response = await fetch("/api/modules/scope/attributes/threshold");
    const payload = await response.json();
    return payload.value;
  });
  expect(loadedThreshold).toBe(0.25);

  await page.locator("#scope-state-delete").click();
  await expect(page.locator("#scope-state-select")).toHaveValue("");
  const savedStateCount = await page.evaluate(async () => {
    const response = await fetch("/api/modules/scope/states");
    const payload = await response.json();
    return payload.states.length;
  });
  expect(savedStateCount).toBe(0);

  const firstHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  await page.waitForTimeout(1200);
  const secondHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  expect(secondHeight).toBe(firstHeight);
  expect(browserMessages.filter((message) => message.includes("ResizeObserver loop"))).toEqual([]);
});
