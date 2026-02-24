# poc-api-mock

Boilerplate de arquitetura para automação e isolamento de integrações
externas com **Playwright + WireMock + Inteligência Artificial (Azure
OpenAI)**.

------------------------------------------------------------------------

### O Desafio (Por que não usar a API real?)

Neste projeto, nós não batemos na API real do Governo ou de parceiros.
Depender de serviços externos em ambientes de CI/CD é a principal causa
de testes lentos e falsos-negativos (*flaky tests*), além de exigir
alinhamentos constantes de massa de dados com os donos das APIs.

Para resolver isso, implementamos o Estado da Arte em **Service
Virtualization** utilizando o **WireMock**, combinado com **Generative
QA (IA)**.

O WireMock atua como um "dublê" da API externa rodando localmente (ou no
CI). Isso nos garante:

1.  **Determinismo Absoluto:** O CPF `12345678900` retornará *sempre*
    sucesso.
2.  **Data-Driven Testing (Matriz de Estados):** Mapeamos múltiplos
    cenários de negócio instantâneos sem sujar bases reais (Regular,
    Falecido, Inadimplente, Fraude).
3.  **Controle de Latência e Resiliência:** Simulamos a lentidão típica
    de APIs (Timeout de 30s) e instabilidades temporárias (Erro 503
    Flaky) para testar nossas políticas de *Retry*.
4.  **Isolamento e Velocidade:** Os testes rodam na velocidade da luz
    (milissegundos), isolados e sem consumir *rate limits* de terceiros.

------------------------------------------------------------------------

### 🤖 Generative QA & AI Self-Healing

Esta POC introduz a quebra de paradigma na manutenção de testes: **Zero
Manutenção de Contratos**.\
Se a API virtualizada mudar suas regras (ex: passar a exigir um novo
campo obrigatório e retornar HTTP 400), o teste **não falha**.

1.  O framework intercepta o Erro 400.
2.  Aciona o `AIService` (Azure OpenAI - gpt-4o-mini).
3.  A IA lê a mensagem de erro do backend, reescreve o Payload JSON em
    tempo de execução adicionando o que falta.
4.  O Playwright faz o *Retry* com o novo payload e o teste passa.

------------------------------------------------------------------------

### Comandos importantes

``` bash
# Instalar dependências
npm install

# Sobe o WireMock em background (porta 8081)
npm run mock:start

# Derruba o WireMock
npm run mock:stop

# Restar do WireMock, se necessário qnd atualizar algum mapping
npm run mock:restart

# Executa somente testes de API (inclui o AI Healing)
npm run test:api

# Executa somente testes E2E
npm run test:e2e

# Pipeline local: sobe mock -> roda API + E2E -> derruba mock
npm run test:ci
```

------------------------------------------------------------------------

### 🚀 Dicas Rápidas e Massa de Dados (WireMock)

#### 🔧 Painel Admin do WireMock

    http://127.0.0.1:8081/__admin/mappings

------------------------------------------------------------------------

### 🔄 Simulações Disponíveis

#### ⚠️ Simulação de Instabilidade (Flaky)

    GET /api/v1/instavel

- Falha na 1ª tentativa, passa na 2ª.

#### 🤖 CRUD V2 (AI Healing)

    POST /api/v1/propostas

- Exige idade e cor do veículo.

------------------------------------------------------------------------

## 📦 Massa de CPFs Disponível (Data-Driven)

  --------------------------------------------------------------------------
  CPF           Cenário                    Status
  ------------- -------------------------- ---------------------------------
  12345678900   🟢 Caminho Feliz           REGULAR
  22222222222   💀 Titular Falecido        FALECIDO
  33333333333   🚨 Fraude Detectada        BLOQUEADO_FRAUDE (HTTP 403)
  44444444444   ❌ Documento Cancelado     CANCELADO
  55555555555   💸 Nome Sujo               INADIMPLENTE
  99999999999   ⏳ Delay Extremo           30s para responder (Timeout)
  --------------------------------------------------------------------------

- Qualquer outro CPF retornará **Erro 404**.

------------------------------------------------------------------------

## 🛠️ Troubleshooting

### ❌ http://127.0.0.1:8081 não responde

``` bash
# Confirma se o container está de pé
docker compose ps

# Mostra logs do mock em tempo real
docker compose logs --tail=100 -f wiremock
```

- Nota: Estamos utilizando `network_mode: "host"` no Docker para evitar
  bloqueios de firewall corporativo/antivírus.

------------------------------------------------------------------------

### ⏳ test:api está lento ou falhando por timeout

-   O CPF `99999999999` foi mapeado propositalmente com delay de 30s.
-   Verifique se o WireMock está rodando:

``` bash
npm run mock:start
```

-   Se o container morreu instantaneamente, verifique os logs Docker.\
    Pode haver erro de sintaxe (ex: vírgula faltando) em algum JSON da
    pasta `mappings/`.

------------------------------------------------------------------------

### 🤖 AI Self-Healing Falhando

-   Certifique-se de que a variável de ambiente `AZURE_AI_TOKEN` está
    configurada corretamente:
    -   No arquivo `.env` local
    -   Ou nas Secrets do GitHub Actions

------------------------------------------------------------------------

### 👤 Autor

Tiago Silva

- POC desenvolvida para demonstrar o futuro da Qualidade de Software com
IA e Virtualização.