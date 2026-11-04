# ShopLite

A small e-commerce order system built as a full-stack practice project:
a **Laravel 12 REST API** and a **React + TypeScript** client, running locally with **Docker Compose**.

```
.
├── backend/            # Laravel 12 API (PHP 8.4, Sanctum)
├── frontend/           # React + TypeScript + Vite client (see frontend/README.md)
├── docker/             # Docker support files (MySQL init scripts)
├── docker-compose.yml
└── .env.example        # Variables used by Docker Compose
```

## Prerequisites

- Docker Engine + Docker Compose v2
- Node.js 22 (optional, only to run the frontend outside Docker)

## Getting started

```bash
# 1. Environment files
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 2. Build and start all services
docker compose up -d --build

# 3. Generate the application key (first run only)
docker compose exec backend php artisan key:generate

# 4. Run the migrations
docker compose exec backend php artisan migrate
```

> Database settings for the API come from `docker-compose.yml` and take precedence over
> `backend/.env`, so the same `backend/.env` also works outside Docker.

## Services

| Service    | URL                          | Notes                                        |
| ---------- | ---------------------------- | -------------------------------------------- |
| API        | http://localhost:8000        | Health check: `GET /api/health`              |
| Frontend   | http://localhost:5173        | Vite dev server with HMR                     |
| phpMyAdmin | http://localhost:8080        | Auto-login as the app user (development only) |
| MySQL      | `localhost:3307`             | Mapped to 3307 to avoid clashing with a local MySQL |

Ports can be changed in the root `.env` (`FORWARD_*` variables).

## Running tests

```bash
docker compose exec backend php artisan test
```

Tests run against a dedicated `shoplite_test` database (created by
`docker/mysql/init/01-test-database.sql`), so `RefreshDatabase` never touches development data.

## Useful commands

```bash
docker compose ps                                  # service status
docker compose logs -f backend                     # follow API logs
docker compose exec backend php artisan <command>  # run artisan inside the container
docker compose restart backend                     # reload after changing backend/.env
docker compose down                                # stop (data is kept in the volume)
docker compose down -v                             # stop and DELETE the database volume
```

> Always run `artisan` **inside the container**. Running it on the host would use a
> different database connection.

## Technical decisions

- **Laravel 12** instead of the latest major, matching what most client projects run in production today.
- **API runs `php artisan serve` with multiple workers** (`PHP_CLI_SERVER_WORKERS` + `--no-reload`).
  Code changes apply immediately; changes to `backend/.env` require `docker compose restart backend`.
- **Container user matches the host UID/GID**, so files created in `storage/` and `vendor/`
  are not owned by root.
- **Health check is a readiness check.** `GET /api/health` runs a `SELECT 1` and returns
  `200 {"status":"ok","database":"ok"}` or `503 {"status":"degraded","database":"down"}`.
  Laravel's built-in `/up` route only confirms the process is alive and does not check
  dependencies. Exception details are logged, never returned to the client.
  The endpoint lives outside `/api/v1` because it is infrastructure, not part of the business contract.
- **CORS restricted by environment.** Allowed origin comes from `FRONTEND_URL` (no `*`).
  Authentication uses Bearer tokens (Sanctum), so `supports_credentials` stays `false`.
- **Isolated test database.** `phpunit.xml` sets `DB_DATABASE=shoplite_test` with
  `force="true"`, because a plain `<env>` does not override variables already defined by Docker.
- Frontend decisions are documented in [`frontend/README.md`](frontend/README.md).

## Troubleshooting (WSL)

- **`Cannot connect to the Docker daemon at .../podman.sock`**: a leftover `DOCKER_HOST`
  points to Podman. Run `unset DOCKER_HOST` and remove any `podman-docker` profile script
  in `/etc/profile.d/`.
- **`permission denied ... docker.sock`**: add your user to the `docker` group
  (`sudo usermod -aG docker $USER`) and restart WSL (`wsl --shutdown`).
- **`Connection reset by peer` right after a restart**: the API is still booting; wait a few seconds.