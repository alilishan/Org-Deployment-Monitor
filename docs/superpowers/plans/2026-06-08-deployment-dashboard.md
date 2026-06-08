# BUCC Deployment Dashboard — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a standalone Next.js 15 app that shows every BUCC-Ounch GitHub repo alongside the version deployed to each environment (dev → uat → prod) on a single pipeline-style table.

**Architecture:** Server-rendered Next.js 15 App Router app. GitHub data is fetched server-side on each request using the user's NextAuth v5 OAuth token. All GitHub API calls fire in parallel. No client-side fetching.

**Tech Stack:** Next.js 15, NextAuth v5 (GitHub OAuth), TypeScript, Tailwind CSS, shadcn/ui (New York style), Vitest.

---

## File Map

| File | Purpose |
|------|---------|
| `src/types/deployment.ts` | `DeploymentStatus`, `EnvDeployment`, `RepoDeployment` types |
| `src/types/next-auth.d.ts` | Extends `Session` and `JWT` with `accessToken` |
| `src/lib/env-order.ts` | `sortEnvironments(envs)` — dev → uat → prod ordering |
| `src/lib/version.ts` | `resolveVersion(ref, tags)` — SHA-to-tag resolution |
| `src/lib/format-date.ts` | `formatRelative(isoDate)` — "2h ago" formatting |
| `src/lib/summary.ts` | `computeSummary(repos)` — count healthy / pending / failed |
| `src/lib/github.ts` | GitHub API fetch helpers + `fetchDashboard(token)` |
| `src/lib/auth.ts` | NextAuth v5 config (GitHub provider, token stored in session) |
| `src/app/api/auth/[...nextauth]/route.ts` | NextAuth route handler |
| `src/app/actions.ts` | `refreshDashboard()` server action |
| `src/app/layout.tsx` | Root layout with `TooltipProvider` and dark mode |
| `src/app/page.tsx` | Main dashboard server component |
| `src/components/EnvCell.tsx` | Single environment cell (badge + meta + link) |
| `src/components/SummaryBar.tsx` | Healthy / pending / failed counts + refresh button |
| `src/components/DeploymentTable.tsx` | Pipeline matrix table |
| `src/components/AuthErrorBanner.tsx` | Re-authenticate prompt on GitHub API auth failure |

---

### Task 1: Scaffold the project

**Files:**
- Create: `bucc-deployment-app/` (via `create-next-app`)
- Create: `vitest.config.ts`
- Create: `.env.local.example`
- Modify: `package.json` (add test scripts)

- [ ] **Step 1: Run create-next-app**

From `/Users/alilishan/Documents/React/bucc`:

```bash
npx create-next-app@latest bucc-deployment-app \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --no-git
```

When prompted for ESLint: **No**. Turbopack: default (Yes).

Expected: project files created in `bucc-deployment-app/`.

- [ ] **Step 2: Install additional dependencies**

```bash
cd bucc-deployment-app
npm install next-auth@beta
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom
```

Expected: no errors, `package.json` updated.

- [ ] **Step 3: Add test scripts to package.json**

In `package.json`, add to `"scripts"`:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 4: Create vitest.config.ts**

```ts
import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"
import path from "path"

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
```

- [ ] **Step 5: Write and run a smoke test to verify vitest works**

Create `src/lib/smoke.test.ts`:

```ts
import { describe, it, expect } from "vitest"

describe("smoke", () => {
  it("vitest works", () => {
    expect(1 + 1).toBe(2)
  })
})
```

Run:

```bash
npm test
```

Expected: `1 passed`.

- [ ] **Step 6: Delete the smoke test**

```bash
rm src/lib/smoke.test.ts
```

- [ ] **Step 7: Create .env.local.example**

```
GITHUB_CLIENT_ID=your_github_oauth_app_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_app_client_secret
AUTH_SECRET=run_openssl_rand_-base64_32_to_generate
```

- [ ] **Step 8: Init git and commit**

```bash
git init
echo ".env.local" >> .gitignore
git add -A
git commit -m "chore: scaffold Next.js 15 project with vitest"
```

Expected: clean commit, `.env.local` not tracked.

