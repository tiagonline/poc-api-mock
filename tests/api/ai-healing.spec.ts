import { expect, test } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { allure } from 'allure-playwright';

// Importa a nossa nova classe
import { AIService } from '../utils/AIService';

test.describe('Generative QA - Self-Healing de Contratos', () => {
  // Instanciamos o serviço de IA
  const aiService = new AIService();

  test('Deve recuperar dinamicamente de uma quebra de contrato na API usando Azure OpenAI', async ({ request }) => {
    allure.epic('IA & GenAI');
    allure.feature('Self-Healing de API');
    allure.story('Correção dinâmica de Payload no 400 Bad Request');

    // 1. Montamos o Payload ANTIGO (Omitindo propositalmente a idade_condutor)
    let payload = {
      cpf_cliente: faker.string.numeric(11),
      placa_veiculo: faker.vehicle.vrm(),
    };

    // 2. Enviamos a requisição (Vai bater na parede do WireMock e tomar 400)
    let response = await request.post('/api/v1/propostas', { data: payload });

    // 3. A MÁGICA DO ARQUITETO
    if (response.status() === 400) {
      const erroDaApi = await response.json();
      
      await allure.step(`🧠 IA interceptou o Erro 400: ${erroDaApi.mensagem}`, async () => {});
      
      // Enviamos o problema para o gpt-4o-mini na Azure
      payload = await aiService.healPayload(payload, erroDaApi);

      await allure.step('⚠️ Retentando requisição com o novo contrato injetado pela IA...', async () => {});

      // Disparamos de novo!
      response = await request.post('/api/v1/propostas', { data: payload });
    }

    // 4. Se a IA for inteligente, ela colocou a idade e agora passará com 201!
    expect(response.status()).toBe(201); 
    const body = await response.json();
    expect(body.status).toBe('CRIADA');
  });
});