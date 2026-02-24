import { OpenAI } from 'openai';

export class AIService {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      baseURL: 'https://models.inference.ai.azure.com',
      apiKey: process.env.AZURE_AI_TOKEN,
    });
  }

  /**
   * Envia o erro e o payload para a IA e retorna um novo payload corrigido
   */
  async healPayload(originalPayload: any, apiError: any): Promise<any> {
    console.log('\n======================================================');
    console.log('🤖 [AIService] 🚀 Iniciando análise de quebra de contrato...');
    
    // Log do problema
    console.log('❌ [AIService] Erro reportado pelo Mock/API:');
    console.log(JSON.stringify(apiError, null, 2));
    
    // Log do payload antigo
    console.log('\n📦 [AIService] Payload original (Rejeitado):');
    console.log(JSON.stringify(originalPayload, null, 2));
    console.log('======================================================\n');

    console.log('[AIService] 📤 A pedir ajuda ao gpt-4o-mini na Azure...');

    const prompt = `
      A API retornou um erro de validação.
      Erro da API: ${JSON.stringify(apiError)}
      Payload Original: ${JSON.stringify(originalPayload)}
      
      Por favor, analise o erro e o payload original, e devolva APENAS um JSON válido corrigido.
      Não adicione formatação markdown, apenas o JSON.
    `;

    try {
      const response = await this.client.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "gpt-4o-mini", // ou o nome exato do seu modelo/deployment
        temperature: 0.1,
        max_tokens: 300,
      });

      const content = response.choices[0].message.content || '{}';
      
      // Limpeza de segurança (caso a IA insista em devolver markdown ```json)
      const cleanJson = content.replace(/```json/g, '').replace(/```/g, '').trim();
      
      const healedPayload = JSON.parse(cleanJson);

      // Log da solução!
      console.log('\n======================================================');
      console.log('✅ [AIService] 📥 A IA compreendeu o erro e gerou um NOVO Payload:');
      console.log(JSON.stringify(healedPayload, null, 2));
      console.log('======================================================\n');

      return healedPayload;

    } catch (error) {
      console.error('🚨 [AIService] Falha catastrófica ao contactar a IA:', error);
      throw error;
    }
  }
}