// Arquivo: tests/api/crud-propostas.spec.ts

import { expect, test } from "@playwright/test";
import { faker } from "@faker-js/faker";
import Ajv from "ajv";
import { allure } from "allure-playwright";

// Importando o contrato centralizado
import { propostaSchema } from "./schemas/proposta.schema";

const ajv = new Ajv();

// Usamos .serial para garantir a ordem exata de execução do CRUD
test.describe.serial("CRUD - Ciclo de Vida da Proposta de Seguro", () => {
  let propostaId: string; // Guarda o estado entre os testes

  test.beforeEach(async () => {
    allure.epic("Backend & APIs");
    allure.feature("Core de Seguros (CRUD de Propostas)");
    allure.suite("Fluxo Integrado de Negócio");
  });

  test("Passo 1: [POST] Deve criar uma nova proposta de seguro", async ({
    request,
  }) => {
    allure.story("Criação de Proposta");
    allure.tags("POST", "Critical", "Sanity");

    // Payload dinâmico usando faker
const payload = {
      cpf_cliente: faker.string.numeric(11),
      placa_veiculo: faker.vehicle.vrm(),
      valor_fipe: faker.number.int({ min: 30000, max: 200000 }),
      idade_condutor: faker.number.int({ min: 18, max: 80 }),
      cor_veiculo: faker.vehicle.color()
    };

    const response = await request.post("/api/v1/propostas", { data: payload });
    expect(response.status()).toBe(201); // Valida HTTP Status

    const body = await response.json();

    // Salva o ID retornado pelo Mock para usar nos próximos testes!
    propostaId = body.id;

    expect(propostaId).toContain("PRP-");
    expect(body.status).toBe("CRIADA");
  });

  test("Passo 2: [GET] Deve consultar os detalhes da proposta criada", async ({
    request,
  }) => {
    allure.story("Consulta de Proposta");
    allure.tags("GET", "Contract");

    // Usa o ID guardado no passo 1
    const response = await request.get(`/api/v1/propostas/${propostaId}`);
    expect(response.status()).toBe(200);

    const body = await response.json();

    // Validação de Contrato Limpa (Clean Code)
    const isValid = ajv.validate(propostaSchema, body);

    expect(isValid, `Violação de Contrato: ${ajv.errorsText()}`).toBe(true);
    expect(body.id).toBe(propostaId); // Garante que retornou a mesma
  });

  test("Passo 3: [PATCH] Deve atualizar o status da proposta", async ({
    request,
  }) => {
    allure.story("Atualização de Proposta");
    allure.tags("PATCH");

    const response = await request.patch(`/api/v1/propostas/${propostaId}`, {
      data: { status: "APROVADA" },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.sucesso).toBe(true);
  });

  test("Passo 4: [DELETE] Deve cancelar a proposta", async ({ request }) => {
    allure.story("Cancelamento de Proposta");
    allure.tags("DELETE");

    const response = await request.delete(`/api/v1/propostas/${propostaId}`);
    // No WireMock mapeamos para 200 com payload de sucesso
    expect(response.status()).toBe(200);
  });

  test("Exceção: [GET] Deve tratar Erro 500 do servidor gracefully", async ({
    request,
  }) => {
    allure.story("Tratamento de Falhas Sistêmicas");
    allure.tags("GET", "Edge-Case", "500");

    // Batemos no ID que mapeamos para falhar no WireMock
    const response = await request.get("/api/v1/propostas/PRP-99999999");

    expect(response.status()).toBe(500);
    const body = await response.json();
    expect(body.codigo).toBe("ERR-DB-001");
  });
});