---

### Task 2: Define shared types

**Files:**
- Create: `src/types/deployment.ts`

- [ ] **Step 1: Create the types file**

```ts
// src/types/deployment.ts
export type DeploymentStatus = "success" | "failure" | "pending" | "none"

export type EnvDeployment = {
  environment: string
  version: string | null
  status: DeploymentStatus
  deployedAt: string | null
  deployedBy: string | null
  deploymentUrl: string
}

export type RepoDeployment = {
  name: string
  fullName: string
  latestTag: string | null
  environments: EnvDeployment[]
}
```

- [ ] **Step 2: Commit**

```bash
git add src/types/deployment.ts
git commit -m "feat: add deployment types"
```

---

### Task 3: Environment sort order (TDD)

**Files:**
- Create: `src/lib/env-order.test.ts`
- Create: `src/lib/env-order.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/lib/env-order.test.ts`:

```ts
import { describe, it, expect } from "vitest"
import { sortEnvironments } from "./env-order"

describe("sortEnvironments", () => {
  it("places dev before uat before prod", () => {
    expect(sortEnvironments(["prod", "dev", "uat"])).toEqual(["dev", "uat", "prod"])
  })

  it("handles a subset of known envs", () => {
    expect(sortEnvironments(["prod", "uat"])).toEqual(["uat", "prod"])
  })

  it("appends unknown envs alphabetically after prod", () => {
    expect(sortEnvironments(["prod", "dev", "canary", "uat"])).toEqual(["dev", "uat", "prod", "canary"])
  })

  it("handles an empty array", () => {
    expect(sortEnvironments([])).toEqual([])
  })

  it("deduplicates entries", () => {
    expect(sortEnvironments(["dev", "dev", "prod"])).toEqual(["dev", "prod"])
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm test
```

Expected: `Cannot find module './env-order'`.

- [ ] **Step 3: Implement sortEnvironments**

Create `src/lib/env-order.ts`:

```ts
const KNOWN_ORDER = ["dev", "uat", "prod"]

export function sortEnvironments(envs: string[]): string[] {
  const unique = [...new Set(envs)]
  const known = KNOWN_ORDER.filter(e => unique.includes(e))
  const unknown = unique.filter(e => !KNOWN_ORDER.includes(e)).sort()
  return [...known, ...unknown]
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npm test
```

Expected: `5 passed`.

- [ ] **Step 5: Commit**

```bash
git add src/lib/env-order.ts src/lib/env-order.test.ts
git commit -m "feat: add environment sort order"
```

---

### Task 4: Version resolution (TDD)

**Files:**
- Create: `src/lib/version.test.ts`
- Create: `src/lib/version.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/lib/version.test.ts`:

```ts
import { describe, it, expect } from "vitest"
import { resolveVersion } from "./version"

const tags = [
  { name: "v2.2.0", commit: { sha: "abc123def456abc123def456abc123def456abc1" } },
  { name: "v2.1.0", commit: { sha: "deadbeefdeadbeefdeadbeefdeadbeefdeadbeef" } },
]

describe("resolveVersion", () => {
  it("returns the ref when it exactly matches a tag name", () => {
    expect(resolveVersion("v2.2.0", tags)).toBe("v2.2.0")
  })

  it("returns the tag name when ref is a full SHA matching a tag commit", () => {
    expect(resolveVersion("abc123def456abc123def456abc123def456abc1", tags)).toBe("v2.2.0")
  })

  it("returns the tag name when ref is a short SHA prefix of a tag commit", () => {
    expect(resolveVersion("abc123d", tags)).toBe("v2.2.0")
  })

  it("returns a 7-char short SHA when no tag matches", () => {
    expect(resolveVersion("999999abcdef0123456789", tags)).toBe("999999a")
  })

  it("returns null when ref is null", () => {
    expect(resolveVersion(null, tags)).toBeNull()
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm test
```

Expected: `Cannot find module './version'`.

- [ ] **Step 3: Implement resolveVersion**

Create `src/lib/version.ts`:

