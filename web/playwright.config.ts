import { defineConfig, devices } from "@playwright/test";
import { fileURLToPath } from "node:url";

export default defineConfig({
  testDir: "./test",
  testMatch: "**/*.spec.ts",
  // Instrument tests share one fake backend and change its acquisition state.
  workers: 1,
  timeout: 30_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: "http://127.0.0.1:8765",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command:
      "python -m pyrpl_websocket --hostname _FAKE_ --bind-host 127.0.0.1 --bind-port 8765 --scope-interval 0.2 --control-policy shared",
    cwd: "..",
    env: {
      PYRPL_USER_DIR: fileURLToPath(new URL("../.cache/web-e2e-user/", import.meta.url)),
    },
    url: "http://127.0.0.1:8765",
    reuseExistingServer: false,
    timeout: 15_000,
  },
});
