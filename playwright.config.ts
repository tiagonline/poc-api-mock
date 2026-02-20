import { defineConfig } from "@playwright/test";
import dotenv from "dotenv";

dotenv.config();
dotenv.config({ path: ".env.example", override: false });

const apiBaseUrl = process.env.API_GOVERNO_URL ?? "http://localhost:8080";
const frontendBaseUrl = process.env.FRONTEND_URL ?? "http://localhost:3000";

export default defineConfig({
  timeout: 30_000,
  retries: 0,
  reporter: [
    ["list"],
    ["allure-playwright", { outputFolder: "allure-results" }],
  ],
  use: {
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "api",
      testDir: "./tests/api",
      use: {
        baseURL: apiBaseUrl,
      },
    },
    {
      name: "e2e",
      testDir: "./tests/e2e",
      use: {
        baseURL: frontendBaseUrl,
        headless: true,
      },
    },
  ],
});