```ts
type Tag = { name: string; commit: { sha: string } }

export function resolveVersion(ref: string | null, tags: Tag[]): string | null {
  if (!ref) return null

  // Exact tag name match
  if (tags.some(t => t.name === ref)) return ref

  // SHA prefix match
  const matched = tags.find(
    t => t.commit.sha.startsWith(ref) || ref.startsWith(t.commit.sha)
  )
  if (matched) return matched.name

  // Fallback: 7-char short SHA
  return ref.slice(0, 7)
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npm test
```

Expected: `10 passed` (5 env-order + 5 version).

- [ ] **Step 5: Commit**

```bash
git add src/lib/version.ts src/lib/version.test.ts
git commit -m "feat: add version resolution from SHA"
```

---

### Task 5: Date formatting and summary computation (TDD)

**Files:**
- Create: `src/lib/format-date.test.ts`
- Create: `src/lib/format-date.ts`
- Create: `src/lib/summary.test.ts`
- Create: `src/lib/summary.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/lib/format-date.test.ts`:

```ts
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { formatRelative } from "./format-date"

describe("formatRelative", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-06-08T12:00:00Z"))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("shows minutes for recent dates", () => {
    expect(formatRelative("2026-06-08T11:45:00Z")).toBe("15m ago")
  })

  it("shows hours for same-day dates", () => {
    expect(formatRelative("2026-06-08T09:00:00Z")).toBe("3h ago")
  })

  it("shows days for older dates", () => {
    expect(formatRelative("2026-06-05T12:00:00Z")).toBe("3d ago")
  })
})
```

Create `src/lib/summary.test.ts`:

```ts
import { describe, it, expect } from "vitest"
import { computeSummary } from "./summary"
import type { RepoDeployment } from "@/types/deployment"

const repos: RepoDeployment[] = [
  {
    name: "repo-a", fullName: "org/repo-a", latestTag: "v1.0.0",
    environments: [
      { environment: "dev",  version: "v1.0.0", status: "success", deployedAt: null, deployedBy: null, deploymentUrl: "" },
      { environment: "prod", version: "v0.9.0", status: "failure", deployedAt: null, deployedBy: null, deploymentUrl: "" },
    ],
  },
  {
    name: "repo-b", fullName: "org/repo-b", latestTag: "v2.0.0",
    environments: [
      { environment: "dev", version: "v2.0.0", status: "success", deployedAt: null, deployedBy: null, deploymentUrl: "" },
      { environment: "uat", version: "v1.9.0", status: "pending", deployedAt: null, deployedBy: null, deploymentUrl: "" },
    ],
  },
]

describe("computeSummary", () => {
  it("counts healthy, pending, and failed across all env cells", () => {
    expect(computeSummary(repos)).toEqual({ healthy: 2, pending: 1, failed: 1 })
  })

  it("returns zeros for empty repos array", () => {
    expect(computeSummary([])).toEqual({ healthy: 0, pending: 0, failed: 0 })
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm test
```

Expected: `Cannot find module './format-date'` and `Cannot find module './summary'`.

- [ ] **Step 3: Implement formatRelative**

Create `src/lib/format-date.ts`:

```ts
export function formatRelative(isoDate: string): string {
  const diffMs = Date.now() - new Date(isoDate).getTime()
  const mins = Math.floor(diffMs / 60_000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}
```

- [ ] **Step 4: Implement computeSummary**

Create `src/lib/summary.ts`:

```ts
import type { RepoDeployment } from "@/types/deployment"

export type Summary = { healthy: number; pending: number; failed: number }

export function computeSummary(repos: RepoDeployment[]): Summary {
  const all = repos.flatMap(r => r.environments)
  return {
    healthy: all.filter(e => e.status === "success").length,
    pending: all.filter(e => e.status === "pending").length,
    failed:  all.filter(e => e.status === "failure").length,
  }
}
```

- [ ] **Step 5: Run tests to confirm they pass**

```bash
npm test
```

Expected: `15 passed` (5 env-order + 5 version + 3 format-date + 2 summary).

- [ ] **Step 6: Commit**

```bash
git add src/lib/format-date.ts src/lib/format-date.test.ts src/lib/summary.ts src/lib/summary.test.ts
git commit -m "feat: add date formatting and summary computation"
```

