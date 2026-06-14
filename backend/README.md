# Backend — NestJS API

The server exposes two endpoints under the global `/api` prefix: list currencies and convert amounts. All USD-based rates are fetched from the upstream provider, cached for 60 seconds, and reused across requests.

## Module design

The `exchange-rate` feature is a self-contained NestJS module. The **controller** and **module** sit at the feature root — they are the public entry points. Everything else is grouped by responsibility:

```
src/exchange-rate/
├── exchange-rate.module.ts
├── exchange-rate.controller.ts
├── exchange-rate.service.ts
├── cache/
│   └── exchange-rate.cache.ts
├── providers/
│   └── exchange-rate-api.client.ts
├── dto/
│   └── convert-currency.dto.ts
├── types/
│   └── external-exchange-rate-response.ts
└── __tests__/
    ├── exchange-rate.cache.spec.ts
    └── exchange-rate.service.spec.ts
```

- **`cache/`** — TTL logic and in-memory storage. No HTTP knowledge.
- **`providers/`** — upstream HTTP client (`fetch` to open.er-api.com). Isolated so the service stays testable with mocks.
- **`dto/`** — request validation via `class-validator` (wired through the global `ValidationPipe`).
- **`types/`** — shapes for upstream JSON and internal use.
- **`__tests__/`** — unit tests for cache TTL and conversion math.

`ExchangeRateService` orchestrates cache → client → conversion. The controller only maps HTTP to DTOs and service calls.

## Core engineering highlights

### Cache policy (60-second TTL)

Rates are stored under a single key in a plain `Map`. On each read:

1. If `Date.now() - fetchedAt <= 60_000`, the cached entry is returned — **no upstream call**.
2. Otherwise the entry is treated as stale, the client fetches fresh data, and the cache is rewritten.

`ExchangeRateService.getFreshRates()` logs every decision to stdout so you can verify behavior in Docker:

```
[Cache] 🟢 HIT - Serving exchange rates from memory. TTL remaining: 42 seconds.
[Cache] 🔴 MISS - Fetching fresh exchange rates from upstream API provider.
```

Conversion formula (all rates are USD-based):

```
result = amount × (rates[to] / rates[from])
```

### Explicit error boundaries

A global `HttpExceptionFilter` normalizes all HTTP errors to:

```json
{ "statusCode": number, "message": string, "error": string }
```

| Status | When | Source |
|--------|------|--------|
| **400** | Invalid or missing body fields (negative amount, bad shape, unknown properties) | Global `ValidationPipe` on DTOs |
| **404** | `from` or `to` code not present in the fetched `rates` map | `NotFoundException` in `ExchangeRateService` |
| **502** | Upstream unreachable, non-OK HTTP, or `result !== "success"` | `BadGatewayException` in `ExchangeRateApiClient` |
| **500** | Anything else uncaught | `HttpExceptionFilter` fallback |

Unexpected crashes never return raw stack traces to the client.

## API reference

### `GET /api/currencies`

```json
{
  "base": "USD",
  "currencies": ["EUR", "GBP", "ILS", "USD"],
  "lastUpdated": "2026-06-14T00:02:31.000Z"
}
```

### `POST /api/convert`

Request:

```json
{ "amount": 100, "from": "USD", "to": "ILS" }
```

Response:

```json
{
  "amount": 100,
  "from": "USD",
  "to": "ILS",
  "rate": 2.925152,
  "result": 292.5152,
  "lastUpdated": "2026-06-14T00:02:31.000Z"
}
```

## Security and configuration

- **Input validation** — `ValidationPipe` with `whitelist` and `forbidNonWhitelisted` strips unknown fields and rejects bad input before it reaches business logic.
- **No hardcoded secrets** — `EXTERNAL_API_URL` and `PORT` come from environment variables (see root `.env.example`).
- **Network isolation in Docker** — backend and frontend share a bridge network; the UI reaches the API through Nginx proxy, so the browser talks to one origin in production.

`helmet` and explicit CORS middleware are not wired in this codebase. For local dev, the Vite proxy handles same-origin API calls; in Docker, Nginx proxies `/api` to the backend. Add `helmet` and environment-scoped CORS if you expose the API directly to browsers on a different host.

## Commands

```bash
npm install
npm run start:dev    # watch mode, port 2000
npm test             # unit tests (cache + service)
npm run build        # compile to dist/
```
