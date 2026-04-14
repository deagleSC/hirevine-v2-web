# Hirevine Web — Development Plan

This document is the engineering plan for **`hirevine-v2-web`**: a Next.js (App Router) frontend for the [Hirevine API](../hirevine-v2-be) (`hirevine-v2-be`). Implementation should **mirror the structure and conventions of [`rentfit-v1-web`](../rentfit-v1-web)** unless a Hirevine-specific deviation is called out below.

**Related repositories**

| Repo | Role |
|------|------|
| `hirevine-v2-be` | Express + MongoDB API, OpenAPI at `/openapi.json`, cookie + JWT auth |
| `rentfit-v1-web` | Reference UI: Next 16, shadcn (Base UI / `base-nova`), Zustand, Zod, axios client, `ai-elements`, layouts |
| `hirevine-v2-web` | This app (greenfield; currently scaffold only) |

---

## 1. Goals and scope

### Product goals

- **Candidates:** Browse active jobs, upload resume (Blob URL), apply, track applications, take pipeline quizzes, view status and outcomes.
- **Recruiters / admins:** Manage organization, create/edit jobs, trigger **generate-pipeline** (AI), review applications (filters, pagination), inspect pipeline nodes and final report.
- **Shared:** Email/password auth, session via **httpOnly cookie** + optional Bearer from `accessToken` in login response (match backend behavior).

### Technical goals

- Align folder layout, naming, and cross-cutting patterns with **`rentfit-v1-web`** for maintainability across products.
- Use **Next.js + TypeScript**, **shadcn** with **Base UI** (same `components.json` style as RentFit: `base-nova`, `rsc: true`), **Zustand** for client session and UI state, **Zod** (+ **react-hook-form** / **@hookform/resolvers** as in RentFit) for forms.
- Adopt **Vercel AI Elements** the same way RentFit does: composable primitives under `src/components/ai-elements/` for any streaming / rich AI UI (see §6).
- Deploy on **Vercel** with `NEXT_PUBLIC_API_URL` pointing at the deployed API; ensure **CORS** and cookie **SameSite** settings on the API match cross-origin production (see `hirevine-v2-be` README / `.env.example`).

---

## 2. Reference architecture (from `rentfit-v1-web`)

Copy the **skeleton** and conventions from RentFit; replace domain modules (search, map, chat) with Hirevine domains (jobs, applications, org).

| Area | RentFit pattern | Hirevine adaptation |
|------|-----------------|---------------------|
| Entry | `src/app/layout.tsx` — font, `ThemeProvider`, `AuthProvider`, `Toaster`, `globals.css` | Same stack; Hirevine branding, metadata, remove RentFit-only scripts (e.g. tweakcn) unless desired |
| Auth gate | `AuthProvider` — bootstrap `getMe`, `protectedPrefixes`, `authRoutes`, redirect | Define `protectedPrefixes` for `/recruiter`, `/candidate` (or role-based segments), public job catalog |
| API | `src/lib/configs/api.ts` + `src/lib/utils/api-client.ts` (axios, `withCredentials: true`, 401 → clear session) | Same client; new `API_ROUTES` for Hirevine paths (§4) |
| State | `src/store/zustand/stores/*`, `actions/*`, `services/*`, `src/store/index.ts` barrel | Start with `auth-store` + `auth-actions` + `auth-services`; add `ui-store` or feature stores only when needed |
| Forms | `src/lib/validations/*.schema.ts` (Zod) + shadcn form primitives | `auth.schema.ts` with roles `recruiter` \| `candidate` \| `admin` (match API) |
| Layout | `dashboard-layout.tsx` + `AppSidebar` + shadcn `Sidebar` | Two sidebars or one dynamic nav keyed by `user.role` |
| UI | `src/components/ui/*` (shadcn) | Init shadcn with **same** `style: "base-nova"`; add components with CLI as needed |
| AI UI | `src/components/ai-elements/*` | Keep folder; use for Hirevine-specific surfaces (§6) |
| Utils | `lib/utils.ts` (cn), `handleError.ts`, `clear-client-session.ts` | Port verbatim where behavior matches |

