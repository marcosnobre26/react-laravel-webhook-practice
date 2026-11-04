# ShopLite — Frontend

React 18+ + TypeScript + Vite client for the ShopLite orders API.

At this stage the app performs a **health check** against the API and shows whether
the API and its database are reachable.

## Stack

- React + TypeScript
- Vite (dev server and build)
- ESLint (`typescript-eslint` + `eslint-plugin-react-hooks`)

## Prerequisites

- **Docker + Docker Compose** (recommended), or
- **Node.js 22** to run outside Docker (see `.nvmrc`; with nvm: `nvm use`)

## Environment variables

Copy the example file and adjust if needed:

```bash
cp .env.example .env
```

| Variable       | Example                 | Description                    |
| -------------- | ----------------------- | ------------------------------ |
| `VITE_API_URL` | `http://localhost:8000` | Base URL of the Laravel API    |

> `VITE_API_URL` is read **by the browser**, so it must be a URL reachable from your
> machine (`localhost:8000`), not the Docker service name (`backend:8000`).
>
> Only variables prefixed with `VITE_` are exposed to the client, and everything in
> the bundle is public. **Never put secrets here.**

Vite reads `.env` only on startup. After changing it, restart the dev server
(`docker compose restart frontend`).

## Running

### With Docker (from the repository root)

```bash
docker compose up -d
```

The app is available at http://localhost:5173.

### Without Docker

```bash
npm install
npm run dev
```

## Scripts

| Command           | Description                              |
| ----------------- | ---------------------------------------- |
| `npm run dev`     | Start the dev server with HMR            |
| `npm run build`   | Type-check (`tsc -b`) and build to `dist/` |
| `npm run lint`    | Run ESLint                               |
| `npm run preview` | Serve the production build locally       |

## Project structure

```
src/
├── api/
│   └── health.ts      # HTTP layer: fetch, status handling, runtime validation
├── types/
│   └── health.ts      # API contract types
├── env.d.ts           # Typing for import.meta.env
├── App.tsx            # Health status screen
├── App.css
├── index.css
└── main.tsx
```

## Technical decisions

- **TypeScript pinned to `~6.0`.** The Vite template ships TypeScript 7, but
  `typescript-eslint` currently supports `<6.1`. The version was pinned instead of
  installing with `--force` / `--legacy-peer-deps`, which would hide the conflict.
- **HTTP logic outside the component.** `src/api/health.ts` owns the request;
  `App.tsx` only manages state and rendering (single responsibility).
- **`503` is an expected response.** `fetch` does not reject on HTTP errors. A `503`
  from `/api/health` means "API up, database down", so it is rendered as a degraded
  state instead of a generic error. Any other non-2xx status is treated as an error.
- **Runtime validation of the response.** TypeScript types are erased at runtime, so
  the payload is checked with a type guard (`isHealthResponse`) before use.
- **UI state as a discriminated union** (`loading | success | error`), which makes
  impossible states (e.g. loading and error at the same time) unrepresentable.
- **Request cancellation.** The effect uses an `AbortController` and aborts on
  cleanup, avoiding duplicate requests under `StrictMode` and stale responses
  overwriting newer ones.
- **Accessibility.** The status message uses `role="status"` so screen readers
  announce changes; status is conveyed by text, not color alone; semantic landmarks
  and headings; visible keyboard focus (`:focus-visible`).