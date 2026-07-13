import { expect, test, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";

const defaultWorkspace = {
  activePanelId: "scope",
  layoutMode: "tabs",
  workspaceSplitSizes: [50, 50],
  panels: {
    scope: { enabled: true, splitSizes: [28, 72] },
    asg: { enabled: false },
    pid: { enabled: false },
    iq: { enabled: false },
    iir: { enabled: false },
    trig: { enabled: false },
    pwm: { enabled: false },
    spectrumanalyzer: { enabled: false, splitSizes: [35, 65] },
    networkanalyzer: { enabled: false, splitSizes: [34, 66] },
    curveviewer: { enabled: false },
    lockbox: { enabled: false },
    housekeeping: { enabled: false },
    telemetry: { enabled: false },
    registers: { enabled: false },
  },
};

async function setModuleAttribute(page: Page, module: string, attribute: string, value: unknown): Promise<void> {
  const response = await page.request.post(`/api/modules/${module}/attributes/${attribute}`, { data: { value } });
  expect(response.ok()).toBe(true);
}

async function resetServerConfig(page: Page): Promise<void> {
  await page.request.post("/api/modules/scope/actions/stop");
  await page.request.post("/api/modules/spectrumanalyzer/actions/stop");
  await page.request.post("/api/modules/networkanalyzer/actions/stop");
  await page.request.post("/api/lockbox/actions/unlock");
  await page.request.post("/api/workspace", { data: { workspace: defaultWorkspace } });
  const curveListResponse = await page.request.get("/api/curves");
  if (curveListResponse.ok()) {
    const payload = await curveListResponse.json();
    for (const curve of payload.curves ?? []) {
      await page.request.delete(`/api/curves/${curve.pk}`);
    }
  }

  await setModuleAttribute(page, "scope", "input1", "in1");
  await setModuleAttribute(page, "scope", "input2", "in2");
  await setModuleAttribute(page, "scope", "trigger_source", "immediately");
  await setModuleAttribute(page, "scope", "run_mode", "rolling");
  await setModuleAttribute(page, "scope", "duration", 1.073741824);
  await setModuleAttribute(page, "scope", "trigger_delay", 0);
  await setModuleAttribute(page, "scope", "threshold", 0);
  await setModuleAttribute(page, "scope", "hysteresis", 0.01);
  await setModuleAttribute(page, "scope", "average", false);
  await setModuleAttribute(page, "scope", "trace_average", 1);
  await setModuleAttribute(page, "scope", "ch1_active", true);
  await setModuleAttribute(page, "scope", "ch2_active", true);

  for (const module of ["asg0", "asg1"]) {
    await setModuleAttribute(page, module, "waveform", "sin");
    await setModuleAttribute(page, module, "amplitude", module === "asg0" ? 0.8 : 0);
    await setModuleAttribute(page, module, "offset", 0);
    await setModuleAttribute(page, module, "frequency", 1000);
    await setModuleAttribute(page, module, "trigger_source", "off");
    await setModuleAttribute(page, module, "output_direct", "off");
    await setModuleAttribute(page, module, "start_phase", 0);
    await setModuleAttribute(page, module, "cycles_per_burst", 0);
  }

  await setModuleAttribute(page, "pid0", "input", "off");
  await setModuleAttribute(page, "pid0", "p", 0);
  await setModuleAttribute(page, "pid0", "i", 0);
  await setModuleAttribute(page, "iq1", "input", "off");
  await setModuleAttribute(page, "iq1", "frequency", 0);
  await setModuleAttribute(page, "iq1", "output_signal", "quadrature");
  await setModuleAttribute(page, "trig", "input", "off");
  await setModuleAttribute(page, "trig", "trigger_source", "off");
  await setModuleAttribute(page, "trig", "threshold", 0);
  await setModuleAttribute(page, "pwm0", "input", "off");
  await setModuleAttribute(page, "hk", "led", 0);
  await setModuleAttribute(page, "hk", "expansion_P1_output", true);
  await setModuleAttribute(page, "hk", "expansion_P1", false);
  await setModuleAttribute(page, "iir", "real_poles", "");
  await setModuleAttribute(page, "iir", "real_zeros", "");
  await setModuleAttribute(page, "iir", "complex_poles", "");
  await setModuleAttribute(page, "iir", "complex_zeros", "");
  await setModuleAttribute(page, "iir", "inputfilter", "");
  await setModuleAttribute(page, "iir", "data_curve", -1);
  await setModuleAttribute(page, "iir", "plot_data", true);
  await setModuleAttribute(page, "iir", "plot_data_times_filter", true);
  await setModuleAttribute(page, "iir", "plot_measurement", true);
  await setModuleAttribute(page, "iir", "tf_type", "final");
  await setModuleAttribute(page, "spectrumanalyzer", "trace_average", 1);
  await setModuleAttribute(page, "spectrumanalyzer", "baseband", true);
}

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

test("scope plot auto-renders a frame and zoom stays bounded", async ({ page }) => {
  const browserMessages: string[] = [];
  page.on("pageerror", (error) => browserMessages.push(error.message));
  page.on("console", (message) => browserMessages.push(message.text()));
  await page.addInitScript(() => {
    window.localStorage.clear();
  });

  await resetServerConfig(page);
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

  await expect(page.locator("#status")).toContainText(/Frame \d+/);
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
  await expect(page.locator("#scope-plot .uplot")).toBeVisible();

  const paintedPixels = await page.locator("#scope-plot canvas").first().evaluate(countPaintedPixels);
  expect(paintedPixels).toBeGreaterThan(1000);

  const initialFingerprint = await page.evaluate(() => window.pyrplScope?.getDisplayedDataFingerprint());
  expect(initialFingerprint).not.toBeNull();
  const initialSequence = await page.evaluate(() => window.pyrplScope?.getFrameSequence());
  await page.waitForFunction(
    (sequence) => {
      const next = window.pyrplScope?.getFrameSequence();
      return typeof next === "number" && typeof sequence === "number" && next > sequence + 2;
    },
    initialSequence,
  );
  const laterFingerprint = await page.evaluate(() => window.pyrplScope?.getDisplayedDataFingerprint());
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

  await page.locator("#connect-scope").click();
  await expect(page.locator("#status")).toContainText("Disconnected");
  expect(await page.evaluate(() => window.pyrplScope?.getRunningState())).toBe("stopped");
  await expect(page.locator("#connect-scope")).toHaveText("Run");

  await page.locator("#connect-scope").click();
  await expect(page.locator("#connect-scope")).toHaveText("Stop");
  expect(await page.evaluate(() => window.pyrplScope?.getRunningState())).toBe("running_continuous");

  const plot = page.locator("#scope-plot .u-over");
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
  for (let index = 0; index < 8; index += 1) {
    await page.locator("#zoom-in").click();
  }
  const deepZoomedLabels = await page.evaluate(() => window.pyrplScope?.getScopeTimeLabels() ?? []);
  expect(deepZoomedLabels.length).toBeGreaterThan(2);
  expect(new Set(deepZoomedLabels).size).toBeGreaterThan(1);
  expect(deepZoomedLabels.every((label) => label === "0 s" || label === "0 ms" || label === "0 us")).toBe(false);

  await page.waitForTimeout(700);
  const laterRange = await page.evaluate(() => window.pyrplScope?.getXRange());
  const currentZoomedRange = await page.evaluate(() => window.pyrplScope?.getXRange());
  expect(laterRange).toEqual(currentZoomedRange);

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

test("sampler and AMS panel refreshes, measures statistics, and writes DAC2", async ({ page }) => {
  await resetServerConfig(page);
  await page.goto("/");
  await page.locator(".menu-dropdown summary").click();
  await page.locator("#panel-telemetry-enabled").setChecked(true);
  await page.getByRole("button", { name: "Sampler & AMS" }).click();

  await expect(page.locator("#telemetry-panel")).toBeVisible();
  await expect(page.locator(".sampler-reading")).toHaveCount(16);
  await expect(page.locator("#sampler-status")).toContainText("refreshed");
  await expect(page.locator("#ams-dac0")).toHaveAttribute("readonly", "");
  await expect(page.locator("#ams-dac1")).toHaveAttribute("readonly", "");

  await page.locator("#sampler-stats-signal").selectOption("asg0");
  await page.locator("#sampler-stats-duration").fill("0");
  await page.locator("#sampler-stats-run").click();
  await expect(page.locator("#sampler-stats-output")).toContainText("mean");
  await expect(page.locator("#sampler-stats-output")).toContainText("n 1");

  await page.locator("#ams-dac2").fill("0.9");
  await page.locator("#ams-dac2").press("Enter");
  await expect(page.locator("#ams-status")).toContainText("DAC2 = 0.900000 V");
  const amsResponse = await page.request.get("/api/modules/ams");
  expect(amsResponse.ok()).toBe(true);
  const ams = await amsResponse.json();
  expect(ams.state.dac2).toBeCloseTo(0.9, 3);

  const overflow = await page.locator("#telemetry-panel").evaluate((panel) => ({
    horizontal: panel.scrollWidth - panel.clientWidth,
    vertical: panel.scrollHeight - panel.clientHeight,
  }));
  expect(overflow.horizontal).toBeLessThanOrEqual(1);
  expect(overflow.vertical).toBeLessThanOrEqual(1);
});

test("ASG and housekeeping panels expose migrated module controls", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.clear();
  });

  await resetServerConfig(page);
  await page.goto("/");
  await page.locator(".menu-dropdown summary").click();
  await page.locator("#panel-asg-enabled").setChecked(true);
  await page.locator(".menu-dropdown summary").click();
  await page.locator("#panel-housekeeping-enabled").setChecked(true);

  await expect(page.locator(".workspace-tab")).toContainText(["Scope", "ASG", "Housekeeping"]);

  await page.getByRole("button", { name: "ASG" }).click();
  await expect(page.locator("#asg-panel")).toBeVisible();
  await page.locator("#asg0-waveform").selectOption("square");
  await expect(page.locator("#asg0-status")).toContainText("waveform = square");
  await page.locator("#asg0-amplitude").fill("0.4");
  await page.locator("#asg0-amplitude").blur();
  await expect(page.locator("#asg0-status")).toContainText("amplitude = 0.4");
  await page.locator("#asg0-output-direct").selectOption("out1");
  await expect(page.locator("#asg0-status")).toContainText("output_direct = out1");
  await page.locator("#asg0-setup").click();
  await expect(page.locator("#asg0-status")).toContainText(/setup: ok|asg0 state updated/);

  await page.getByRole("button", { name: "Housekeeping" }).click();
  await expect(page.locator("#housekeeping-panel")).toBeVisible();
  await page.locator("#hk-led").fill("85");
  await page.locator("#hk-led").blur();
  await expect(page.locator("#hk-status")).toContainText("led = 85");
  await page.locator("#hk-expansion-P1-output").setChecked(false);
  await expect(page.locator("#hk-status")).toContainText("expansion_P1_output = false");
  await page.locator("#hk-expansion-P1").setChecked(true);
  await expect(page.locator("#hk-status")).toContainText("expansion_P1 = true");
  await page.locator("#hk-refresh").click();
  await expect(page.locator("#hk-status")).toContainText("Housekeeping controls ready");
});

