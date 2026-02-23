import { expect, test } from '@playwright/test';
import { faker } from '@faker-js/faker';
import Ajv from 'ajv';
import { allure } from 'allure-playwright';

const ajv = new Ajv();
const mappedCpfs = new Set(['12345678900', '99999999999']);

const gerarCpfNaoMapeado = (): string => {
  let cpf = faker.string.numeric(11);
  while (mappedCpfs.has(cpf)) {
    cpf = faker.string.numeric(11);
  }
  return cpf;
};

test.describe('Integrações Governamentais', () => {
  
  test.beforeEach(async ({ request }) => {
    // 🎨 MÁGICA DO ALLURE: Preenchendo Suítes e Funcionalidades
    allure.epic('Backend & APIs');
    allure.feature('Validação de CPF (Service Virtualization)');
    allure.suite('Testes de Contrato com Governo');

    try {
      const healthCheck = await request.get('/__admin/mappings', { timeout: 5000 });
      test.skip(!healthCheck.ok(), 'WireMock indisponível na API_GOVERNO_URL configurada.');
    } catch {
      test.skip(true, 'WireMock indisponível na API_GOVERNO_URL configurada.');
    }
  });

  test('deve retornar contrato esperado para CPF mapeado', async ({ request }) => {
    allure.story('Caminho Feliz - CPF Regular');
    allure.tags('API', 'Contrato', 'Smoke');

    const cpf = '12345678900';
    const response = await request.get(`/api/v1/cpf/${cpf}`, { timeout: 5000 });
    expect(response.status()).toBe(200);

    const body = await response.json();
    const schema = {
      type: 'object',
      properties: {
        status: { type: 'string' },
        cpf: { type: 'string', pattern: '^[0-9]{11}$' }
      },
      required: ['status', 'cpf'],
      additionalProperties: true 
    };

    const isValid = ajv.validate(schema, body);
    expect(isValid, `Violação de Contrato da API: ${ajv.errorsText()}`).toBe(true);
    expect(body.cpf).toBe(cpf);
    expect(body.status).toBe('REGULAR');
  });

  test('deve retornar 404 para CPF não mapeado no WireMock', async ({ request }) => {
    allure.story('Caminho de Exceção - CPF Inválido');
    allure.tags('API', 'Edge-Case', 'Mock');

    const cpfNaoMapeado = gerarCpfNaoMapeado();
    const response = await request.get(`/api/v1/cpf/${cpfNaoMapeado}`, { timeout: 5000 });
    expect(response.status()).toBe(404);
  });
});