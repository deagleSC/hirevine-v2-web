# Hirevine web

Next.js app for **Hirevine** recruiters and candidates: job posts, applications, pipeline visualization, and application detail views backed by the **Hirevine API** service (`hirevine-v2-be`).

## Requirements

- **Node.js** ≥ 20
- Running **API** (local or deployed) — set `NEXT_PUBLIC_API_URL` in `.env.local` (see `.env.example`)

## Local development

```bash
npm ci
cp .env.example .env.local   # then set NEXT_PUBLIC_API_URL
npm run dev
```

Open the URL printed by Next.js (default `http://localhost:3000`).

## Hiring summary (Node 3) UI

When an application completes **Node 3**, the API stores the full hiring report as **Markdown** on `NodeResult.reasoning`. The recruiter application detail page renders that field with **`react-markdown`** + **GFM** (`remark-gfm`), with raw HTML ignored and links restricted. Typography for Markdown uses **`@tailwindcss/typography`** (`prose` classes in `src/app/globals.css`).

## Scripts

| Command        | Description        |
| -------------- | ------------------ |
| `npm run dev`  | Next dev server    |
| `npm run build`| Production build   |
| `npm run start`| Production server  |
| `npm run lint` | ESLint             |

## Related

- API repo: `hirevine-v2-be` — OpenAPI at `/openapi.json`, Inngest at `/api/inngest`.