test("PID IQ IIR trigger and PWM panels expose migrated DSP controls", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.clear();
  });

  await resetServerConfig(page);
  const curveResponse = await page.request.post("/api/curves", {
    data: {
      x: [100, 300, 1000, 3000, 10000, 30000, 100000],
      y: [0.999, 0.989, 0.894, 0.555, 0.196, 0.0665, 0.02],
      y_imag: [-0.05, -0.148, -0.447, -0.832, -0.981, -0.998, -1.0],
      params: { name: "IIR browser reference", module: "networkanalyzer" },
    },
  });
  expect(curveResponse.ok()).toBe(true);
  const curvePk = (await curveResponse.json()).curve.pk as number;
  await page.goto("/");
  for (const panelId of ["pid", "iq", "iir", "trig", "pwm"]) {
    await page.locator(".menu-dropdown summary").click();
    await page.locator(`#panel-${panelId}-enabled`).setChecked(true);
  }

  await expect(page.locator(".workspace-tab")).toContainText(["Scope", "PID", "IQ", "IIR", "Trigger", "PWM"]);

  await page.getByRole("button", { name: "PID" }).click();
  await expect(page.locator("#pid-panel")).toBeVisible();
  await page.locator("#pid0-input").selectOption("asg0");
  await expect(page.locator("#pid0-status")).toContainText("input = asg0");
  await page.locator("#pid0-p").fill("0.5");
  await page.locator("#pid0-p").blur();
  await expect(page.locator("#pid0-status")).toContainText("p = 0.5");
  await page.locator("#pid0-i").fill("10");
  await page.locator("#pid0-i").blur();
  await expect(page.locator("#pid0-status")).toContainText("i = 10");
  await page.locator("[data-module='pid0']").getByRole("button", { name: "Setup" }).click();
  await expect(page.locator("#pid0-status")).toContainText(/setup: ok|pid0 state updated/);

  await page.getByRole("button", { name: "IQ" }).click();
  await expect(page.locator("#iq-panel")).toBeVisible();
  await page.locator("#iq1-input").selectOption("pid0");
  await expect(page.locator("#iq1-status")).toContainText("input = pid0");
  await page.locator("#iq1-frequency").fill("1000000");
  await page.locator("#iq1-frequency").blur();
  await expect(page.locator("#iq1-status")).toContainText("frequency = 1000000");
  await page.locator("#iq1-output-signal").selectOption("pfd");
  await expect(page.locator("#iq1-status")).toContainText("output_signal = pfd");
  await page.locator("[data-module='iq1']").getByRole("button", { name: "Sync" }).click();
  await expect(page.locator("#iq1-status")).toContainText(/sync: ok|iq1 state updated/);

  await page.getByRole("button", { name: "IIR" }).click();
  await expect(page.locator("#iir-panel")).toBeVisible();
  await page.locator("#iir-input").selectOption("iq0");
  await expect(page.locator("#iir-status")).toContainText("input = iq0");
  await expect(page.locator(".iir-plot")).toBeVisible();
  await page.locator("#iir-real-poles").fill("-1000");
  await page.locator("#iir-real-poles").blur();
  await expect(page.locator("#iir-status")).toContainText("real_poles = -1000");
  await expect(page.locator(".iir-marker.is-pole")).toHaveCount(2);
  const iirPlot = page.locator('[data-iir-plot="magnitude"] .u-over');
  const iirPlotBox = await iirPlot.boundingBox();
  if (!iirPlotBox) {
    throw new Error("Missing IIR plot box");
  }
  expect(iirPlotBox.width).toBeGreaterThan(500);
  expect(iirPlotBox.height).toBeGreaterThan(240);
  const initialIirRange = await page.evaluate(() => window.pyrplScope?.getIirXRange());
  const initialIirYRange = await page.evaluate(() => window.pyrplScope?.getIirMagnitudeYRange());
  expect(initialIirRange).toBeTruthy();
  expect(initialIirYRange).toBeTruthy();
  await iirPlot.hover({ position: { x: iirPlotBox.width * 0.5, y: iirPlotBox.height * 0.5 } });
  await page.mouse.wheel(0, -700);
  const zoomedIirRange = await page.evaluate(() => window.pyrplScope?.getIirXRange());
  const zoomedIirYRange = await page.evaluate(() => window.pyrplScope?.getIirMagnitudeYRange());
  expect(zoomedIirRange).toBeTruthy();
  expect(zoomedIirYRange).toBeTruthy();
  expect(zoomedIirRange!.max - zoomedIirRange!.min).toBeLessThan(initialIirRange!.max - initialIirRange!.min);
  expect(zoomedIirYRange!.max - zoomedIirYRange!.min).toBeLessThan(initialIirYRange!.max - initialIirYRange!.min);
  const zoomedIirPlotBox = await iirPlot.boundingBox();
  if (!zoomedIirPlotBox) {
    throw new Error("Missing zoomed IIR plot box");
  }
  await page.mouse.move(zoomedIirPlotBox.x + zoomedIirPlotBox.width * 0.55, zoomedIirPlotBox.y + zoomedIirPlotBox.height * 0.5);
  await page.mouse.down();
  await page.mouse.move(zoomedIirPlotBox.x + zoomedIirPlotBox.width * 0.35, zoomedIirPlotBox.y + zoomedIirPlotBox.height * 0.55, { steps: 6 });
  await page.mouse.up();
  const pannedIirRange = await page.evaluate(() => window.pyrplScope?.getIirXRange());
  expect(pannedIirRange).toBeTruthy();
  expect(pannedIirRange!.max - pannedIirRange!.min).toBeCloseTo(zoomedIirRange!.max - zoomedIirRange!.min, 6);
  expect(Math.abs(pannedIirRange!.min - zoomedIirRange!.min)).toBeGreaterThan(0.02);
  await page.locator("#iir-zoom-reset").click();
  const resetIirRange = await page.evaluate(() => window.pyrplScope?.getIirXRange());
  expect(resetIirRange).toBeTruthy();
  expect(resetIirRange!.min).toBeCloseTo(initialIirRange!.min, 6);
  expect(resetIirRange!.max).toBeCloseTo(initialIirRange!.max, 6);
  await page.waitForTimeout(1000);
  const stableIirPlotBox = await iirPlot.boundingBox();
  if (!stableIirPlotBox) {
    throw new Error("Missing stable IIR plot box");
  }
  expect(Math.abs(stableIirPlotBox.height - iirPlotBox.height)).toBeLessThan(2);
  await expect(page.locator("#iir-real-poles-count")).toHaveValue("1");
  await page.locator("#iir-real-poles-count").fill("2");
  await page.locator("#iir-real-poles-count").blur();
  await expect(page.locator("#iir-real-poles-count")).toHaveValue("2");
  await expect(page.locator(".iir-marker.is-pole")).toHaveCount(4);
  await iirPlot.click({
    position: { x: iirPlotBox.width * 0.55, y: iirPlotBox.height * 0.5 },
    modifiers: ["Shift"],
  });
  await expect(page.locator("#iir-status")).toContainText("real_zeros =");
  await expect(page.locator(".iir-marker.is-zero")).toHaveCount(2);
  await page.locator("#iir-inputfilter").fill("1000, 0, -2000");
  await page.locator("#iir-inputfilter").blur();
  await expect(page.locator("#iir-status")).toContainText("inputfilter = 1000, 0, -2000");
  await expect(page.locator("#iir-overflow")).toHaveAttribute("readonly", "");
  await page.locator("#iir-data-curve").selectOption(String(curvePk));
  await expect(page.locator("#iir-data-curve-name")).toHaveValue("IIR browser reference");
  await expect(page.locator(".iir-plot-status")).toContainText("IIR browser reference");
  const curvePlotResponse = await page.request.get("/api/modules/iir/plot?points=128");
  expect(curvePlotResponse.ok()).toBe(true);
  const curvePlot = await curvePlotResponse.json();
  expect(curvePlot.x).toHaveLength(7);
  expect(curvePlot.data_magnitude.every((value: number | null) => value !== null)).toBe(true);
  expect(curvePlot.product_magnitude.every((value: number | null) => value !== null)).toBe(true);
  await page.locator("#iir-tf-type").selectOption("continuous");
  await expect(page.locator(".iir-plot-status")).toContainText("continuous");
  await page.locator("#iir-plot-data").setChecked(false);
  const hiddenCurveResponse = await page.request.get("/api/modules/iir/plot?points=128");
  expect(hiddenCurveResponse.ok()).toBe(true);
  const hiddenCurvePlot = await hiddenCurveResponse.json();
  expect(hiddenCurvePlot.data_magnitude.every((value: number | null) => value === null)).toBe(true);
  await page.locator("[data-module='iir']").getByRole("button", { name: "Measure Transfer Function" }).click();
  await expect(page.locator("#iir-status")).toContainText(/measure_transfer_function: ok|iir state updated/);
  const measuredPlotResponse = await page.request.get("/api/modules/iir/plot?points=128");
  expect(measuredPlotResponse.ok()).toBe(true);
  const measuredPlot = await measuredPlotResponse.json();
  expect(measuredPlot.measurement_magnitude.some((value: number | null) => value !== null)).toBe(true);
  const iqStates = await Promise.all(
    ["iq0", "iq1", "iq2"].map(async (name) => (await (await page.request.get(`/api/modules/${name}`)).json()).state),
  );
  expect(iqStates.every((state) => state.owner === null)).toBe(true);
  await expect(page.locator("[data-module='iir']").getByRole("button", { name: "Unity" })).toHaveCount(0);
  await expect(page.locator("[data-module='iir']").getByRole("button", { name: "Zero" })).toHaveCount(0);

  await page.getByRole("button", { name: "Trigger" }).click();
  await expect(page.locator("#trig-panel")).toBeVisible();
  await page.locator("#trig-input").selectOption("in1");
  await expect(page.locator("#trig-status")).toContainText("input = in1");
  await page.locator("#trig-trigger-source").selectOption("pos_edge");
  await expect(page.locator("#trig-status")).toContainText("trigger_source = pos_edge");
  await page.locator("#trig-threshold").fill("0.125");
  await page.locator("#trig-threshold").blur();
  await expect(page.locator("#trig-status")).toContainText("threshold = 0.125");
  await expect(page.locator("[data-module='trig']").getByRole("button", { name: "Arm" })).toHaveCount(0);
  await page.locator("[data-module='trig']").getByRole("button", { name: "Setup" }).click();
  await expect(page.locator("#trig-status")).toContainText(/setup: ok|trig state updated/);

  await page.getByRole("button", { name: "PWM" }).click();
  await expect(page.locator("#pwm-panel")).toBeVisible();
  await page.locator("#pwm0-input").selectOption("pid0");
  await expect(page.locator("#pwm0-status")).toContainText("input = pid0");
  await page.locator("[data-module='pwm0']").getByRole("button", { name: "Setup" }).click();
  await expect(page.locator("#pwm0-status")).toContainText("setup: ok");
});