**Files to use as templates (non-exhaustive)**

- `src/app/layout.tsx`, `error.tsx`, `not-found.tsx`
- `src/components/theme-provider.tsx`, `src/components/ui/sonner.tsx`
- `src/lib/utils/api-client.ts`, `src/lib/utils/handleError.ts`
- `src/components/layout/auth-layout.tsx`, `dashboard-layout.tsx`
- `src/components/navigation/app-sidebar.tsx` (structure only; change nav items)

---

## 3. Bootstrap checklist (Phase 0)

Complete before feature work.

1. **Create Next app** — Match RentFit major versions where practical: **Next 16**, **React 19**, **TypeScript 5**, **Tailwind 4** (`@tailwindcss/postcss`), **ESLint** `eslint-config-next`.
2. **Path alias** — `tsconfig.json`: `"@/*": ["./src/*"]` (same as RentFit).
3. **shadcn** — Run `npx shadcn@latest init` (or align with RentFit’s `shadcn` package version). Set **`style`: `base-nova`**, **`tsx`**, **`rsc`**, **`iconLibrary`: `lucide`**, CSS variables, `components.json` aliases matching RentFit (`@/components`, `@/lib`, `@/hooks`).
4. **Dependencies** (align with RentFit + Hirevine needs)  
   - Core: `next`, `react`, `react-dom`, `typescript`, `tailwindcss`, `@tailwindcss/postcss`, `postcss`.  
   - UI: `shadcn` CLI deps already pulled by components; `next-themes`, `sonner`, `class-variance-authority`, `clsx`, `tailwind-merge`.  
   - Data / forms: `axios`, `zustand`, `zod`, `react-hook-form`, `@hookform/resolvers`.  
   - AI (when streaming): `ai`, `@ai-sdk/react` (versions compatible with RentFit).  
   - Optional parity: `motion`, `cmdk`, etc., only if used.
5. **Global styles** — Port `globals.css` structure from RentFit (theme tokens, `@theme inline` if used) and adjust brand colors for Hirevine.
6. **`next.config.ts`** — Start from RentFit: `output: "standalone"` if you deploy with standalone Docker; security headers; image `remotePatterns` for any external assets (e.g. org logos if added later).
7. **Environment** — `.env.example`:  
   - `NEXT_PUBLIC_API_URL` (default `http://localhost:8000` for local API)  
   - `NEXT_PUBLIC_SITE_URL` (production canonical URL for metadata, OG)
8. **AI Elements** — Either copy `src/components/ai-elements/` from RentFit into this repo or re-add via the official registry workflow RentFit used; keep imports stable (`@/components/ai-elements/...`).
9. **Git** — `.gitignore` like RentFit (`node_modules`, `.next`, `.env*.local`).

---

## 4. API integration map (`hirevine-v2-be`)

Centralize paths in `src/lib/configs/api.ts` as `API_ROUTES` (same pattern as RentFit). Cross-check with `/openapi.json` when implementing.

| Domain | Example routes (prefix `/api`) |
|--------|----------------------------------|
| Auth | `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me` |
| Organizations | `POST /organizations`, `GET /organizations` (and org-scoped details per OpenAPI) |
| Jobs | Public list + detail; recruiter `GET /jobs` (paginated: `page`, `limit`, `status`, `q`), `GET /jobs/options` (id/title for filters), `POST`, `PATCH`, `POST .../generate-pipeline`, `POST .../:jobId/apply`, list applications per job |
| Resumes | `POST /resumes/upload` (multipart) |
| Applications | Candidate: `GET /applications/me`, `GET /applications/:id`, quiz `GET`/`POST .../quiz`; Recruiter: `GET /applications` with query params |

**Client rules**

- Use **`withCredentials: true`** on all browser calls to the API (RentFit pattern).
- Unwrap responses using backend envelope: `response.data.success` / `response.data.data` / `response.data.error` (mirror `auth-services` unwrap style; extend `handleError` for Hirevine error codes).
- **401 interceptor:** Clear client auth state except for login/register attempts (same as RentFit `api-client.ts`).
- **File upload:** Use `FormData` for resume route; do not force `Content-Type: application/json` on those requests (axios: delete default header for that call or use dedicated `uploadResume` function).