---

### Task 6: GitHub API helpers

**Files:**
- Create: `src/lib/github.ts`

- [ ] **Step 1: Create the GitHub API helper file**

Create `src/lib/github.ts`:

```ts
import { resolveVersion } from "./version"
import type { RepoDeployment, EnvDeployment, DeploymentStatus } from "@/types/deployment"

// Raw GitHub API shapes
type GHRepo = { name: string; full_name: string }
type GHTag  = { name: string; commit: { sha: string } }
type GHDeployment = {
  id: number
  ref: string
  environment: string
  created_at: string
  creator: { login: string } | null
}
type GHDeploymentStatus = { state: string }

export class GitHubAuthError extends Error {}

async function ghFetch<T>(token: string, path: string): Promise<T> {
  const res = await fetch(`https://api.github.com${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    cache: "no-store",
  })
  if (res.status === 401 || res.status === 403) throw new GitHubAuthError()
  if (!res.ok) throw new Error(`GitHub API ${res.status}: ${path}`)
  return res.json() as Promise<T>
}

function normaliseStatus(state: string | undefined): DeploymentStatus {
  if (!state) return "none"
  if (state === "success") return "success"
  if (state === "failure" || state === "error") return "failure"
  if (state === "in_progress" || state === "queued" || state === "pending") return "pending"
  return "none"
}

async function getOrgRepos(token: string, org: string): Promise<GHRepo[]> {
  return ghFetch<GHRepo[]>(token, `/orgs/${org}/repos?per_page=100&sort=full_name`)
}

async function getRepoTags(token: string, fullName: string): Promise<GHTag[]> {
  return ghFetch<GHTag[]>(token, `/repos/${fullName}/tags?per_page=100`)
}

async function getRepoDeployments(token: string, fullName: string): Promise<GHDeployment[]> {
  return ghFetch<GHDeployment[]>(token, `/repos/${fullName}/deployments?per_page=100`)
}

async function getDeploymentStatuses(token: string, fullName: string, id: number): Promise<GHDeploymentStatus[]> {
  return ghFetch<GHDeploymentStatus[]>(token, `/repos/${fullName}/deployments/${id}/statuses`)
}

async function fetchRepoDeployment(token: string, repo: GHRepo): Promise<RepoDeployment> {
  const [tags, deployments] = await Promise.all([
    getRepoTags(token, repo.full_name),
    getRepoDeployments(token, repo.full_name),
  ])

  const latestTag = tags[0]?.name ?? null

  // Keep only the latest deployment per environment (API returns newest first)
  const latestPerEnv = new Map<string, GHDeployment>()
  for (const dep of deployments) {
    if (!latestPerEnv.has(dep.environment)) latestPerEnv.set(dep.environment, dep)
  }

  const environments: EnvDeployment[] = await Promise.all(
    [...latestPerEnv.entries()].map(async ([env, dep]) => {
      const statuses = await getDeploymentStatuses(token, repo.full_name, dep.id)
      return {
        environment: env,
        version: resolveVersion(dep.ref, tags),
        status: normaliseStatus(statuses[0]?.state),
        deployedAt: dep.created_at,
        deployedBy: dep.creator?.login ?? null,
        deploymentUrl: `https://github.com/${repo.full_name}/deployments/activity_log?environment=${encodeURIComponent(env)}`,
      }
    })
  )

  return { name: repo.name, fullName: repo.full_name, latestTag, environments }
}