test("spectrum analyzer panel plots FFT data and owns IQ2 while active", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.clear();
  });

  await resetServerConfig(page);
  await page.goto("/");
  for (const panelId of ["iq", "spectrumanalyzer"]) {
    await page.locator(".menu-dropdown summary").click();
    await page.locator(`#panel-${panelId}-enabled`).setChecked(true);
  }

  await expect(page.locator(".workspace-tab")).toContainText(["Scope", "IQ", "Spectrum Analyzer"]);
  await page.getByRole("button", { name: "Spectrum Analyzer" }).click();
  await expect(page.locator("#spectrumanalyzer-panel")).toBeVisible();
  await expect(page.locator("#spectrumanalyzer-panel .gutter-vertical")).toBeVisible();
  const initialSpectrumControlsBox = await page.locator("#spectrum-controls-pane").boundingBox();
  const spectrumGutterBox = await page.locator("#spectrumanalyzer-panel .gutter-vertical").boundingBox();
  expect(initialSpectrumControlsBox).toBeTruthy();
  expect(spectrumGutterBox).toBeTruthy();
  if (!initialSpectrumControlsBox || !spectrumGutterBox) {
    return;
  }
  await page.mouse.move(spectrumGutterBox.x + spectrumGutterBox.width / 2, spectrumGutterBox.y + spectrumGutterBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(spectrumGutterBox.x + spectrumGutterBox.width / 2, spectrumGutterBox.y + spectrumGutterBox.height / 2 + 40, {
    steps: 6,
  });
  await page.mouse.up();
  const draggedSpectrumControlsBox = await page.locator("#spectrum-controls-pane").boundingBox();
  expect(draggedSpectrumControlsBox).toBeTruthy();
  expect(draggedSpectrumControlsBox!.height).toBeGreaterThan(initialSpectrumControlsBox.height);

  await expect(page.locator("[data-module='spectrumanalyzer']").getByRole("button", { name: "Setup" })).toHaveCount(0);
  await expect(page.locator("[data-module='spectrumanalyzer']").getByRole("button", { name: "Release" })).toHaveCount(0);
  await expect(page.locator("#spectrumanalyzer-input")).toBeHidden();
  await expect(page.locator("#spectrumanalyzer-center")).toBeHidden();
  await expect(page.locator("#spectrumanalyzer-input1-baseband")).toBeVisible();
  const spanBoxBeforeModeSwitch = await page.locator("#spectrumanalyzer-span").boundingBox();
  await page.locator("#spectrumanalyzer-baseband").setChecked(false);
  await expect(page.locator("#spectrumanalyzer-input")).toBeVisible();
  await expect(page.locator("#spectrumanalyzer-input1-baseband")).toBeHidden();
  const spanBoxAfterModeSwitch = await page.locator("#spectrumanalyzer-span").boundingBox();
  expect(spanBoxBeforeModeSwitch).toBeTruthy();
  expect(spanBoxAfterModeSwitch).toBeTruthy();
  expect(Math.abs(spanBoxAfterModeSwitch!.x - spanBoxBeforeModeSwitch!.x)).toBeLessThan(12);
  await page.locator("#spectrumanalyzer-baseband").setChecked(true);
  await expect(page.locator("#spectrumanalyzer-input")).toBeHidden();
  await page.locator("#spectrumanalyzer-trace-average").fill("4");
  await page.locator("#spectrumanalyzer-trace-average").blur();
  await expect(page.locator("#spectrumanalyzer-status")).toContainText("trace_average = 4");
  await expect(page.locator("#connect-scope")).toHaveText("Stop");
  await page.locator("#spectrum-run").click();
  await expect(page.locator("#spectrum-run")).toHaveText("Stop");
  await expect(page.locator("#connect-scope")).toHaveText("Run");
  await expect(page.locator("#status")).toContainText("Spectrum owns the scope resource");
  await expect(page.locator("#spectrum-status")).toContainText(/Spectrum frame|Spectrum stream connected/);
  await expect.poll(() => page.evaluate(() => window.pyrplScope?.getSpectrumSeriesCount())).toBeGreaterThan(0);
  await expect.poll(() => page.evaluate(() => window.pyrplScope?.getSpectrumAverageCount())).toBe(4);
  const paintedPixels = await page.locator("#spectrum-plot canvas").first().evaluate(countPaintedPixels);
  expect(paintedPixels).toBeGreaterThan(1000);

  const initialRange = await page.evaluate(() => window.pyrplScope?.getSpectrumXRange());
  const initialYRange = await page.evaluate(() => window.pyrplScope?.getSpectrumYRange());
  expect(initialRange).toBeTruthy();
  expect(initialYRange).toBeTruthy();
  await page.locator("#spectrum-zoom-in").click();
  const zoomedRange = await page.evaluate(() => window.pyrplScope?.getSpectrumXRange());
  expect(zoomedRange!.max - zoomedRange!.min).toBeLessThan(initialRange!.max - initialRange!.min);
  await page.locator("#spectrum-zoom-y-in").click();
  const zoomedYRange = await page.evaluate(() => window.pyrplScope?.getSpectrumYRange());
  expect(zoomedYRange!.max - zoomedYRange!.min).toBeLessThan(initialYRange!.max - initialYRange!.min);

  const plot = page.locator("#spectrum-plot .u-over");
  const box = await plot.boundingBox();
  expect(box).toBeTruthy();
  if (!box) {
    return;
  }
  await page.mouse.move(box.x + box.width * 0.55, box.y + box.height * 0.5);
  await page.mouse.down({ button: "left" });
  await page.mouse.move(box.x + box.width * 0.2, box.y + box.height * 0.5, { steps: 8 });
  await page.mouse.up();
  const pannedRange = await page.evaluate(() => window.pyrplScope?.getSpectrumXRange());
  expect(pannedRange!.max - pannedRange!.min).toBeCloseTo(zoomedRange!.max - zoomedRange!.min, 6);
  expect(pannedRange!.min).toBeGreaterThan(zoomedRange!.min);

  const downloadPromise = page.waitForEvent("download");
  await page.locator("#spectrum-save-curve").click();
  const download = await downloadPromise;
  const csvPath = await download.path();
  expect(csvPath).toBeTruthy();
  const csv = readFileSync(csvPath!, "utf8");
  expect(csv.split("\n")[0]).toContain("frequency");
  const savedSpectrumList = await (await page.request.get("/api/curves")).json();
  expect(savedSpectrumList.curves.length).toBeGreaterThan(0);
  const savedSpectrum = await (
    await page.request.get(`/api/curves/${savedSpectrumList.curves[0].pk}`)
  ).json();
  expect(savedSpectrum.curve.params.curve_unit).toBe("Vpk^2");
  expect(Math.min(...savedSpectrum.curve.y)).toBeGreaterThanOrEqual(0);

  await page.getByRole("button", { name: "IQ" }).click();
  await expect(page.locator("#iq-panel")).toBeVisible();
  await expect(page.locator("#iq2-frequency")).toBeDisabled();
  await expect(page.locator("[data-module='iq2']")).toHaveClass(/is-owned/);

  await page.getByRole("button", { name: "Scope" }).click();
  await page.locator("#connect-scope").click();
  await expect(page.locator("#connect-scope")).toHaveText("Stop");
  expect(await page.evaluate(() => window.pyrplScope?.getRunningState())).toBe("running_continuous");

  await page.getByRole("button", { name: "IQ" }).click();
  await expect(page.locator("#iq2-frequency")).toBeEnabled();

  await page.getByRole("button", { name: "Spectrum Analyzer" }).click();
  await expect(page.locator("#spectrumanalyzer-panel")).toBeVisible();
  await page.locator("#spectrum-run").click();
  await expect(page.locator("#spectrum-run")).toHaveText("Stop");
  await expect(page.locator("#connect-scope")).toHaveText("Run");
  await page.locator("#spectrum-run").click();
  await expect(page.locator("#spectrum-run")).toHaveText("Run");
  await page.getByRole("button", { name: "IQ" }).click();
  await expect(page.locator("#iq2-frequency")).toBeEnabled();
});

