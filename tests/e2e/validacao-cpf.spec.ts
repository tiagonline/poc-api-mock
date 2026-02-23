import { expect, test } from '@playwright/test';
import { allure } from 'allure-playwright';

test.describe('Jornada do Usuário - Frontend', () => {

  test.beforeEach(async () => {
    // 🎨 MÁGICA DO ALLURE: Preenchendo Suítes e Funcionalidades
    allure.epic('Frontend Web');
    allure.feature('Tela de Consulta de CPF');
    allure.suite('Testes de UI');
  });

  test('deve acessar a aplicação frontend', async ({ page }) => {
    allure.story('Renderização da Home Page');
    allure.tags('E2E', 'UI', 'Sanity');

    let response;
    try {
      response = await page.goto('/');
    } catch {
      test.skip(true, 'Frontend não está disponível em FRONTEND_URL. Suba a aplicação para executar o E2E.');
    }

    expect(response).not.toBeNull();
    expect(response?.ok()).toBeTruthy();
  });
});