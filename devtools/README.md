# Hillcode · Citron CRM

Interactive dev menu and scriptable CLI for this repo (Frappe CRM / Vue frontend / Docker). Zero npm dependencies for Hillcode itself — only Node.js to run the menu.

## Quick start

```bash
npm run hc
# or
npm run hillcode
```

First time:

```bash
npm run hillcode -- --cmd setup
# setup clones @framework/ui to ../frappe/ui automatically
# then menu 2 (Docker full stack), then menu 1 (frontend dev)
```

## Menu

| Key | Command     | What it does                                      |
| --- | ----------- | ------------------------------------------------- |
| 0   | setup       | `npm install` + `yarn install` in `frontend/`     |
| 1   | dev         | Vite dev server (`frontend/`, foreground)         |
| 2   | docker      | `docker compose up -d --build` in `docker/`       |
| 3   | docker-logs | Tail the `frappe` service logs                    |
| 4   | doctor      | Check Node, Yarn, deps, Docker, linked packages   |
| 5   | test        | `yarn test:run` in `frontend/`                    |
| 6   | test:e2e    | Playwright e2e tests                              |
| 7   | docker-down | `docker compose down`                             |

Docker default login: **Administrator** / **admin** at [http://crm.localhost:8000/crm](http://crm.localhost:8000/crm).

Frontend-only dev (with bench/docker backend): [http://crm.localhost:8080/crm](http://crm.localhost:8080/crm).

## CLI (non-interactive)

```bash
npm run hillcode -- --cmd dev
npm run hillcode -- --cmd docker
npm run hillcode -- --cmd doctor
npm run hillcode -- --setup    # same as --cmd setup
```

## Notes

- **Setup** sparse-clones `ui/` from [frappe/frappe](https://github.com/frappe/frappe) (`develop`) into `../frappe/ui` as `@framework/ui`.
- **Full app** needs Frappe on port **8000**. Use menu 2 (Docker) or a local [Frappe Bench](https://docs.frappe.io/framework/user/en/installation). Frontend-only Vite runs on **8080** but API proxy errors are expected without the backend.
- Install [Docker Desktop](https://www.docker.com/products/docker-desktop/) if `doctor` reports Docker missing.
- First Docker boot runs bench init and can take several minutes.