test("network analyzer streams a complete sweep and releases its IQ", async ({ page }) => {
  await resetServerConfig(page);
  await setModuleAttribute(page, "networkanalyzer", "points", 32);
  await setModuleAttribute(page, "networkanalyzer", "trace_average", 1);
  await page.goto("/");

  await page.locator(".menu-dropdown summary").click();
  await page.locator("#panel-iq-enabled").setChecked(true);
  await page.locator(".menu-dropdown summary").click();
  await page.locator("#panel-networkanalyzer-enabled").setChecked(true);
  await page.getByRole("button", { name: "Network Analyzer", exact: true }).click();
  await expect(page.locator("#networkanalyzer-panel")).toBeVisible();
  await expect(page.locator("#networkanalyzer-panel > .network-content > .gutter-vertical")).toBeVisible();
  await expect(page.locator("#networkanalyzer-start-freq")).toBeVisible();

  const frameBefore = await page.locator(".network-plot-frame").first().boundingBox();
  expect(frameBefore?.width ?? 0).toBeGreaterThan(400);
  expect(frameBefore?.height ?? 0).toBeGreaterThan(100);
  await page.locator("#network-single").click();
  await expect(page.locator("#network-status")).toContainText("32/32", { timeout: 10000 });
  await expect.poll(async () => {
    const response = await page.request.get("/api/modules/iq2");
    const payload = await response.json();
    return payload.state?.owner ?? null;
  }).toBeNull();
  await page.getByRole("button", { name: "IQ", exact: true }).click();
  await expect(page.locator("#iq2-frequency")).toBeEnabled();
  await expect(page.locator("[data-module='iq2']")).not.toHaveClass(/is-owned/);
  await page.getByRole("button", { name: "Network Analyzer", exact: true }).click();

  const canvases = page.locator("#networkanalyzer-panel canvas");
  await expect(canvases).toHaveCount(2);
  await expect.poll(() => canvases.first().evaluate(countPaintedPixels)).toBeGreaterThan(1000);
  await page.waitForTimeout(300);
  const frameAfter = await page.locator(".network-plot-frame").first().boundingBox();
  expect(Math.abs((frameAfter?.height ?? 0) - (frameBefore?.height ?? 0))).toBeLessThan(2);
});

