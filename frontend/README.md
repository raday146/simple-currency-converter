# Frontend — React client

A Vite-built React application that lets users convert currencies against the NestJS API. Styling is Tailwind CSS. Package management is **Yarn only** (`yarn.lock`, `yarn install --frozen-lockfile` in Docker).

## Technical stack

| Layer | Choice |
|-------|--------|
| UI | React 18 |
| Build | Vite + TypeScript |
| Styling | Tailwind CSS |
| HTTP | Native `fetch` via `src/api/exchangeApi.ts` |
| Package manager | Yarn |

Production images use a multi-stage Dockerfile: Node builds `dist/`, then Nginx serves static files and proxies `/api/*` to the backend (see `nginx.conf`).

## Project layout

```
src/
├── api/
│   └── exchangeApi.ts       # fetch wrappers for /api/currencies and /api/convert
├── hooks/
│   ├── useCurrencies.ts     # initial currency list load
│   └── useConversion.ts     # convert action, result, alerts
├── types/
│   └── api.ts               # shared interfaces + error presentation mapping
├── components/
│   ├── CurrencyConverter.tsx    # shell composition
│   ├── ConverterForm.tsx        # memoized form (amount, from, to)
│   ├── ConversionResultPanel.tsx  # memoized result + loading line
│   ├── SystemAlert.tsx            # persistent upstream/500 alerts
│   ├── ErrorBanner.tsx            # dismissible banner (e.g. 404)
│   ├── AmountInput.tsx
│   └── CurrencySelect.tsx
├── App.tsx
└── main.tsx
```

## State optimization and render protection

A common pitfall: lifting conversion `result` and `isConverting` into the same component as the form causes the entire card — inputs, header, buttons — to re-render on every submit.

We split concerns:

1. **`useConversion`** holds `result`, `isConverting`, `systemAlert`, and `bannerError`. Only children that subscribe to those values update.
2. **`ConverterForm`** is wrapped in `React.memo` and owns local form state (amount, currency picks, inline validation errors). Submitting does not unmount or disable inputs; only the Convert button reflects loading.
3. **`ConversionResultPanel`** is also memoized. It shows the previous result while a new conversion runs (`Updating conversion…`) instead of clearing the panel and flashing empty state.

The form shell and layout stay stable; the result block and alert regions are what change.

## Custom hooks

### `useCurrencies`

Runs once on mount, fetches `GET /api/currencies`, and exposes `currencies`, `isLoading`, and error state split by severity (`systemAlert` vs `bannerError` via `getErrorPresentation`).

### `useConversion`

Exposes `convert(payload)` which calls `POST /api/convert`, updates `result` on success, and routes failures to the right UI channel without touching form state.

Client-side validators (`validateAmount`, `validateCurrencyCode`) catch obvious mistakes before a network round-trip.

## Typed integration

`src/types/api.ts` mirrors backend contracts:

- `CurrenciesResponse`, `ConvertRequest`, `ConvertResponse`
- `ApiErrorBody` — matches the NestJS filter JSON shape
- `ApiError` — thrown by `exchangeApi.ts` on non-OK responses
- `getErrorPresentation()` — maps status codes to UI behavior

The frontend does not guess error shapes; it reads `statusCode` and `message` from the same envelope the backend always returns.

## Responsive architecture (mobile-first)

Tailwind utilities drive layout without custom breakpoints scattered in JS:

- **Mobile** — single column, full-width buttons, compact padding (`p-4`, `text-xl` title).
- **Tablet (`sm` / `md`)** — form fields move into a two-column grid; buttons sit in a row.
- **Desktop** — content capped at `max-w-2xl`, centered in the viewport via `App.tsx` flex layout.

Touch targets use comfortable vertical padding (`py-2.5`) on primary actions.

## Human-centric error UX

Errors are mapped by HTTP status, not generic catch-all toasts:

| Status | UI reaction |
|--------|-------------|
| **400** | Red inline text under the relevant field (amount / currency). Comes from `ValidationPipe` messages or client-side validation. |
| **404** | Dismissible banner: *"The requested currency code is unsupported."* |
| **502** | Persistent `SystemAlert` at the top of the card: *"Upstream exchange network down. Please try again later."* |
| **500** | `SystemAlert` with a generic unexpected-error message |

The app does not white-screen on API failure; users always get contextual feedback.

## Commands

```bash
yarn install
yarn dev       # http://localhost:2002, proxies /api → localhost:2000
yarn build     # production bundle in dist/
```

For the full stack in containers, use `docker compose up --build` from the repository root (UI at port **2002**).
