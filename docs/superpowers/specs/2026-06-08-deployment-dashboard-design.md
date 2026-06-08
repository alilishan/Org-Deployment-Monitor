# BUCC Deployment Dashboard — Design Spec

**Date:** 2026-06-08  
**Status:** Approved

## Overview

A standalone internal web app that shows, on a single screen, every repo in the BUCC-Ounch GitHub org alongside the version deployed to each environment. The primary use case is answering "what's running where?" at a glance — especially spotting versions that haven't yet progressed from dev → uat → prod.

---

## Architecture

**Stack:** Next.js 15 App Router, NextAuth v5 (GitHub provider), TypeScript, Tailwind CSS, shadcn/ui (New York style).  
**Location:** `bucc-deployment-app/` (standalone — not part of bucc-app-webapp).  
**Auth:** GitHub OAuth. Team members log in with their GitHub account. Unauthenticated users are redirected to the GitHub OAuth flow.  
**OAuth scopes required:** `read:org` + `repo` (covers private repos in the org).

### Data flow

1. User visits app → unauthenticated → GitHub OAuth redirect
2. Callback → NextAuth stores session with `access_token`
3. Dashboard `page.tsx` (Server Component) calls GitHub API server-side using that token
4. Page renders fully server-side — no client-side fetching, no CORS
5. "Refresh" button triggers a server action (`revalidatePath`) to re-fetch

### File structure

```
bucc-deployment-app/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Server component — main dashboard
│   │   ├── layout.tsx                  # Root layout, SessionProvider
│   │   └── api/auth/[...nextauth]/
│   │       └── route.ts                # NextAuth handler
│   ├── components/
│   │   ├── DeploymentTable.tsx         # Full pipeline table — server-rendered, cells are plain <a> links
│   │   ├── EnvCell.tsx                 # Single env cell — badge + meta
│   │   └── SummaryBar.tsx              # Healthy / pending / failed counts + refresh
│   └── lib/
│       ├── github.ts                   # GitHub API helpers
│       └── auth.ts                     # NextAuth config
├── .env.local                          # GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, NEXTAUTH_SECRET
└── docs/
    └── superpowers/specs/
        └── 2026-06-08-deployment-dashboard-design.md
```

### UI components

Use **shadcn/ui** primitives wherever an equivalent exists (e.g. `Badge` for version badges, `Button` for the refresh action, `Table`/`TableRow`/`TableCell` for the deployment matrix, `Tooltip` for truncated names). Create a custom component only when no shadcn equivalent covers the need.

---

## Data Model

### Types

```ts
type DeploymentStatus = "success" | "failure" | "pending" | "none"

type EnvDeployment = {
  environment: string        // "dev" | "uat" | "prod" (or any GitHub env name)
  version: string | null     // semver tag e.g. "v2.1.0", or short SHA fallback
  status: DeploymentStatus
  deployedAt: string | null  // ISO timestamp
  deployedBy: string | null  // GitHub login
  deploymentUrl: string      // link to GitHub deployment page
}

type RepoDeployment = {
  name: string               // "bucc-app-webapp"
  fullName: string           // "BUCC-Ounch/bucc-app-webapp"
  latestTag: string | null   // most recent semver tag on the repo
  environments: EnvDeployment[]
}
```

### GitHub API calls (all server-side, fired in parallel)

| Call | Purpose |
|------|---------|
| `GET /orgs/BUCC-Ounch/repos` | Discover all repos |
| `GET /repos/{owner}/{repo}/deployments?environment={env}` | Latest deployment per env |
| `GET /repos/{owner}/{repo}/deployments/{id}/statuses` | Deployment status |
| `GET /repos/{owner}/{repo}/tags` | Latest semver tag |

All repo + deployment calls are parallelised via `Promise.all`. For a typical org size (≤20 repos × 3 environments = ≤60 requests) this is well within GitHub's 5,000 req/hour OAuth rate limit.

### Environment discovery & ordering

Environments are **not hardcoded** — they are the union of all environment names found across all repos. This means adding a new environment to a GitHub Actions workflow automatically adds a column without a code change.

Conventional sort order: `dev → uat → prod`. Any unrecognised environment names are appended alphabetically after `prod`.

### Version resolution

Deployment `ref` values from GitHub are often commit SHAs. We match them against the repo's tag list to show a human-readable semver version. If no tag matches, the short SHA is shown as a fallback.

---

## Components

### `DeploymentTable`

The main table. Fully server-rendered HTML. Cell clicks are plain `<a target="_blank">` links — no client component needed.

- Columns: repo name + one column per discovered environment, separated by `→` arrow columns
- Arrows are **dimmed** when adjacent environments are on the same version, **bright** when they differ (version hasn't propagated — useful at-a-glance signal)
- Rows: one per repo, sorted alphabetically by repo name

### `EnvCell`

Renders a single environment cell:

- **Version badge** — colour-coded by status:
  - Green: `success`
  - Amber: `pending` / in-progress
  - Red: `failure`
  - Grey: `none` (never deployed)
- Below the badge: `deployedAt` (relative time) and `deployedBy` (GitHub login)
- The cell is wrapped in an `<a href={deploymentUrl} target="_blank">` — no JS required

### `SummaryBar`

Counts across all cells (not repos): **healthy / pending / failed**. One-number health read before scanning the table. Also contains the Refresh button.

---

## Interactions

### Refresh

A `<form action={revalidateDashboard}>` server action button in the top bar. No automatic polling — explicit refresh only. Keeps the app stateless and avoids unnecessary API calls against the GitHub rate limit.

### Auth errors

If the user's OAuth token has expired or lacks the required scope, GitHub API returns 401/403. This is caught and a "Re-authenticate" banner is shown rather than an error crash.

### No search/filter (v1)

The table is designed to be scannable at a glance for a typical org size. Filtering can be added later if the repo count grows significantly.

---

## Environment Variables

```
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
```

---

## Out of Scope (v1)

- Deployment history / changelog per repo
- Triggering deployments from the dashboard
- Notifications or webhooks
- Per-environment access control
- Search / filter
