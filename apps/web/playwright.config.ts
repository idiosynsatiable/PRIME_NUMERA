import { readFileSync } from "node:fs";
const localBrowser = process.env.NUMERA_BROWSER_CONFIG
  ? JSON.parse(readFileSync(process.env.NUMERA_BROWSER_CONFIG, "utf8"))
  : null;
import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL: "http://127.0.0.1:4173",
    headless: true,
    launchOptions: localBrowser
      ? { executablePath: localBrowser.path, args: localBrowser.args }
      : undefined,
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm start",
    cwd: "../..",
    url: "http://127.0.0.1:4173/health",
    reuseExistingServer: false,
    env: {
      APP_ORIGIN: "http://127.0.0.1:4173",
      DATA_DIRECTORY: ".numera-e2e",
      PORT: "4173",
    },
  },
  reporter: [["list"], ["html", { open: "never" }]],
});
