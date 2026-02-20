import { expect, test } from '@playwright/test';
import { faker } from '@faker-js/faker';

const mappedCpfs = new Set(['12345678900', '99999999999']);

const gerarCpfNaoMapeado = (): string => {
  let cpf = faker.string.numeric(11);

  while (mappedCpfs.has(cpf)) {
    cpf = faker.string.numeric(11);
  }

  return cpf;
};

test.describe('Contrato Governo (WireMock)', () => {
  test.beforeEach(async ({ request }) => {
    try {
      const healthCheck = await request.get('/__admin/mappings', { timeout: 5000 });
      test.skip(!healthCheck.ok(), 'WireMock indisponível na API_GOVERNO_URL configurada.');
    } catch {
      test.skip(true, 'WireMock indisponível na API_GOVERNO_URL configurada.');
    }
  });

  test('deve retornar contrato esperado para CPF mapeado', async ({ request }) => {
    const cpf = '12345678900';
    const response = await request.get(`/api/v1/cpf/${cpf}`, { timeout: 5000 });

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toEqual({
      status: 'REGULAR',
      cpf
    });
  });

  test('deve retornar 404 para CPF não mapeado no WireMock', async ({ request }) => {
    const cpfNaoMapeado = gerarCpfNaoMapeado();
    const response = await request.get(`/api/v1/cpf/${cpfNaoMapeado}`, { timeout: 5000 });

    expect(response.status()).toBe(404);
  });
});