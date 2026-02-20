# poc-api-mock

Boilerplate de automação para isolamento de integrações externas com **Playwright + WireMock**.

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
```

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
