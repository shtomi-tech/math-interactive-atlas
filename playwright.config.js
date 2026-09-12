import { defineConfig } from "@playwright/test";

const serverCommand = process.platform === "win32"
  ? "py -m http.server 4173"
  : "python3 -m http.server 4173";
const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:4173";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  use: {
    baseURL,
    locale: "ja-JP",
    trace: "retain-on-failure"
  },
  ...(process.env.PLAYWRIGHT_BASE_URL ? {} : {
    webServer: {
      command: serverCommand,
      url: "http://127.0.0.1:4173/atlas.html",
      reuseExistingServer: true,
      timeout: 120_000
    }
  })
});
