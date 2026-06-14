# Frozen System Specification: Dockerized Currency Converter

## 1. System Contracts & Math

Upstream API: `https://open.er-api.com/v6/latest/USD`

Formula:
- Result = amount × (rates[to] / rates[from])
- Exchange Rate = rates[to] / rates[from]

### Backend REST Contract

- `GET /api/currencies` → `200 OK`
- `POST /api/convert` → `201 Created` / `200 OK`

## 2. End-to-End Error Mapping Matrix

| Scenario | HTTP Status | Backend | Frontend |
|----------|-------------|---------|----------|
| Missing/Negative Input | 400 | ValidationPipe | Inline field error |
| Unsupported Code | 400 | Service validation | Banner: "Currency code [XYZ] is not supported." |
| Upstream API Dead | 502 | ApiClient catch | Banner: "Exchange network unavailable. Please try again later." |
| Fatal Server Crash | 500 | HttpExceptionFilter | Banner: "An unexpected error occurred." |

## 3. Core Implementation Architecture

### Cache Mechanics
- Storage: plain Map with `ExternalExchangeRateResponse` + `fetchedAt: number`
- TTL: strict 60 seconds
- Logic: synchronous stale check, immediate fetch on expiry

### Docker Layout
- Root `docker-compose.yml` with bridge network
- `backend/Dockerfile`: multi-stage Node-Alpine, port 2000
- `frontend/Dockerfile`: Vite build + Nginx on port 80 (host 2002), `/api/*` → `http://backend:2000`
