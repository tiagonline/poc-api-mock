export class AIService {
  private readonly endpoint = "https://models.inference.ai.azure.com/chat/completions";
  private readonly token: string;

  constructor() {
    this.token = process.env.AZURE_AI_TOKEN || "";
    if (!this.token) console.warn("[AIService] ⚠️ Token AZURE_AI_TOKEN não encontrado no .env!");
  }

  async healPayload(originalPayload: any, apiError: any): Promise<any> {
    console.log("[AIService] 🚀 Iniciando análise de quebra de contrato via IA...");
    
    if (!this.token) {
        console.warn("[AIService] IA desativada: Token ausente. Retornando payload original.");
        return originalPayload;
    }

    const systemPrompt = `
      Você é uma IA de Self-Healing para automação de testes de API (Playwright).
      Objetivo: Consertar payloads JSON quebrados baseados na mensagem de erro da API.
      
      Regras:
      1. Analise o erro retornado pela API e o payload original.
      2. Adicione os campos obrigatórios ausentes no payload com dados fictícios válidos deduzidos pelo erro.
      3. Retorne APENAS o JSON corrigido puro. Não use marcação markdown (como \`\`\`json).
    `;

    try {
      console.log(`[AIService] 📤 Enviando requisição para gpt-4o-mini...`);

      const response = await fetch(this.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.token}`
        },
        body: JSON.stringify({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Erro da API: ${JSON.stringify(apiError)}\n\nPayload Original:\n${JSON.stringify(originalPayload)}` }
          ],
          model: "gpt-4o-mini", // Modelo rápido e barato
          temperature: 0.1,     // Baixa temperatura para ser determinístico
          max_tokens: 300       // Limite pequeno pois o JSON é curto
        })
      });

      if (!response.ok) {
        console.error(`[AIService] ❌ Erro API: ${response.status} - ${response.statusText}`);
        return originalPayload; // Se a IA falhar, devolve o que tinha para o teste quebrar naturalmente
      }

      const data = await response.json() as any;
      let content = data.choices?.[0]?.message?.content || "{}";
      
      console.log(`[AIService] 📥 IA respondeu com o novo contrato.`);

      // Limpeza de segurança caso a IA mande markdown mesmo com o prompt pedindo para não mandar
      if (content.includes('```json')) {
        content = content.replace(/```json/g, '').replace(/```/g, '').trim();
      }

      return JSON.parse(content);

    } catch (error: any) {
      console.error(`[AIService] 💥 Exception: ${error.message}`);
      return originalPayload;
    }
  }
}