---

## 5. App Router structure (proposed)

Adjust names as you prefer; keep **role separation** clear.

```text
src/app/
  layout.tsx                 # Root: theme, auth, toaster
  page.tsx                   # Landing or redirect (by auth)
  login/page.tsx
  signup/page.tsx
  (public)/
    jobs/page.tsx            # Active jobs list
    jobs/[jobId]/page.tsx    # Job detail + apply CTA
  (candidate)/
    candidate/
      layout.tsx             # Optional nested layout
      applications/page.tsx
      applications/[applicationId]/page.tsx
      applications/[applicationId]/quiz/page.tsx
  (recruiter)/
    recruiter/
      layout.tsx             # DashboardLayout + sidebar
      page.tsx               # Home / metrics placeholder
      organization/page.tsx
      jobs/page.tsx
      jobs/new/page.tsx
      jobs/[jobId]/page.tsx
      jobs/[jobId]/edit/page.tsx
      jobs/[jobId]/applications/page.tsx
      applications/page.tsx
```

**Routing and guards**

- **MVP:** Reuse **client `AuthProvider`** pattern from RentFit: on load call `GET /api/auth/me`, then redirect by `user.role` and path prefix.
- **Later:** Optional **Next.js `middleware`** reading a lightweight session cookie is tricky with httpOnly JWT; prefer keeping RentFit’s client bootstrap unless you add a BFF session cookie.

---

## 6. Zustand and Zod

| Concern | Approach |
|---------|----------|
| Auth | `auth-store`: `user`, `isAuthenticated`, `isLoading`, `error` — same shape as RentFit; `User` type aligned with Hirevine API (role, email, `organizationId`, etc.) |
| Actions | `auth-actions` calling `auth-services`; thunks stay thin |
| Forms | Zod schemas in `src/lib/validations/`; `RegisterApiPayload` omits UI-only fields (`confirmPassword`) |
| Server forms | Prefer RSC + server actions **only** if you introduce a Next BFF; default plan is **client → Hirevine API** like RentFit |

---

## 7. Vercel AI Elements (`ai-elements`)

RentFit ships a full `src/components/ai-elements/` library (conversation, message, prompt-input, reasoning, etc.). For Hirevine, plan usage in **phases**:

| Phase | Use case |
|-------|----------|
| **Later MVP+** | Recruiter “assistant” panel: explain pipeline JSON, suggest job description edits (requires a **Next.js Route Handler** that calls a model with `@ai-sdk/*` — do not expose provider keys to the browser). |
| **Optional** | Candidate-facing interview prep chat (product decision; separate from core apply flow). |

**Prerequisites for streaming UI:** Route Handler `app/api/.../route.ts` using `streamText` / UI message protocol; `@ai-sdk/react` `useChat` wired to AI Elements `Conversation`, `Message`, `PromptInput` (follow RentFit’s `rentfit-chat-*` patterns conceptually).

---

## 8. Implementation phases

### Phase 1 — Shell and auth

- [x] Root layout, theme, Sonner, metadata (`NEXT_PUBLIC_SITE_URL`).
- [x] `api-client`, `API_ROUTES`, `handleError`, `clear-client-session`.
- [x] Login / signup pages + `auth-layout` (reuse RentFit styling).
- [x] Zod `loginSchema` / `registerSchema` with Hirevine roles.
- [x] `AuthProvider` with Hirevine `protectedPrefixes` and post-login redirect by role.
- [x] `GET /api/auth/me` hydration and 401 handling.

Copy `.env.example` → `.env.local`; run API on `NEXT_PUBLIC_API_URL` (default `http://127.0.0.1:8000`); set API `CORS_ORIGIN` to the web origin for cookies.

### Phase 2 — Candidate core