test("curve viewer persists PyRPL curves and edits complex curve parameters", async ({ page }) => {
  await resetServerConfig(page);
  await page.goto("/");
  await expect(page.locator("#status")).toContainText(/Frame \d+/);

  const scopeDownload = page.waitForEvent("download");
  await page.locator("#save-curve").click();
  await scopeDownload;
  await expect(page.locator("#module-status")).toContainText("saved 2 curves");

  const complexResponse = await page.request.post("/api/curves", {
    data: {
      x: [1, 10, 100, 1000],
      y: [1, 0.8, 0.4, 0.1],
      y_imag: [0, -0.2, -0.3, -0.1],
      params: { name: "complex test", module: "networkanalyzer" },
    },
  });
  expect(complexResponse.ok()).toBe(true);

  await page.locator(".menu-dropdown summary").click();
  await page.locator("#panel-curveviewer-enabled").setChecked(true);
  await page.getByRole("button", { name: "Curve Viewer", exact: true }).click();
  await expect(page.locator("#curveviewer-panel")).toBeVisible();
  await expect(page.locator("#curveviewer-panel > .curve-viewer-content > .gutter-horizontal")).toHaveCount(2);
  await page.locator("#curve-viewer-refresh").click();
  await expect(page.locator("#curve-viewer-select option")).toHaveCount(3);
  await expect(page.locator("#curve-viewer-name")).toHaveValue("complex test");
  await expect(page.locator("#curve-viewer-phase")).toBeVisible();
  await expect.poll(() => page.locator("#curve-viewer-magnitude canvas").evaluate(countPaintedPixels)).toBeGreaterThan(1000);

  await page.locator("#curve-viewer-params").fill("name: edited complex\nmodule: networkanalyzer\nnote: browser test\n");
  await page.locator("#curve-viewer-save-params").click();
  await expect(page.locator("#curve-viewer-name")).toHaveValue("edited complex");
  await expect(page.locator("#curve-viewer-select option").first()).toContainText("edited complex");

  await page.locator("#curve-viewer-delete").click();
  await expect(page.locator("#curve-viewer-select option")).toHaveCount(2);
  await expect(page.locator("#curve-viewer-status")).toContainText("deleted");
});