export async function fetchDashboard(token: string, org = "BUCC-Ounch"): Promise<RepoDeployment[]> {
  const repos = await getOrgRepos(token, org)
  return Promise.all(repos.map(r => fetchRepoDeployment(token, r)))
}
```

- [ ] **Step 2: Run tests to confirm nothing broke**

```bash
npm test
```

Expected: `15 passed`.

- [ ] **Step 3: Commit**

```bash
git add src/lib/github.ts
git commit -m "feat: add GitHub API helpers"
```

---

### Task 7: Auth setup (NextAuth v5)

**Files:**
- Create: `src/lib/auth.ts`
- Create: `src/types/next-auth.d.ts`
- Create: `src/app/api/auth/[...nextauth]/route.ts`

- [ ] **Step 1: Create NextAuth config**

Create `src/lib/auth.ts`:

```ts
import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: { scope: "read:org repo" },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account?.access_token) token.accessToken = account.access_token
      return token
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string
      return session
    },
  },
})
```

- [ ] **Step 2: Extend Session and JWT types**

Create `src/types/next-auth.d.ts`:

```ts
import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session extends DefaultSession {
    accessToken: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken: string
  }
}
```

- [ ] **Step 3: Create the route handler**

Create `src/app/api/auth/[...nextauth]/route.ts`:

```ts
import { handlers } from "@/lib/auth"
export const { GET, POST } = handlers
```

- [ ] **Step 4: Create .env.local and fill in real values**

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```
GITHUB_CLIENT_ID=<your GitHub OAuth App client ID>
GITHUB_CLIENT_SECRET=<your GitHub OAuth App client secret>
AUTH_SECRET=<output of: openssl rand -base64 32>
```

To create the GitHub OAuth App:
1. Go to https://github.com/organizations/BUCC-Ounch/settings/applications
2. New OAuth App → set callback URL to `http://localhost:3000/api/auth/callback/github`
3. Copy Client ID and generate Client Secret

- [ ] **Step 5: Start dev server and verify OAuth flow**

```bash
npm run dev
```

Visit `http://localhost:3000/api/auth/signin`.
Expected: GitHub login page appears. After login, redirects to `http://localhost:3000`.

- [ ] **Step 6: Commit (never commit .env.local)**

```bash
git add src/lib/auth.ts src/types/next-auth.d.ts "src/app/api/auth/[...nextauth]/"
git commit -m "feat: add NextAuth v5 GitHub OAuth"
```

---

### Task 8: Install shadcn/ui components

**Files:**
- Create: `components.json`
- Modify: `src/app/globals.css`
- Create: `src/components/ui/` (shadcn generates these)

- [ ] **Step 1: Initialise shadcn**

```bash
npx shadcn@latest init
```

When prompted:
- Style: **New York**
- Base color: **Zinc**
- CSS variables: **Yes**

- [ ] **Step 2: Add required components**

```bash
npx shadcn@latest add badge button table tooltip
```

Expected: `src/components/ui/badge.tsx`, `button.tsx`, `table.tsx`, `tooltip.tsx` created.

- [ ] **Step 3: Confirm imports resolve**

Open `src/components/ui/badge.tsx` and confirm it exports `Badge` and `badgeVariants`.

- [ ] **Step 4: Commit**

```bash
git add components.json src/components/ui/ src/app/globals.css
git commit -m "chore: add shadcn/ui New York with badge, button, table, tooltip"
```

---

### Task 9: EnvCell component

**Files:**
- Create: `src/components/EnvCell.tsx`

- [ ] **Step 1: Create EnvCell**

Create `src/components/EnvCell.tsx`:

```tsx
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { formatRelative } from "@/lib/format-date"
import type { EnvDeployment, DeploymentStatus } from "@/types/deployment"

const statusStyles: Record<DeploymentStatus, string> = {
  success: "bg-green-950 text-green-400 border-green-900 hover:bg-green-950",
  failure: "bg-red-950 text-red-400 border-red-900 hover:bg-red-950",
  pending: "bg-amber-950 text-amber-400 border-amber-900 hover:bg-amber-950",
  none:    "bg-muted text-muted-foreground border-border hover:bg-muted",
}

const statusSuffix: Partial<Record<DeploymentStatus, string>> = {
  failure: " ✗",
  pending: " ⏳",
}

type Props = { deployment: EnvDeployment | null }

export default function EnvCell({ deployment }: Props) {
  if (!deployment) {
    return (
      <Badge variant="outline" className="text-muted-foreground/40 font-mono">
        —
      </Badge>
    )
  }

  const badge = (
    <a href={deployment.deploymentUrl} target="_blank" rel="noopener noreferrer">
      <Badge className={`font-mono text-xs ${statusStyles[deployment.status]}`}>
        {deployment.version ?? "unknown"}
        {statusSuffix[deployment.status] ?? ""}
      </Badge>
    </a>
  )

  return (
    <div className="flex flex-col gap-0.5">
      <Tooltip>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
        <TooltipContent side="top">
          <p className="text-xs">
            by <span className="font-semibold">{deployment.deployedBy ?? "unknown"}</span>
          </p>
          {deployment.deployedAt && (
            <p className="text-xs text-muted-foreground">
              {new Date(deployment.deployedAt).toLocaleString()}
            </p>
          )}
        </TooltipContent>
      </Tooltip>
      <div className="text-[10px] text-muted-foreground leading-tight font-mono">
        {deployment.deployedBy && <span>{deployment.deployedBy}</span>}
        {deployment.deployedAt && (
          <span> · {formatRelative(deployment.deployedAt)}</span>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/EnvCell.tsx
git commit -m "feat: add EnvCell component"
```

