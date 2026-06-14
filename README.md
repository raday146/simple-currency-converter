# Simple Currency Converter

Full-stack currency converter with a NestJS backend and React frontend, orchestrated with Docker Compose.

## Prerequisites

- Docker and Docker Compose
- Node.js 20+ (for local development)
- Yarn (frontend)
- npm (backend)

## Quick start (Docker)

```bash
cp .env.example .env
docker compose up --build
```

Open [http://localhost:8080](http://localhost:8080). The frontend proxies `/api/*` to the backend.

## Local development

### Backend (npm)

```bash
cd backend
npm install
npm run start:dev
```

API runs at [http://localhost:3000/api](http://localhost:3000/api).

### Frontend (yarn)

```bash
cd frontend
yarn install
yarn dev
```

Dev server runs at [http://localhost:5173](http://localhost:5173) with API proxy to the backend.

## Tests and builds

```bash
cd backend && npm test && npm run build
cd frontend && yarn build
```

## API

- `GET /api/currencies` — list supported currency codes
- `POST /api/convert` — convert an amount between currencies
