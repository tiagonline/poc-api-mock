import { expect, test } from '@playwright/test';
import { allure } from 'allure-playwright';

// importa a função de request com healing
import { requestWithHealing } from '../utils/api-client';

test.describe('Resiliência e Self-Healing', () => {

  test.beforeEach(async () => {
    allure.epic('Engenharia de Confiabilidade (SRE)');
    allure.feature('Mecanismo de Autorrecuperação');
    allure.suite('Testes de Resiliência de Rede');
  });

  test('Deve sobreviver a uma instabilidade temporária (Erro 503) e passar na retentativa', async ({ request }) => {
    allure.story('Sobrevivência a Flaky Network');
    allure.tags('Resiliência', 'Self-Healing');

    // Ao invés de usar `request.get`, envelopamos na nossa função.
    const response = await requestWithHealing(request, 'get', '/api/v1/instavel');

    // O teste nem vai perceber que deu 503 na primeira tentativa. 
    // O Healing cuidou disso.
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.sucesso).toContain('Self-Healing funcionou!');
  });
});