---

### Task 10: SummaryBar and refresh action

**Files:**
- Create: `src/app/actions.ts`
- Create: `src/components/SummaryBar.tsx`

- [ ] **Step 1: Create the server action**

Create `src/app/actions.ts`:

```ts
"use server"
import { revalidatePath } from "next/cache"

export async function refreshDashboard() {
  revalidatePath("/")
}
```

- [ ] **Step 2: Create SummaryBar**

Create `src/components/SummaryBar.tsx`:

```tsx
import { Button } from "@/components/ui/button"
import { refreshDashboard } from "@/app/actions"
import type { Summary } from "@/lib/summary"

export default function SummaryBar({ healthy, pending, failed }: Summary) {
  return (
    <div className="flex items-center gap-6 px-6 py-3 border-b border-border bg-muted/20 text-sm">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-green-500 inline-block" />
        <span className="text-muted-foreground">{healthy} healthy</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-amber-500 inline-block" />
        <span className="text-muted-foreground">{pending} pending</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-red-500 inline-block" />
        <span className="text-muted-foreground">{failed} failed</span>
      </div>
      <form action={refreshDashboard} className="ml-auto">
        <Button type="submit" variant="outline" size="sm">
          ↻ Refresh
        </Button>
      </form>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/actions.ts src/components/SummaryBar.tsx
git commit -m "feat: add SummaryBar with server action refresh"
```

---

### Task 11: DeploymentTable component

**Files:**
- Create: `src/components/DeploymentTable.tsx`

- [ ] **Step 1: Create DeploymentTable**

Create `src/components/DeploymentTable.tsx`:

```tsx
import { Fragment } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { sortEnvironments } from "@/lib/env-order"
import EnvCell from "@/components/EnvCell"
import type { RepoDeployment } from "@/types/deployment"

type Props = { repos: RepoDeployment[] }

export default function DeploymentTable({ repos }: Props) {
  const allEnvs = sortEnvironments([
    ...new Set(repos.flatMap(r => r.environments.map(e => e.environment))),
  ])

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-56">Repository</TableHead>
          {allEnvs.map((env, i) => (
            <Fragment key={env}>
              <TableHead className="font-mono text-xs">{env}</TableHead>
              {i < allEnvs.length - 1 && (
                <TableHead className="w-6 px-0" />
              )}
            </Fragment>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {repos.map(repo => {
          const envMap = new Map(repo.environments.map(e => [e.environment, e]))
          return (
            <TableRow key={repo.fullName}>
              <TableCell className="align-top py-3">
                <a
                  href={`https://github.com/${repo.fullName}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono font-semibold text-sm text-primary hover:underline"
                >
                  {repo.name}
                </a>
                {repo.latestTag && (
                  <div className="text-[10px] text-muted-foreground mt-0.5 font-mono">
                    latest: {repo.latestTag}
                  </div>
                )}
              </TableCell>
              {allEnvs.map((env, i) => {
                const current = envMap.get(env) ?? null
                const nextEnv = allEnvs[i + 1]
                const next = nextEnv ? (envMap.get(nextEnv) ?? null) : null
                const sameAsNext =
                  current?.version != null &&
                  next?.version != null &&
                  current.version === next.version
                return (
                  <Fragment key={env}>
                    <TableCell className="align-top py-3 pr-2">
                      <EnvCell deployment={current} />
                    </TableCell>
                    {i < allEnvs.length - 1 && (
                      <TableCell
                        className={`w-6 px-0 text-center text-sm align-middle ${
                          sameAsNext
                            ? "text-muted-foreground/20"
                            : "text-muted-foreground"
                        }`}
                      >
                        →
                      </TableCell>
                    )}
                  </Fragment>
                )
              })}
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/DeploymentTable.tsx
git commit -m "feat: add DeploymentTable pipeline component"
```

---

### Task 12: AuthErrorBanner and dashboard page

**Files:**
- Create: `src/components/AuthErrorBanner.tsx`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Create AuthErrorBanner**

Create `src/components/AuthErrorBanner.tsx`:

```tsx
import { Button } from "@/components/ui/button"

