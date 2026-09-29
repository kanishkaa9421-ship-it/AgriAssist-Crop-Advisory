# AgriAssist Crop Advisory

AgriAssist helps farmers track active crops and receive structured, practical AI guidance for crop health, weather stress, soil nutrition, and harvest decisions.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/agriassist/` — React + Vite web app and farmer-facing routes
- `artifacts/api-server/src/routes/agri.ts` — crop, dashboard, history, and Gemini advisory API
- `lib/api-spec/openapi.yaml` — source of truth for the API contract
- `lib/db/src/schema/agriculture.ts` — Drizzle schema for users, crops, and advisory logs
- `artifacts/agriassist/src/index.css` — AgriAssist visual tokens and responsive theme

## Architecture decisions

- The API uses the shared monorepo server and generated OpenAPI hooks so frontend requests and backend validation stay aligned.
- The MVP uses the `x-user-id` header with a stable demo user fallback; every crop and advisory query is still scoped by that user ID.
- Gemini is called server-side with `@google/genai`, a strict JSON response schema, and a five-request-per-fifteen-minutes advisory limiter.
- The dashboard starts with a small seeded farm portfolio so the first view demonstrates the product without requiring manual setup.

## Product

- Farmer dashboard with crop counts, weather context, recent advisories, and attention signals
- Crop portfolio management with planting dates, acreage, categories, add, and remove flows
- New advisory workflow for disease, weather, nutrition, and market questions
- Saved advisory detail pages and searchable advisory history

## User preferences

None recorded.

## Gotchas

- Update `lib/api-spec/openapi.yaml` first, then run `pnpm --filter @workspace/api-spec run codegen` before using new client hooks or server schemas.
- The app requires `DATABASE_URL` and `GEMINI_API_KEY`; the latter is only consumed by the server and must never be exposed in the frontend.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