test("lockbox panel switches classes, edits stages, and renders static plots", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.clear();
  });

  await resetServerConfig(page);
  await page.goto("/");
  await page.locator(".menu-dropdown summary").click();
  await page.locator("#panel-lockbox-enabled").setChecked(true);
  await page.getByRole("button", { name: "Lockbox" }).click();

  await expect(page.locator("#lockbox-panel")).toBeVisible();
  await expect(page.locator("#lockbox-status")).toContainText("Linear");
  const actionBoxes = await page.locator("#lockbox-actions button").evaluateAll((buttons) =>
    buttons.map((button) => button.getBoundingClientRect().top),
  );
  expect(new Set(actionBoxes.map((top) => Math.round(top))).size).toBe(1);
  expect(await page.evaluate(() => window.pyrplScope?.getLockboxClassname())).toBe("Linear");
  await expect(page.locator("#lockbox-input-plot .uplot")).toBeVisible();
  await expect(page.locator("#lockbox-output-plot .uplot")).toBeVisible();
  expect(await page.locator("#lockbox-input-plot canvas").first().evaluate(countPaintedPixels)).toBeGreaterThan(1000);
  expect(await page.locator("#lockbox-output-plot canvas").first().evaluate(countPaintedPixels)).toBeGreaterThan(1000);

  await page.locator("#lockbox-class").selectOption("Interferometer");
  await expect.poll(() => page.evaluate(() => window.pyrplScope?.getLockboxClassname())).toBe("Interferometer");
  await expect(page.locator("#lockbox-inputs")).toContainText("port1");
  await expect(page.locator("#lockbox-inputs")).toContainText("port2");
  await expect(page.locator("#lockbox-outputs")).toContainText("piezo");

  await page.locator("#lockbox-class").selectOption("FabryPerot");
  await expect.poll(() => page.evaluate(() => window.pyrplScope?.getLockboxClassname())).toBe("FabryPerot");
  await expect(page.locator("#lockbox-inputs")).toContainText("pdh");

  const initialStages = await page.evaluate(() => window.pyrplScope?.getLockboxStageCount());
  await page.locator("#lockbox-add-stage").click();
  await expect.poll(() => page.evaluate(() => window.pyrplScope?.getLockboxStageCount())).toBe((initialStages ?? 0) + 1);
  await page.locator("#lockbox-stages input[type='number']").first().fill("0.125");
  await page.locator("#lockbox-stages input[type='number']").first().blur();
  await expect(page.locator("#lockbox-status")).toContainText("FabryPerot");
});
