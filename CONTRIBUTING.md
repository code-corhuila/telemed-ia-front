# Contributing

> Short guide for contributing to this repository.

---

## Branch model

Three permanent branches. **None accepts a direct commit.**

```text
develop  <--PR--  feat/... fix/... chore/...
qa       <--PR--  promote/...
main     <--PR--  release/...  hotfix/...
```

> Promotion happens by re-application using git cherry-pick -x. Permanent branches are never merged into each other.

## Main branch
`main` requires 1 approval from `@ariel5253`

On `develop` and `qa`, the team requires 1 approval.
---
## Workflow
### Add a change
```Typescrypt
git switch develop
git pull origin develop
git switch -c chore/<short-description>
# make your changes
git add .
git commit -m "chore(front): <short description>"
git push -u origin chore/<short-description>
```
> Open a Pull Request against `develop`.

### Promote to `qa`
```Typescript
git switch qa
git pull origin qa
git switch -c promote/<short-description>
git cherry-pick -x <sha-of-the-commit-in-develop>
git push -u origin promote/<short-description>
```
### Promote to main
```Typescript
git switch main
git pull origin main
git switch -c release/<version>
git cherry-pick -x <sha-of-the-commit-in-qa>
git push -u origin release/<version>
```

### Branch naming
| **Prefix** | **Targets** |
| :--------- | :---------- |
| `feat/`    | `develop`   |
| `fix/`     | `develop`   |
| `chore/`   | `develop`   |
| `promote/` | `qa`        |
| `release/` | `main`      |
| `hotfix/`  | `main`      |

---

## Commit convention
### Conventional Commits, scope front:

```text
feat(front): expose a new module in federation config
fix(front): handle null token in the interceptor
chore(front): upgrade Angular to 21.3
docs(front): document how to add a portal
```
> Types allowed: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `perf`.
> Keep messages short, imperative, in English.

---

### What lives in this repo
* The HTTP client (`src/app/core/http/`).

* The session (`src/app/core/auth/`).

* The layout, routing and 404.

* The federation manifest (`public/federation.manifest.json`).

* The `federation.config.js` that exposes apiClient, session and apiError.

### What does NOT live in this repo
* Any domain portal. Each domain builds its own `<domain>-portal`.

* Any domain logic, model, or HTTP endpoint.

* Any database schema (that is `-db`).

---

### Adding a domain portal
1. Domain team creates telemed-ia-<domain>-portal (Angular 21).

2. The portal exposes ./routes in its own federation.config.js.

3. In this repo:

    * Add src/app/remotes/<domain>.remote.ts.

    * Add the route to src/app/app.routes.ts.

    * Add the URL to public/federation.manifest.json.

4. Test that the shell loads the portal, and that a broken portal shows the
remote-unavailable component without taking down the shell.

## Repository rules
* The HTTP client and the session live here and only here (norm 5.4.1).

* A portal that duplicates them is a serious breach.

* The three permanent branches never receive a direct commit.

* Every PR follows .github/pull_request_template.md.

* npm run build must succeed before opening a PR.

---

## Related documentation
* `telemed-ia-docs/00-governance/branching-policy.md`

* `telemed-ia-docs/05-architecture/decisions/records/`

* Annex H of the repo norm.

* `README.md`