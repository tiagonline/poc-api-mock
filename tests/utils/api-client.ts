import { APIRequestContext, APIResponse } from '@playwright/test';
import { allure } from 'allure-playwright';

/**
 * Motor de Self-Healing para requisições de API.
 * Intercepta falhas de infraestrutura (502, 503, 504) e retenta automaticamente.
 */
export const requestWithHealing = async (
  request: APIRequestContext,
  method: 'get' | 'post' | 'patch' | 'delete',
  url: string,
  options?: any,
  maxRetries: number = 3
): Promise<APIResponse> => {
  let delay = 1000; // Começa esperando 1 segundo

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const response = await request[method](url, options);
    
    // Se for erro de infraestrutura transitória (soluço da nuvem), aplica o healing
    if ([502, 503, 504].includes(response.status())) {
      console.warn(`\n[Self-Healing] Erro ${response.status()} na URL ${url}. Tentativa ${attempt} de ${maxRetries}...`);
      
      // Registra a cura no relatório Allure para o gestor ver que o QA salvou a pipeline
      await allure.step(`[Self-Healing] Falha transitória (${response.status()}). Retentando em ${delay}ms...`, async () => {});
      
      if (attempt === maxRetries) {
        return response; // Se esgotar as tentativas, devolve o erro para o teste quebrar
      }
      
      // Backoff Exponencial: Espera 1s, depois 2s, depois 4s...
      await new Promise(res => setTimeout(res, delay));
      delay *= 2; 
      continue;
    }
    
    // Se for sucesso (200, 201) ou erro de negócio mapeado (400, 404, 500 interno), devolve na hora!
    return response; 
  }
  
  throw new Error('Unreachable');
};