# Banco Digital — Front-end (Angular)

Interface web para a [Banco Digital API](../banco-digital-api). Permite **login**
(mockado), visualizar **saldo**, **transferir** entre contas, consultar o
**extrato** e fazer a **gestão de contas (CRUD)** — consumindo todos os
endpoints da API.

---

## Stack

| Item | Tecnologia | Versão |
|------|------------|--------|
| Framework | Angular | 21 (LTS) |
| UI | Angular Material | 21 |
| Linguagem | TypeScript | 5.9 |
| Estilo | SCSS | — |
| Estado | Angular Signals | — |

**Por que Angular 21?** É a versão mais recente em **LTS** (suporte até maio/2027),
madura e estável. O Angular 22 (junho/2026) é muito novo ("signal-first",
componentes selectorless) e foi evitado para reduzir risco de bugs.

A aplicação usa a arquitetura moderna do Angular: **componentes standalone**
(sem NgModules), **lazy loading** por rota, **signals** para estado e a sintaxe
de controle de fluxo `@if` / `@for` nos templates.

---

## Pré-requisitos

- **Node.js 20+** e npm.
- A **API rodando** em `http://localhost:8080` (veja o README do `banco-digital-api`).
  O backend já inclui a configuração de CORS liberando `http://localhost:4200`.

---

## Como rodar

```bash
cd banco-digital-frontend
npm install
npm start
```

Acesse **http://localhost:4200**. A aplicação recarrega automaticamente ao
salvar arquivos.

Build de produção:

```bash
npm run build
```

(Os arquivos finais ficam em `dist/banco-digital-frontend`.)

---

## Login (mock)

Como o backend ainda não tem JWT, a autenticação é **simulada no front**. O
**usuário é o nome exato da conta** no banco (sem diferenciar maiúsculas) e a
**senha é `123` para todos**. As contas são as criadas pela migration da API:

| Usuário (nome) | Senha | Papel | Saldo inicial |
|----------------|-------|-------|---------------|
| `ADM` | `123` | ADMIN | R$ 1.000.000,00 |
| `Maria Silva` | `123` | USER | R$ 1.000,00 |
| `Joao Souza` | `123` | USER | R$ 500,00 |
| `Ana Pereira` | `123` | USER | R$ 2.500,00 |
| `Carlos Lima` | `123` | USER | R$ 750,00 |
| `Beatriz Costa` | `123` | USER | R$ 3.200,00 |
| `Pedro Santos` | `123` | USER | R$ 1.500,00 |
| `Juliana Almeida` | `123` | USER | R$ 4.800,00 |
| `Rafael Oliveira` | `123` | USER | R$ 980,00 |
| `Fernanda Rocha` | `123` | USER | R$ 6.100,00 |
| `Lucas Martins` | `123` | USER | R$ 250,00 |

O `ADM` é administrador **e** possui conta própria com saldo alto, para permitir
tanto as ações administrativas quanto testes de transferência.

A sessão é guardada em `localStorage` (sobrevive ao refresh). Quando o backend
tiver login real, basta trocar a implementação do `AuthService` — a interface
pública (`login`, `logout`, `currentUser`, `isAuthenticated`, `isAdmin`)
permanece a mesma.

### Controle de acesso por papel (RBAC)

A autorização é feita por **guards de rota**, segregando o que cada papel pode
fazer:

| Ação | ADMIN | USER (cliente) |
|------|:-----:|:--------------:|
| Listar contas (nomes) | ✅ | ✅ |
| Ver saldo de **outras** contas | ✅ | ❌ |
| Ver/usar a **própria** conta e saldo | ✅ | ✅ |
| Criar conta | ✅ | ❌ |
| Editar conta | qualquer | só a própria |
| Excluir conta | ✅ | ❌ |
| Transferir / Extrato | ✅ (tem conta própria) | ✅ |

Guards aplicados (`src/app/core/guards`):

- **`adminGuard`** → rota de criar conta (`/accounts/new`).
- **`accountAccessGuard`** → detalhe e edição (`/accounts/:id`, `/accounts/:id/edit`):
  libera para o ADMIN ou para o dono da conta; bloqueia os demais.
- **`customerGuard`** → transferência e extrato: exige uma conta de cliente
  (bloqueia o ADMIN, que não possui conta).

Além dos guards, a UI esconde o que o papel não pode ver — para o USER, a coluna
de **saldo** das outras contas e as ações administrativas não aparecem.

> Observação: como o backend ainda não tem JWT/roles, esta autorização é feita
> **no front**. Em produção, as mesmas regras precisam ser reforçadas no backend.

