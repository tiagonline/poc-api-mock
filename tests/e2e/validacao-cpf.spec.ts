import { expect, test } from '@playwright/test';

test('deve acessar a aplicação frontend', async ({ page }) => {
  let response;

  try {
    response = await page.goto('/');
  } catch {
    test.skip(true, 'Frontend não está disponível em FRONTEND_URL. Suba a aplicação para executar o E2E.');
  }

  expect(response).not.toBeNull();
  expect(response?.ok()).toBeTruthy();
});