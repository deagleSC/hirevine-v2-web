# Hirevine Web (`hirevine-v2-web`)

Next.js (App Router) frontend for the [Hirevine API](../hirevine-v2-be) (`hirevine-v2-be`): candidates browse jobs and apply; recruiters manage organization, jobs, and applications.

## Requirements

- Node.js 20+ (match your team standard; Next 16 runs on current LTS)
- Running API — see the backend repo for MongoDB, env vars, and `npm run dev`

## Setup

```bash
cp .env.example .env.local
```

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_API_URL` | Base URL of the API (default `http://127.0.0.1:8000`) |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL for metadata (optional locally; set on Vercel) |

The browser client uses **`withCredentials: true`** so session cookies from the API are sent on same-site or configured cross-origin requests.

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Ensure the API is up and that `hirevine-v2-be` **`CORS_ORIGIN`** includes this origin (e.g. `http://localhost:3000`) so cookies work.

Other scripts: `npm run build`, `npm run lint`, `npm run format`.

## Production (Vercel checklist)

1. Create a Vercel project for this repo; set **`NEXT_PUBLIC_API_URL`** to your deployed API (HTTPS).
2. Set **`NEXT_PUBLIC_SITE_URL`** to the production web URL (no trailing slash).
3. On the API, set **`CORS_ORIGIN`** to that same web origin and align cookie **`SameSite`** / secure flags for HTTPS cross-subdomain or same-site as needed.
4. Deploy the API first, then the web app, and verify login and recruiter flows against production.

## Documentation

Engineering plan and parity notes: [`DEV_PLAN.md`](./DEV_PLAN.md).

API contract: OpenAPI at `{API_URL}/openapi.json` (e.g. `http://127.0.0.1:8000/openapi.json` when running locally).