---

## Telas e rotas

| Rota | Tela | Endpoints consumidos |
|------|------|----------------------|
| `/login` | Login mockado | — (mock) |
| `/home` | Dashboard com saldo e atalhos | `GET /accounts/{id}` |
| `/transfer` | Transferência (form → confirmação → sucesso) | `GET /accounts`, `POST /transfers` |
| `/statement` | Extrato bancário (paginado) | `GET /accounts/{id}/movements` |
| `/accounts` | Lista de contas (CRUD) | `GET /accounts`, `DELETE /accounts/{id}` |
| `/accounts/new` | Criar conta | `POST /accounts` |
| `/accounts/:id` | Detalhe / saldo | `GET /accounts/{id}` |
| `/accounts/:id/edit` | Editar conta | `GET` + `PUT /accounts/{id}` |

Todas as rotas (exceto `/login`) são protegidas por um **guard de rota** que
redireciona para o login se não houver sessão.

---

## Arquitetura de pastas

A estrutura segrega responsabilidades em **core** (lógica transversal),
**shared** (UI reutilizável) e **features** (telas por domínio):

```
src/app
├── core/                      # singletons e lógica de aplicação
│   ├── models/                # DTOs (contrato da API) e modelos de sessão
│   │   ├── account.dto.ts
│   │   ├── transfer.dto.ts
│   │   ├── movement.dto.ts
│   │   ├── page.dto.ts
│   │   └── auth-user.model.ts
│   ├── services/              # acesso HTTP e estado (camada de serviço)
│   │   ├── account.service.ts
│   │   ├── transfer.service.ts
│   │   ├── auth.service.ts    # autenticação mock (signals)
│   │   └── toast.service.ts
│   ├── interceptors/
│   │   └── error.interceptor.ts   # trata o ApiError da API globalmente
│   └── guards/
│       └── auth.guard.ts
├── shared/                    # componentes/visual reutilizáveis
│   ├── layout/                # toolbar + <router-outlet>
│   └── components/
│       └── confirm-dialog.component.ts
├── features/                  # telas (camada de view), uma pasta por domínio
│   ├── auth/                  # login
│   ├── home/                  # dashboard
│   ├── transfer/              # transferência
│   ├── statement/             # extrato
│   └── accounts/              # CRUD de contas
├── app.config.ts              # providers (router, http, animations, locale)
├── app.routes.ts              # rotas com lazy loading e guard
└── app.component.ts           # raiz
```

### Separação de camadas (service / DTO / view)

A separação pedida foi aplicada de forma explícita:

- **DTO** (`core/models`): interfaces que **espelham o contrato da API**
  (`AccountResponse`, `TransferRequest`, `MovementResponse`, `Page<T>`...). São o
  formato de transporte, sem nenhuma lógica.
- **Service** (`core/services`): concentram **toda a comunicação HTTP** e a
  montagem de parâmetros/headers (ex.: a `Idempotency-Key` é gerada no
  `TransferService`). Nenhum componente fala diretamente com `HttpClient`.
- **View** (`features/**`): os componentes só cuidam de **apresentação e
  interação**. Recebem/enviam DTOs através dos services e expõem estado via
  signals. Não conhecem URLs nem detalhes de HTTP.

---

## Decisões de design

- **Standalone + lazy loading:** cada tela é carregada sob demanda
  (`loadComponent`), reduzindo o bundle inicial.
- **Signals para estado local:** estado de carregamento, dados e fases (ex.: o
  fluxo de 3 etapas da transferência) usam `signal`/`computed`, sem boilerplate
  de RxJS onde não é necessário.
- **Interceptor de erros:** o corpo de erro padronizado da API (`ApiError`,
  inclusive `fieldErrors`) é traduzido em mensagens amigáveis num único lugar e
  exibido via snackbar — saldo insuficiente, validação, etc.
- **Idempotência ponta a ponta:** o front gera uma `Idempotency-Key` por
  transferência, exercitando o recurso de idempotência do backend e evitando
  duplicidade em clique duplo / retry.
- **Confirmação antes de efetivar:** a transferência tem uma etapa de revisão,
  reduzindo erros do usuário; e a exclusão de conta usa um diálogo de confirmação.

---

## Observações

- A URL da API fica em `src/environments/environment.ts` (`apiBaseUrl`). Ajuste
  se o backend rodar em outra porta/host.
- Para o saldo aparecer e as transferências funcionarem, a API precisa estar no
  ar e com o banco populado (a migration cria 10 contas de clientes + a conta ADM).
