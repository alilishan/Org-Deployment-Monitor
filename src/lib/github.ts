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

const ACTIVE_ENVS = new Set(["dev", "uat", "prod"])

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

  // Keep only the latest deployment per active environment (API returns newest first)
  const latestPerEnv = new Map<string, GHDeployment>()
  for (const dep of deployments) {
    if (ACTIVE_ENVS.has(dep.environment) && !latestPerEnv.has(dep.environment))
      latestPerEnv.set(dep.environment, dep)
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
