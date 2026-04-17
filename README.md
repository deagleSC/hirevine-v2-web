# Hirevine web

Next.js application for **Hirevine** recruiters and candidates: job posts, applications, pipeline visualization, and application detail views. It talks to the **Hirevine API** in **hirevine-v2-be** (`NEXT_PUBLIC_API_URL`).

The public marketing site (positioning, FAQ, legal) lives in **hirevine-marketing-website**.

## Related repositories

| Repository | Role |
|------------|------|
| [hirevine-v2-be](../hirevine-v2-be/) | HTTP API, OpenAPI (`/openapi.json`), Inngest (`/api/inngest`) |
| [hirevine-marketing-website](../hirevine-marketing-website/) | Marketing site and SEO |

## Requirements

- **Node.js** ≥ 20
- Running **Hirevine API** (local or deployed) — set `NEXT_PUBLIC_API_URL` in `.env.local` (see `.env.example`)

## Local development

```bash
npm ci
cp .env.example .env.local   # set NEXT_PUBLIC_API_URL to your API (e.g. http://127.0.0.1:8000)
npm run dev
```

Open the URL printed by Next.js (default `http://localhost:3000`).

## App layout

- Source lives under **`src/`** (`src/app`, `src/components`, etc.).
- Root layout sets fonts and theme; pages include recruiter/candidate flows under `src/app/(app)/`.

## Hiring report (pipeline Node 3) UI

When an application completes **Node 3**, the API stores the full hiring report as **Markdown** on `NodeResult.reasoning`. The recruiter application detail page renders that field with **`react-markdown`** + **GFM** (`remark-gfm`), with raw HTML ignored and links restricted. Markdown typography uses **`@tailwindcss/typography`** (`prose` in `src/app/globals.css`).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Next dev server |
| `npm run build` | Production build |
| `npm run start` | Production server |
| `npm run lint` | ESLint |

## License

Private project unless otherwise stated by the repository owner.
