# telemed-ia-front

Shell container for **TeleMed IA** web interfaces.

Part of team `telemed-ia`, Grupo 2.

## What this repo is

This is the shell. It presents as a single application what are actually
several independent portals, and it concentrates everything that must not
be repeated:

- The single HTTP client of the whole system.
- The session and token handling.
- The navigation, the layout and the common components.
- The single place that decides which message a user sees per HTTP status.
- The 404 page.

Each domain builds its own portal (`<abbr>-<domain>-portal`) and consumes
the shell's contracts through **Native Federation**. Per norm 5.4.1, a portal
that implements its own HTTP client or session handling is a serious breach.

## What it exposes to every portal

The `federation.config.js` exposes three modules:

| Module | Import path | Responsibility |
|---|---|---|
| `apiClient` | `shell/apiClient` | HTTP calls against `/api/v1` |
| `apiError` | `shell/apiError` | The `ApiError` type and timeout constants |
| `session` | `shell/session` | Token storage and expiry check |

### How a portal consumes them

```typescript
import { ApiClientService } from 'shell/apiClient';
import { SessionService } from 'shell/session';
import { ApiError } from 'shell/apiError';

export class SomeService {
  private readonly api = inject(ApiClientService);
  private readonly session = inject(SessionService);

  loadProfile() {
    return this.api.get<Profile>('/patients/me');
  }

  createProfile(payload: unknown, key: string) {
    // `post` requires an Idempotency-Key (norm 5.4.2)
    return this.api.post<Profile>('/patients', payload, key);
  }
}
```
The shell handles, without the portal knowing:

* Attaching `Authorization: Bearer <token>` from the session.

* Generating and sending `X-Correlation-Id` on every request.

* Enforcing a 10-second timeout.

* Closing the session on any `401`.

* Normalising every failure to `ApiError`.

### How to add a new domain portal
1. The domain team creates telemed-ia-<domain>-portal (Angular 21).

2. Its federation.config.js exposes a ./routes module.

3. In this repository:

	* Add a <domain>.remote.ts next to the existing patient.remote.ts.

	* Add the route in src/app/app.routes.ts.

	* Add the remote URL to public/federation.manifest.json.

### Local development
```typescript
npm install
npm start         # http://localhost:4200
npm run build     # dist/telemed-ia-front/
```
### Docker
```typescript
docker network create platform
docker compose -f deploy/compose.yml up -d --build
```
> The service is reachable only from inside the `platform` network.

### Sign-in during development
The shell ships a development-only sign-in page where a user pastes a token.
Tokens are produced in `develop` with:
```typescript
../telemed-ia-infra/scripts/dev-token.sh <user_id> [minutes]
```
> This page is replaced by the identity portal, and must never reach `main`.

### Repository rules
The HTTP client and the session live here and only here (norm 5.4.1).

The three permanent branches never receive a direct commit.

Promotion is by re-application (`git cherry-pick -x`).

## Related documentation
* `telemed-ia-docs/00-governance/branching-policy.md`

* `telemed-ia-docs/05-architecture/decisions/records/`

* Annex H of the repo norm.

* `CONTRIBUTING.md`