# SaaS Website Monorepo

Diese Repository-Struktur ist als Monorepo aufgebaut und trennt Frontend, Backend sowie gemeinsame Pakete klar.

## Struktur

- `apps/web` – Next.js-Frontend
- `apps/api` – Node/Express-Backend
- `packages/db` – Datenbank-Schema und Migrationen
- `packages/shared` – geteilte Types/Utilities

## Voraussetzungen

- Node.js 20+
- pnpm 9+
- Docker (optional für lokale Infrastruktur)

## Erste Schritte

```bash
pnpm install
cp .env.example .env
pnpm dev
```

## Einheitliche Root-Scripts

- `pnpm dev` – startet alle `dev`-Skripte der Workspaces
- `pnpm build` – führt alle `build`-Skripte aus
- `pnpm lint` – führt alle `lint`-Skripte aus
- `pnpm test` – führt alle `test`-Skripte aus

## Docker

Die Datei `docker-compose.yml` bringt eine Postgres-Datenbank für lokale Entwicklung hoch:

```bash
docker compose up -d
```
