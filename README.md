# BUCC Deployment Monitor

A deployment status dashboard for GitHub organisations. Shows every repository alongside the version deployed to each environment (dev → uat → prod) in a single pipeline view, with live container image tag tracking via GHCR.

![Dashboard](public/next.svg)

## Features

- **Pipeline view** — dev → uat → prod deployment status per repository in one table
- **Image tag tracking** — pulls container tags from GHCR and displays them colour-coded (green for `main` builds, amber for semver releases, red for other branches)
- **Image drift detection** — flags when different environments are running different image versions
- **GitHub OAuth** — signs in with GitHub; uses the user's own token to query the API
- **Server-rendered** — all GitHub API calls are made server-side on each request; no client-side polling
- **One-click refresh** — revalidates the dashboard without a full page reload

## Tech Stack

- [Next.js 16](https://nextjs.org) (App Router, Server Components, Server Actions)
- [NextAuth v5](https://authjs.dev) — GitHub OAuth with `read:org repo read:packages` scopes
- [Tailwind CSS v4](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com) (New York style, `@base-ui/react`)
- TypeScript · Vitest

## Setup

### 1. Create a GitHub OAuth App

In your GitHub organisation (or personal account): **Settings → Developer Settings → OAuth Apps → New OAuth App**

| Field | Value |
|---|---|
| Homepage URL | `http://localhost:3000` |
| Authorization callback URL | `http://localhost:3000/api/auth/callback/github` |

Copy the **Client ID** and generate a **Client Secret**.

### 2. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in `.env.local`:

```env
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
AUTH_SECRET=                        # run: openssl rand -base64 32
```

### 3. Point at your organisation

Edit the default org in `src/lib/github.ts`:

```ts
export async function fetchDashboard(token: string, org = "YOUR-ORG-HERE")
```

And update the matching constant in `scripts/cleanup-envs.mjs` if you use that script.

### 4. Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
npm run dev        # development server
npm run build      # production build
npm test           # Vitest unit tests

# Delete stale GitHub deployments (environments outside dev/uat/prod)
GITHUB_TOKEN=ghp_xxx node scripts/cleanup-envs.mjs --dry-run
GITHUB_TOKEN=ghp_xxx node scripts/cleanup-envs.mjs
```

## Environment Variables

| Variable | Description |
|---|---|
| `GITHUB_CLIENT_ID` | GitHub OAuth App client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App client secret |
| `AUTH_SECRET` | Random secret for NextAuth session encryption (`openssl rand -base64 32`) |

Never commit `.env` or `.env.local` — they are gitignored.
