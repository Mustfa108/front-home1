# PROJECT_CONTEXT — HumaScale Frontend (`front-home1`)

**Last Updated:** 2026-09-17

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
| `/profile?onboarding=1` | Org onboarding after login when incomplete |
| `/admin/settings` | Gemini key + social links |
| `/admin/community-chat` | Admin view of community chat |

## Recent major changes

- SplashScreen skipped on `/admin/*` and marks session seen so it does not overlay admin pages
- Admin dark mode: AdminLayout, Card headers, badges, `.admin-table`, and admin page text/surfaces
- Post-login/register redirects to `/profile?onboarding=1` when `org_type`/`org_size` missing; guide opens on profile
- Dashboard visual polish (hero score band, clearer AI summary) within brand identity
- Org profile soft gate on assessment / project review / dashboard
- Clearer AI and community-chat error messages (CORS / Gemini / rate limits)
- Results page: clearer pending/exhausted messaging for smart summary (queue + Gemini), stronger org-gate copy for analysis, chat history/send validation toasts
- AiChatWidget stable message keys; login/register autocomplete fields
- Community chat RTL bubble alignment (`mine` → `justify-end`)

## Env required

See `.env.example`:

- `VITE_API_BASE_URL` (optional in dev)
- `VITE_REVERB_APP_KEY`
- `VITE_REVERB_HOST=reverbhuma.sci-syria.org`
- `VITE_REVERB_PORT=80` (local/default) — production should use `443` + `https`
- `VITE_REVERB_SCHEME=http` (local) / `https` (production)

Public Reverb URL (prod target): `https://reverbhuma.sci-syria.org/` after DNS + TLS proxy.

## Run

```bash
npm install
npm run dev
```

## Active tasks / known deps on server

- CORS requires backend `FRONTEND_URL` match SPA origin
- Echo realtime needs Reverb DNS/TLS/proxy; REST chat still works without it
- AI features need Gemini key + org profile + queue worker on API host
