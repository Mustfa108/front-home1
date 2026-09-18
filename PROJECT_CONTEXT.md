# PROJECT_CONTEXT — HumaScale Frontend (`front-home1`)

**Last Updated:** 2026-09-18

## Overview

React + Vite frontend for HumaScale: readiness assessment, AI project review, community chat, and project map.

## Tech stack

- React 18, React Router 6, Vite 5
- TailwindCSS 3 (RTL, Cairo)
- Axios, Recharts, Leaflet / react-leaflet
- laravel-echo + pusher-js (Reverb realtime)

## Key routes

| Path                      | Purpose                                    |
| ------------------------- | ------------------------------------------ |
| `/assessment`             | Questionnaire (Likert or Yes/No)           |
| `/assessment/:id/results` | Results + AI + PDF (regenerate supported)  |
| `/project-review`         | AI project review + map pin claim          |
| `/expansion`              | Projects map + expansion areas             |
| `/chat`                   | Community chat (all users)                 |
| `/profile?onboarding=1`   | Org onboarding after login when incomplete |
| `/admin/settings`         | Gemini key + social links                  |
| `/admin/community-chat`   | Admin view of community chat               |
| `/admin/statistics`       | Platform KPIs (uses AdminLayout)           |
| `/admin/axes`             | Questionnaire axes (draft only)            |
| `/admin/questions`        | Questionnaire questions (draft only)       |
| `/admin/assessment-versions` | Draft / publish questionnaire versions  |
| `/admin/ai-analyses`      | Review generated AI analyses               |

## Recent major changes

- 2026-09-18: Admin settings shows Gemini daily-quota alert from recorded 429/RESOURCE_EXHAUSTED errors + log-hint copy
- 2026-09-18: Fixed admin pages reading `data?.data` after `useAsync`/`unwrapEnvelope` (versions, axes, statistics now show real data + Add Axis)
- 2026-09-18: User mobile nav is a right-side drawer (desktop keeps top nav); dark-mode polish on ProjectReview / Compare / History
- 2026-09-18: AI analysis retry with `{ force: true }` when `is_fallback`; AdminSettings recommends `gemini-3.6-flash`
- Assessment charts follow light/dark CSS tokens via `useChartTheme`
- Admin pages use `AdminLayout` (avoid user `PageContainer` /notifications 401)

## Env required

See `.env.example`:

- `VITE_API_BASE_URL` (optional in dev)
- `VITE_REVERB_APP_KEY`
- `VITE_REVERB_HOST=reverb.sci-syria.org`
- `VITE_REVERB_PORT=80` (local/default) — production should use `443` + `https`
- `VITE_REVERB_SCHEME=http` (local) / `https` (production)

## Run

```bash
npm install
npm run dev
```

## Active tasks / known deps on server

- CORS requires backend `FRONTEND_URL` match SPA origin
- Echo realtime needs Reverb DNS/TLS/proxy; REST chat still works without it
- AI features need Gemini key + model `gemini-3.6-flash` + org profile + queue worker on API host
- Rotate any Gemini key that appeared in server logs
