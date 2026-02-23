import { defineConfig } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";

// 1. Tenta carregar o arquivo .env oficial da máquina local
dotenv.config({ path: path.resolve(__dirname, 'envs', '.env') });

// 2. Se não achar o .env (como no CI/CD), usa o .env.example como fallback de segurança
dotenv.config({ path: path.resolve(__dirname, 'envs', '.env.example'), override: false });

const apiBaseUrl = process.env.API_GOVERNO_URL ?? "http://127.0.0.1:8081";
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