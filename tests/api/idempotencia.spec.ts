import { expect, test } from '@playwright/test';
import { allure } from 'allure-playwright';

test.describe('Padrões de Arquitetura: Idempotência', () => {

  test('Deve processar o pagamento na 1ª vez e retornar o cache na 2ª tentativa (Duplicidade)', async ({ request }) => {
    allure.epic('Backend & APIs');
    allure.feature('Idempotência de Pagamentos');
    
    const payload = { valor: 5000, metodo: 'PIX' };
    const chaveIdempotencia = 'chave-secreta-123';

    console.log('\n[Teste] 💸 Enviando a 1ª requisição de pagamento...');
    
    // 1ª Tentativa - O pagamento deve ser processado e retornar HTTP 201 (Created)
    const response1 = await request.post('/api/v1/pagamentos', {
      data: payload,
      headers: { 'Idempotency-Key': chaveIdempotencia }
    });
    
    expect(response1.status()).toBe(201);
    const body1 = await response1.json();
    console.log(`[1ª Tentativa] Status: ${response1.status()} | Mensagem: ${body1.mensagem}`);
    expect(body1.mensagem).toContain('processado com sucesso');

    
    console.log('\n[Teste] ⚠️ Simulando instabilidade (App reenviou o mesmo pagamento)...');
    
    // 2ª Tentativa - Com a MESMA chave, deve bater no cache e retornar HTTP 200 (OK)
    const response2 = await request.post('/api/v1/pagamentos', {
      data: payload,
      headers: { 'Idempotency-Key': chaveIdempotencia }
    });
    
    expect(response2.status()).toBe(200);
    const body2 = await response2.json();
    console.log(`[2ª Tentativa] Status: ${response2.status()} | Mensagem: ${body2.mensagem}`);
    
    // Validações Cruciais de Idempotência
    expect(body2.mensagem).toContain('Idempotência ativada'); // Avisa que bateu no cache
    expect(body2.id).toBe(body1.id); // Garante que o ID da transação não mudou
  });
});