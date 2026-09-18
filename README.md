# FastTube

Full-stack YouTube download web app built with **Next.js**, **TypeScript**, **PostgreSQL (Prisma)**, **Firebase Auth**, and **yt-dlp**.

Paste a YouTube URL → fetch available formats → queue a download job → poll status → download the file. Jobs and metadata are tracked in Postgres; auth uses Firebase ID tokens on API routes.

> **Portfolio / educational project.** Respect YouTube’s Terms of Service and copyright law. Only download content you own or have permission to use. This repo is shared to demonstrate full-stack engineering, not to encourage unauthorized downloading.

## Highlights

- **End-to-end flow:** format discovery, async download jobs, status polling, file delivery, TTL cleanup
- **Stack match for production web apps:** Next.js App Router, React, TypeScript, Node API routes, Prisma + PostgreSQL
- **Auth:** Firebase client + Admin token verification on protected APIs
- **Ops-minded:** cookie-based yt-dlp access for restricted IPs, systemd/nginx notes, scheduled cleanup endpoint
- **Product UI:** landing, download workspace, local history, about / how-to / privacy / contact pages

## Architecture (short)

```
Browser (React)
  → Firebase Auth (anonymous/session)
  → Next.js API routes (/api/fetch-formats, /api/download/*)
      → yt-dlp (+ ffmpeg) for media
      → Prisma → PostgreSQL for Download jobs
  → File served from temp storage, cleaned via /api/cleanup
```

**Data model:** `Download` records (`PENDING` → `PROCESSING` → `COMPLETED` | `FAILED`) with URL, format, progress, paths, and errors (`prisma/schema.prisma`).

## Tech stack

| Layer | Choice |
|-------|--------|
| App | Next.js 16 (App Router), React 19, TypeScript |
| DB | PostgreSQL + Prisma 7 |
| Auth | Firebase Auth + Firebase Admin |
| Media | yt-dlp, ffmpeg |
| Analytics (optional) | Microsoft Clarity, Firebase Analytics |
| Package manager | pnpm |

## Prerequisites

| Requirement | Notes |
|-------------|-------|
| Node.js 22+ | Node 24 recommended (yt-dlp JS challenges) |
| pnpm | `npm install -g pnpm` |
| PostgreSQL 14+ | Job history / status |
| ffmpeg + yt-dlp | Installed by `./yt-dlp-setup.sh` |

## Quick start (local)

```bash
git clone https://github.com/nshorna/youtube-downloader.git
cd youtube-downloader
pnpm install

cp env.sample .env.development
# Edit .env.development: DATABASE_URL, Firebase web + admin, optional Clarity

# Install yt-dlp / ffmpeg (Linux server / VM)
chmod +x yt-dlp-setup.sh
./yt-dlp-setup.sh

pnpm exec dotenv -e .env.development -- npx prisma generate
pnpm exec dotenv -e .env.development -- npx prisma db push

pnpm dev   # http://localhost:3021
```

Production scripts expect `.env.production` (`pnpm build`, `pnpm start` on port **3025**, `pnpm db:deploy`).

## Environment

All secrets live in env files (see `env.sample`). Never commit `.env*`.

Required groups:

1. **Postgres** — `DATABASE_URL`, `DB_*`
2. **Firebase Admin** — `FIREBASE_SERVICE_ACCOUNT` (full JSON, one line)
3. **Firebase Web** — `NEXT_PUBLIC_FIREBASE_*`
4. **Site URL** — `NEXT_PUBLIC_SITE_URL`
5. **Optional** — `NEXT_PUBLIC_MS_CLARITY_PROJECT_ID`, `YTDLP_COOKIES_FILE`

After changing server code or cookie paths, rebuild before `pnpm start` (`next start` serves `.next/`).

## YouTube cookies (production IPs)

Datacenter IPs are often blocked. Export cookies from a signed-in browser into `YTDLP_COOKIES_FILE` (see README section historically used with the Get cookies.txt LOCALLY extension). Refresh when downloads start failing with bot checks.

## Deploy notes

- Reverse-proxy (nginx/Caddy) with long `proxy_read_timeout` for large downloads
- Optional systemd unit running `pnpm start`
- Cron: `POST /api/cleanup` every ~15 minutes (files TTL ≈ 30 minutes under `/tmp`)

Details and troubleshooting remain in the sections below for operators.

### Deploy on a new server

1. Clone repo, install Node 22+/pnpm, run `./yt-dlp-setup.sh`
2. Configure cookies + Postgres + Firebase
3. `cp env.sample .env.production` and fill values
4. `pnpm install && pnpm db:deploy && pnpm build && pnpm start`

### Troubleshooting

| Symptom | Fix |
|---------|-----|
| No JS runtime for yt-dlp | Run `./yt-dlp-setup.sh` / ensure Node on `PATH` |
| “Sign in to confirm you’re not a bot” | Refresh cookies; rebuild/restart |
| Env changes not applied in prod | `pnpm build && pnpm start` |
| `FIREBASE_SERVICE_ACCOUNT` missing | Set one-line JSON in `.env.production` |
| DB errors | Check Postgres + `DATABASE_URL` / `DB_*` |

## Project scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Dev server (port 3021) |
| `pnpm build` | Production build (`.env.production`) |
| `pnpm start` | Production server (port 3025) |
| `pnpm db:deploy` | `prisma generate` + `db push` |
| `pnpm lint` | ESLint |
| `./yt-dlp-setup.sh` | Install yt-dlp, ffmpeg, Node symlinks |

## Security notes for contributors

- Rotate any credentials that were ever committed historically (DB password, Firebase service account).
- Keep service account JSON and cookies out of git.
- Prefer least-privilege Firebase + DB users in production.

## License

MIT — see [LICENSE](./LICENSE).

Not affiliated with YouTube or Google.
