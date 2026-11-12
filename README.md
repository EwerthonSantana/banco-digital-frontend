# Banco Digital — Front end (Angular)

Web interface for the **Banco Digital API** (back end in a **separate
repository**: **https://github.com/EwerthonSantana/banco-digital-api**). It supports
(mocked) **login**, viewing the **balance**, **transferring** between accounts,
checking the **statement**, and **account management (CRUD)** — consuming every
endpoint of the API.

---

## Stack

| Item | Technology | Version |
|------|------------|---------|
| Framework | Angular | 21 (LTS) |
| UI | Angular Material | 21 |
| Language | TypeScript | 5.9 |
| Styling | SCSS | — |
| State | Angular Signals | — |

**Why Angular 21?** It's the latest **LTS** release (supported until May 2027),
mature and stable. Angular 22 (June 2026) is very new ("signal-first",
selectorless components) and was avoided to reduce the risk of bugs.

The app uses modern Angular architecture: **standalone components** (no
NgModules), route-level **lazy loading**, **signals** for state, and the
`@if` / `@for` control-flow syntax in templates.

---

## Prerequisites

- **Node.js 20+** and npm.
- The **API running** at `http://localhost:8080` (back end in a separate repository;
  start its compose). The back end already has CORS configured to allow
  `http://localhost:4200` and `http://127.0.0.1:4200`.

---

## How to run

### Option 1 — Local (development)

```bash
cd banco-digital-frontend
npm install
npm start
```

Open **http://localhost:4200**. The app reloads automatically when you save files.

Production build:

```bash
npm run build
```

(Output files go to `dist/banco-digital-frontend/browser`.)

### Option 2 — Docker

This project has its **own** `docker-compose.yml` (Angular build → **nginx**),
independent of the back end. First start the API (via the back end's compose, at
`localhost:8080`); then, in this project's folder:

```bash
docker compose up --build
```

- Front end: **http://127.0.0.1:4200**
- API (separate repo): running at `http://localhost:8080`

> **Use `127.0.0.1` instead of `localhost`.** On Windows, `localhost` may resolve
> to IPv6 (`::1`), where Docker doesn't publish the port, causing the app to hang.
> The front end calls the API directly at `http://127.0.0.1:8080` (IPv4), and the
> back end allows both `localhost:4200` **and** `127.0.0.1:4200` origins in CORS.
> That's why you should open the app at `http://127.0.0.1:4200`.

To build/run the image on its own, without compose:

```bash
docker build -t banco-digital-frontend .
docker run -p 4200:80 banco-digital-frontend
```

---

## Login (mock)

Since the back end doesn't have JWT yet, authentication is **simulated in the
front end**. The **username is the exact account name** in the database
(case-insensitive), and the **password is `123` for everyone**. The accounts are
the ones created by the API's migration:

| Username (name) | Password | Role | Initial balance |
|-----------------|----------|------|-----------------|
| `ADM` | `123` | ADMIN | R$ 1,000,000.00 |
| `Maria Silva` | `123` | USER | R$ 1,000.00 |
| `Joao Souza` | `123` | USER | R$ 500.00 |
| `Ana Pereira` | `123` | USER | R$ 2,500.00 |
| `Carlos Lima` | `123` | USER | R$ 750.00 |
| `Beatriz Costa` | `123` | USER | R$ 3,200.00 |
| `Pedro Santos` | `123` | USER | R$ 1,500.00 |
| `Juliana Almeida` | `123` | USER | R$ 4,800.00 |
| `Rafael Oliveira` | `123` | USER | R$ 980.00 |
| `Fernanda Rocha` | `123` | USER | R$ 6,100.00 |
| `Lucas Martins` | `123` | USER | R$ 250.00 |

`ADM` is an administrator **and** has its own account with a high balance, allowing
both administrative actions and transfer testing.

The session is stored in `localStorage` (it survives a page refresh). Once the back
end has real login, you only need to swap the `AuthService` implementation — its
public interface (`login`, `logout`, `currentUser`, `isAuthenticated`, `isAdmin`)
stays the same.

### Role-based access control (RBAC)

Authorization is enforced by **route guards**, separating what each role can do:

| Action | ADMIN | USER (customer) |
|--------|:-----:|:---------------:|
| List accounts (names) | ✅ | ✅ |
| View **other** accounts' balances | ✅ | ❌ |
| View/use their **own** account and balance | ✅ | ✅ |
| Create account | ✅ | ❌ |
| Edit account | any | own only |
| Delete account | ✅ | ❌ |
| Transfer / Statement | ✅ (has own account) | ✅ |

Guards in place (`src/app/core/guards`):

- **`adminGuard`** → create-account route (`/accounts/new`).
- **`accountAccessGuard`** → detail and edit (`/accounts/:id`, `/accounts/:id/edit`):
  allows the ADMIN or the account owner; blocks everyone else.
- **`customerGuard`** → transfer and statement: requires a customer account
  (blocks the ADMIN, who has no account).

Beyond the guards, the UI hides what each role isn't allowed to see — for USER, the
**balance** column of other accounts and the administrative actions are hidden.

> Note: since the back end doesn't have JWT/roles yet, this authorization happens
> **in the front end**. In production, the same rules must be enforced on the back
> end.

---

## Screens and routes

| Route | Screen | Endpoints consumed |
|-------|--------|--------------------|
| `/login` | Mocked login | — (mock) |
| `/home` | Dashboard with balance and shortcuts | `GET /accounts/{id}` |
| `/transfer` | Transfer (form → confirmation → success) | `GET /accounts`, `POST /transfers` |
| `/statement` | Bank statement (paginated) | `GET /accounts/{id}/movements` |
| `/accounts` | Account list (CRUD) | `GET /accounts`, `DELETE /accounts/{id}` |
| `/accounts/new` | Create account | `POST /accounts` |
| `/accounts/:id` | Detail / balance | `GET /accounts/{id}` |
| `/accounts/:id/edit` | Edit account | `GET` + `PUT /accounts/{id}` |

All routes (except `/login`) are protected by a **route guard** that redirects to
login when there's no session.

---

## Folder architecture

The structure separates responsibilities into **core** (cross-cutting logic),
**shared** (reusable UI), and **features** (screens by domain):

```
src/app
├── core/                      # singletons and application logic
│   ├── models/                # DTOs (API contract) and session models
│   │   ├── account.dto.ts
│   │   ├── transfer.dto.ts
│   │   ├── movement.dto.ts
│   │   ├── page.dto.ts
│   │   └── auth-user.model.ts
│   ├── services/              # HTTP access and state (service layer)
│   │   ├── account.service.ts
│   │   ├── transfer.service.ts
│   │   ├── auth.service.ts    # mock authentication (signals)
│   │   └── toast.service.ts
│   ├── interceptors/
│   │   └── error.interceptor.ts   # handles the API's ApiError globally
│   └── guards/
│       └── auth.guard.ts
├── shared/                    # reusable components/visuals
│   ├── layout/                # toolbar + <router-outlet>
│   └── components/
│       └── confirm-dialog.component.ts
├── features/                  # screens (view layer), one folder per domain
│   ├── auth/                  # login
│   ├── home/                  # dashboard
│   ├── transfer/              # transfer
│   ├── statement/             # statement
│   └── accounts/              # account CRUD
├── app.config.ts              # providers (router, http, animations, locale)
├── app.routes.ts              # routes with lazy loading and guard
└── app.component.ts           # root
```

### Layer separation (service / DTO / view)

The separation is applied explicitly:

- **DTO** (`core/models`): interfaces that **mirror the API contract**
  (`AccountResponse`, `TransferRequest`, `MovementResponse`, `Page<T>`...). They are
  the transport format, with no logic.
- **Service** (`core/services`): hold **all HTTP communication** and the
  building of parameters/headers (e.g., the `Idempotency-Key` is generated in
  `TransferService`). No component talks to `HttpClient` directly.
- **View** (`features/**`): components only handle **presentation and
  interaction**. They send/receive DTOs through the services and expose state via
  signals. They know nothing about URLs or HTTP details.

---

## Design decisions

- **Standalone + lazy loading:** each screen is loaded on demand
  (`loadComponent`), reducing the initial bundle.
- **Signals for local state:** loading state, data, and phases (e.g., the 3-step
  transfer flow) use `signal`/`computed`, without RxJS boilerplate where it isn't
  needed.
- **Error interceptor:** the API's standardized error body (`ApiError`, including
  `fieldErrors`) is translated into friendly messages in a single place and shown
  via a snackbar — insufficient balance, validation, etc.
- **End-to-end idempotency:** the front end generates an `Idempotency-Key` per
  transfer, exercising the back end's idempotency feature and preventing duplicates
  on double clicks / retries.
- **Confirmation before committing:** the transfer has a review step, reducing user
  errors; account deletion uses a confirmation dialog.

---

## Notes

- The API URL is set in `src/environments/environment.ts` (`apiBaseUrl`, pointing
  to `http://127.0.0.1:8080/api/v1`). Adjust it if the back end runs on another
  port/host.
- For balances to show up and transfers to work, the API must be running with a
  seeded database (the migration creates 10 customer accounts + the ADM account).
