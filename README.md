# Simple Currency Converter

A Dockerized, full-stack currency converter. NestJS serves the API; React (Vite + Tailwind) handles the UI. Rates come from [open.er-api.com](https://open.er-api.com/v6/latest/USD), cached in memory on the server for 60 seconds.

## Project overview

You enter an amount, pick source and target currencies, and get a converted result with the applied rate. The backend owns rate fetching, caching, and conversion math. The frontend is a thin, typed client that talks to `/api/*` and maps HTTP errors into readable UI feedback.

In Docker, the frontend container runs Nginx: it serves the built React app and proxies API traffic to the backend on the internal network.

## Architectural choices

### Monorepo layout

`/backend` and `/frontend` live in one repository, but each service has its own Dockerfile, dependency manager, and build pipeline. You develop and version them together without coupling runtime — they only talk over HTTP. That keeps the workflow simple while preserving service boundaries.

### npm (backend) + Yarn (frontend)

NestJS and its ecosystem default to npm; we kept that on the server side. The client uses Yarn with a checked-in lockfile and `yarn install --frozen-lockfile` in Docker for reproducible, fast installs. Two package managers, two concerns — no need to force one tool on both halves.

### Custom in-memory cache (no Redis)

Exchange rates do not need a distributed cache for this scope. A single-key, in-process `Map` with a 60-second TTL is enough: zero extra infrastructure, no network hop on a hit, easy to verify in `docker logs`. If traffic or multi-instance deployment grows, Redis becomes a sensible upgrade — it is not required here.

## Quick start

**Prerequisites:** Docker and Docker Compose.

```bash
cp .env.example .env
docker compose up --build
```

| Service | URL |
|---------|-----|
| **UI** | [http://localhost:2002](http://localhost:2002) |
| **API** | [http://localhost:2000/api](http://localhost:2000/api) |

Example:

```bash
curl http://localhost:2000/api/currencies
curl -X POST http://localhost:2000/api/convert \
  -H "Content-Type: application/json" \
  -d '{"amount":100,"from":"USD","to":"ILS"}'
```

To confirm caching, call `/api/currencies` twice within 60 seconds and check backend logs for a green `HIT` line on the second request.

## Local development (without Docker)

**Backend** — from `/backend`:

```bash
npm install
npm run start:dev
```

Runs at `http://localhost:2000/api`.

**Frontend** — from `/frontend`:

```bash
yarn install
yarn dev
```

Runs at `http://localhost:2002`; Vite proxies `/api` to the backend.

## Repository layout

```
/
├── backend/          NestJS API, cache, upstream client
├── frontend/         React UI, Nginx config for production image
├── docker-compose.yml
└── .env.example
```

## Further reading

- [backend/README.md](./backend/README.md) — module layout, cache policy, error codes
- [frontend/README.md](./frontend/README.md) — hooks, render isolation, responsive UI, error UX
