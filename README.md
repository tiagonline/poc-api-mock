# poc-api-mock

Boilerplate de arquitetura para automação e isolamento de integrações externas com **Playwright + WireMock**.

## WireMock

Neste projeto, nós não batemos na API real do Governo. Depender de serviços externos em ambientes de CI/CD é a principal causa de testes lentos e falsos-negativos (*flaky tests*) além de precisarmos alinhamentos com o dono da API. 

Para resolver isso, implementamos **Service Virtualization** utilizando o **WireMock**. 

O WireMock atua como um "dublê" da API externa. Em vez da nossa aplicação ou do nosso teste fazer uma chamada real à internet, ele se comunica com o container do WireMock rodando localmente. Isso nos garante:

1. **Determinismo:** Garantir que o CPF `12345678900` retorne *sempre* sucesso, sem depender de bases reais.
2. **Simulação de Exceções (Edge Cases):** Podemos forçar erros (como um `404 Not Found`) para CPFs não mapeados e validar como o nosso sistema reage.
3. **Controle de Latência:** Simulamos a lentidão típica de APIs do governo. O CPF `99999999999` está configurado para demorar propositalmente 30 segundos para responder, permitindo testar nossa política de *timeout*.
4. **Isolamento e Velocidade:** Os testes rodam na velocidade da luz, isolados e sem consumir *rate limits* de terceiros.

---

## Comandos importantes

```bash
# Sobe o WireMock em background (porta 8080)
npm run mock:start

# Derruba o WireMock
npm run mock:stop

# Executa somente testes de API (contrato/integração com mock)
npm run test:api

# Executa somente testes E2E
npm run test:e2e

# Pipeline local: sobe mock -> roda API + E2E -> derruba mock
npm run test:ci

## Dicas rápidas

- Admin do WireMock: `http://localhost:8080/__admin`
- Mock de sucesso: `GET /api/v1/cpf/12345678900`
- Mock com delay: `GET /api/v1/cpf/99999999999` (30s)

## Troubleshooting

### `http://localhost:8080` não responde

```bash
# Confirma se o container está de pé
docker compose -f mock-server/docker-compose.yml ps

# Mostra logs do mock
docker compose -f mock-server/docker-compose.yml logs --tail=100 wiremock
```

Se o container estiver `Up` e ainda assim o `localhost` não abrir no navegador, acesse pelo IP da máquina Linux (ex.: `http://192.168.x.x:8080/__admin`) ou faça Port Forward da porta 8080 no VS Code.

### `test:api` está lento ou falhando por timeout

- O CPF `99999999999` foi mapeado com delay de 30s para simular timeout.
- Para teste de 404, use um CPF **não mapeado** (ex.: `08195791654`).
- Para sucesso imediato, use `12345678900`.

### `test:e2e` falha ao abrir `/`

- Verifique se existe frontend rodando na URL configurada em `FRONTEND_URL`.
- Se não houver app frontend ativo, o teste E2E pode ser pulado conforme o fallback implementado.