- [x] Public jobs list (`GET /api/jobs/browse`) and job detail (`GET /api/jobs/:jobId`).
- [x] Resume upload (`POST /api/resumes/upload` via `fetch` + `FormData`; requires `BLOB_READ_WRITE_TOKEN` on API).
- [x] Apply (`POST /api/jobs/:jobId/apply`) for candidates with Blob `resumeUrl`.
- [x] `GET /api/applications/me` list with links to detail.
- [x] Application detail: status, `nextStep`; **poll every 5s** while status is `NODE_1_PENDING` or `NODE_3_PENDING` (candidate view — no evaluation trail in UI; API omits `nodes` for candidates).
- [x] Quiz: `GET`/`POST /api/applications/:id/quiz` (multiple choice + short answer).

**Layout:** RentFit-style shell in **`src/app/(app)/layout.tsx`**: `SidebarProvider` + `DashboardLayout` wraps **`/`**, **`/jobs`**, **`/candidate/*`**, **`/recruiter/*`** (login/signup stay on `AuthLayout` only). **`getMainNavItems()`** in `src/components/navigation/nav-items.ts` is the single nav source for guests, candidates, and recruiters/admins.

### Phase 3 — Recruiter / admin

- [x] Extend recruiter sidebar + pages: Organization, Jobs, Applications (shell at `/recruiter`).
- [x] Organization create + `GET /organizations/me` (create form when none; show org when linked).
- [x] Jobs list, create draft, edit (`PATCH`), “Generate pipeline” (`POST`) with user-visible API errors (503/502).
- [x] Per-job applications list; global applications list with filters (`jobId`, `status`, `page`) + data table.
- [x] Application detail for recruiter (`nodes` + job pipeline diagram).

### Phase 4 — Polish and production

- [x] Empty states, skeletons (shadcn `Skeleton`), accessible forms (`Label`, `aria-invalid` / `aria-describedby`, `role="alert"` on field errors).
- [x] `error.tsx` / `not-found` (basic Hirevine shell).
- [x] README in `hirevine-v2-web`: env vars, `npm run dev`, link to API repo, Vercel checklist.
- [ ] Vercel project (manual): set `NEXT_PUBLIC_API_URL` / `NEXT_PUBLIC_SITE_URL`; verify cookies on HTTPS with API `CORS_ORIGIN` (steps in README).

### Phase 5 — AI surfaces (optional)

- [ ] Route Handler + `useChat` + AI Elements for recruiter assistant (§7).

---

## 9. Type generation (recommended)

- **Short term:** Hand-maintain `src/types/` from OpenAPI samples (same as RentFit `auth.types.ts`).
- **Medium term:** Add `openapi-typescript` (or similar) codegen against `http://localhost:8000/openapi.json` in CI or `npm run codegen` to sync DTOs.

---

## 10. Quality bar

- **Strict TypeScript**; no `any` in new code.
- **Lint / format:** ESLint + Prettier scripts mirroring RentFit.
- **A11y:** shadcn/Radix/Base patterns; keyboard focus on dialogs and drawers.
- **Security:** Never log tokens; prefer cookie session; if storing `accessToken` in memory for Bearer, clear on logout (match RentFit if extended).

---

## 11. Open decisions (capture in PRD or tickets)

- Exact URL scheme for recruiter vs candidate (`/recruiter/...` vs subdomain).
- Whether **admin** gets a separate shell or shares recruiter UI with elevated routes.
- Quiz UX: timer, autosave, single submit.
- Real-time updates: polling interval vs SSE (API would need SSE support — not in current plan).

---

## 12. Quick reference — RentFit → Hirevine mapping

| RentFit | Hirevine |
|---------|----------|
| `/search`, `/profile` | `/candidate/...`, `/recruiter/...`, `/jobs` |
| Listings / map / chat | Jobs, applications, resume, quiz |
| `role: renter \| owner` | `role: candidate \| recruiter \| admin` |
| `API_ROUTES.LISTINGS`, `CHAT` | `API_ROUTES.JOBS`, `APPLICATIONS`, `ORGANIZATIONS`, `RESUMES` |

This plan is a living document: update phases and checkboxes as the implementation lands.
