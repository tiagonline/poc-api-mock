import { expect, test } from '@playwright/test';
import { faker } from '@faker-js/faker';
import Ajv from 'ajv';

// Instancio o validador de schema uma única vez para performance
const ajv = new Ajv();

const mappedCpfs = new Set(['12345678900', '99999999999']);

// Uso o FakerJS para Data Fuzzing (Pilar 2: Robustez)
const gerarCpfNaoMapeado = (): string => {
  let cpf = faker.string.numeric(11);

  while (mappedCpfs.has(cpf)) {
    cpf = faker.string.numeric(11);
  }

  return cpf;
};

test.describe('Contrato Governo (WireMock)', () => {
  
  test.beforeEach(async ({ request }) => {
    // Fallback inteligente para evitar falsos negativos no CI/CD (Pilar 6)
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

    // Eu defino o schema rigoroso da API aqui (Habilidade 5: Contract Mode)
    const schema = {
      type: 'object',
      properties: {
        status: { type: 'string' },
        cpf: { type: 'string', pattern: '^[0-9]{11}$' } // Garanto que o CPF venha no formato certo
      },
      required: ['status', 'cpf'],
      // 'additionalProperties: true' permite que o governo adicione campos no futuro sem quebrar nosso pipeline
      additionalProperties: true 
    };

    // Validação do Contrato (Schema Validation)
    const isValid = ajv.validate(schema, body);
    expect(isValid, `Violação de Contrato da API: ${ajv.errorsText()}`).toBe(true);

    // Validação dos Dados de Negócio (Regra da Aplicação)
    expect(body.cpf).toBe(cpf);
    expect(body.status).toBe('REGULAR');
  });

  test('deve retornar 404 para CPF não mapeado no WireMock', async ({ request }) => {
    const cpfNaoMapeado = gerarCpfNaoMapeado();
    const response = await request.get(`/api/v1/cpf/${cpfNaoMapeado}`, { timeout: 5000 });

    expect(response.status()).toBe(404);
  });
});