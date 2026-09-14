# PROJECT_CONTEXT — HumaScale Frontend (`front-home1`)

**Last Updated:** 2026-09-14

## Overview

React + Vite frontend for HumaScale: readiness assessment, AI project review, community chat, and project map.

## Tech stack

- React 18, React Router 6, Vite 5
- TailwindCSS 3 (RTL, Cairo)
- Axios, Recharts, Leaflet / react-leaflet
- laravel-echo + pusher-js (Reverb realtime)

## Key routes

| Path | Purpose |
|------|---------|
| `/assessment` | Questionnaire (Likert or Yes/No) |
| `/assessment/:id/results` | Results + AI + PDF (regenerate supported) |
| `/project-review` | AI project review + map pin claim |
| `/expansion` | Projects map + expansion areas |
| `/chat` | Community chat (all users) |
| `/admin/settings` | Gemini key + social links |
| `/admin/community-chat` | Admin view of community chat |

## Recent major changes

- Yes/No answer UI per question `answer_type`
- SiteFooter with admin-managed social links on all pages
- Community chat via Echo/Reverb
- Project map claiming (claimed pins visible to all)
- PDF: blob error handling + «تجهيز PDF» regenerate button
- Project review shows full summary, goals, features, how-it-works, ideal steps + map picker

## Env required

See `.env.example`:

- `VITE_API_BASE_URL` (optional in dev)
- `VITE_REVERB_APP_KEY`, `VITE_REVERB_HOST`, `VITE_REVERB_PORT`, `VITE_REVERB_SCHEME`

## Run

```bash
npm install
npm run dev
```

## Active tasks

- Keep Echo auth endpoint aligned with `/api/broadcasting/auth`
- Ensure Reverb env matches backend
