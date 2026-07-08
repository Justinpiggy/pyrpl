import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./test",
  testMatch: "**/*.spec.ts",
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
      "python -m pyrpl_websocket --hostname _FAKE_ --bind-host 127.0.0.1 --bind-port 8765 --scope-interval 0.2",
    cwd: "..",
    url: "http://127.0.0.1:8765",
    reuseExistingServer: false,
    timeout: 15_000,
  },
});