export default function AuthErrorBanner() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-3">
        <p className="text-muted-foreground text-sm">
          Your GitHub session has expired or lacks the required permissions
          (<code className="text-xs">read:org</code>, <code className="text-xs">repo</code>).
        </p>
        <a href="/api/auth/signin">
          <Button>Re-authenticate with GitHub</Button>
        </a>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Update layout.tsx**

Replace `src/app/layout.tsx` with:

```tsx
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { TooltipProvider } from "@/components/ui/tooltip"
import "./globals.css"

const geist     = Geist({ subsets: ["latin"], variable: "--font-geist" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" })

export const metadata: Metadata = {
  title: "BUCC Deployments",
  description: "Deployment status across all BUCC-Ounch repositories",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${geist.variable} ${geistMono.variable} antialiased bg-background text-foreground`}>
        <TooltipProvider>
          {children}
        </TooltipProvider>
      </body>
    </html>
  )
}
```

- [ ] **Step 3: Replace page.tsx with the dashboard**

Replace `src/app/page.tsx` with:

```tsx
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { fetchDashboard, GitHubAuthError } from "@/lib/github"
import { computeSummary } from "@/lib/summary"
import DeploymentTable from "@/components/DeploymentTable"
import SummaryBar from "@/components/SummaryBar"
import AuthErrorBanner from "@/components/AuthErrorBanner"

export default async function DashboardPage() {
  const session = await auth()
  if (!session) redirect("/api/auth/signin")

  try {
    const repos = await fetchDashboard(session.accessToken)
    const summary = computeSummary(repos)

    return (
      <main className="min-h-screen">
        <header className="border-b border-border bg-background px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-semibold">BUCC-Ounch</span>
            <span className="text-muted-foreground">/</span>
            <span className="text-muted-foreground">Deployments</span>
          </div>
          <span className="text-xs text-muted-foreground">{session.user?.name}</span>
        </header>
        <SummaryBar {...summary} />
        <div className="p-6">
          <DeploymentTable repos={repos} />
        </div>
      </main>
    )
  } catch (e) {
    if (e instanceof GitHubAuthError) return <AuthErrorBanner />
    throw e
  }
}
```

- [ ] **Step 4: Run all tests**

```bash
npm test
```

Expected: `15 passed`.

- [ ] **Step 5: Start the dev server and verify the full dashboard**

```bash
npm run dev
```

Visit `http://localhost:3000`:
1. Redirects to GitHub OAuth if not signed in
2. After login: header shows "BUCC-Ounch / Deployments" + your GitHub name
3. SummaryBar shows correct healthy / pending / failed counts
4. Table has one row per org repo, env columns in dev → uat → prod order
5. Arrows between columns are dim when adjacent versions match, bright when they differ
6. Hovering a badge shows the deployer name and timestamp tooltip
7. Clicking a badge opens the GitHub deployment activity log in a new tab
8. Clicking ↻ Refresh re-fetches and re-renders the page

- [ ] **Step 6: Final commit**

```bash
git add src/app/layout.tsx src/app/page.tsx src/components/AuthErrorBanner.tsx
git commit -m "feat: dashboard page, layout, and auth error banner"
```
