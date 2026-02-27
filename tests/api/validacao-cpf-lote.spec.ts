import { expect, test } from "@playwright/test";
import { allure } from "allure-playwright";

// DATA-DRIVEN
const massaDeTestes = [
  {
    cpf: "12345678900",
    cenario: "Caminho Feliz",
    httpStatusEsperado: 200,
    statusGoverno: "REGULAR",
  },
  {
    cpf: "22222222222",
    cenario: "Titular Falecido",
    httpStatusEsperado: 200,
    statusGoverno: "FALECIDO",
  },
  {
    cpf: "33333333333",
    cenario: "Fraude Detectada",
    httpStatusEsperado: 403,
    statusGoverno: "BLOQUEADO_FRAUDE",
  },
  {
    cpf: "44444444444",
    cenario: "Documento Cancelado",
    httpStatusEsperado: 200,
    statusGoverno: "CANCELADO",
  },
  {
    cpf: "55555555555",
    cenario: "Nome Sujo (Inadimplente)",
    httpStatusEsperado: 200,
    statusGoverno: "INADIMPLENTE",
  },
];

test.describe("Validação em Lote de Estados de CPF (Data-Driven)", () => {
  // LAÇO DE REPETIÇÃO
  // O Playwright vai gerar 4 testes dinâmicos com base no array acima.
  for (const dados of massaDeTestes) {
    test(`Deve validar o cenário: ${dados.cenario} (CPF: ${dados.cpf})`, async ({
      request,
    }) => {
      allure.epic("Backend & APIs");
      allure.feature("Data-Driven Testing");
      allure.story(`Consulta de CPF - ${dados.cenario}`);

      // 1. Batemos na API usando o CPF dinâmico da rodada atual
      const response = await request.get(`/api/v1/cpf/${dados.cpf}`);

      // 2. Validamos se o status HTTP condiz com o esperado (Fraude dá 403, o resto dá 200)
      expect(response.status()).toBe(dados.httpStatusEsperado);

      // 3. Lemos o corpo da resposta
      const body = await response.json();

      // 4. Validamos se o WireMock nos devolveu o Status Governamental correto
      expect(body.status).toBe(dados.statusGoverno);
      expect(body.cpf).toBe(dados.cpf);
    });
  }
});
