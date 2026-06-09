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

// Marker tags that identify which environment an image belongs to
const ENV_MARKER: Record<string, string> = { dev: "dev", uat: "uat", prod: "latest" }
const MARKER_TAGS = new Set(Object.values(ENV_MARKER))

type GHPackage = { name: string }
type GHPackageVersion = { metadata: { container: { tags: string[] } } }

async function getOrgPackages(token: string, org: string): Promise<GHPackage[]> {
  try {
    return ghFetch<GHPackage[]>(token, `/orgs/${org}/packages?package_type=container&per_page=100`)
  } catch {
    return []
  }
}

// Returns env name → version tag, e.g. { dev: "main.36.1", uat: "main.33.0", prod: "main.1.1" }
async function getImageTagsByEnv(
  token: string,
  org: string,
  packageName: string
): Promise<Record<string, string>> {
  try {
    const versions = await ghFetch<GHPackageVersion[]>(
      token,
      `/orgs/${org}/packages/container/${encodeURIComponent(packageName)}/versions?per_page=100`
    )
    const result: Record<string, string> = {}
    for (const version of versions) {
      const tags = version.metadata?.container?.tags ?? []
      const marker = tags.find(t => MARKER_TAGS.has(t))
      if (!marker) continue
      const versionTag = tags.find(t => !MARKER_TAGS.has(t))
      if (!versionTag) continue
      const env = Object.entries(ENV_MARKER).find(([, m]) => m === marker)?.[0]
      if (env) result[env] = versionTag
    }
    return result
  } catch {
    return {}
  }
}

async function getDeploymentStatuses(token: string, fullName: string, id: number): Promise<GHDeploymentStatus[]> {
  return ghFetch<GHDeploymentStatus[]>(token, `/repos/${fullName}/deployments/${id}/statuses`)
}

async function fetchRepoDeployment(
  token: string,
  repo: GHRepo,
  imageTagsByEnv: Record<string, string>
): Promise<RepoDeployment> {
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
        imageTag: imageTagsByEnv[env] ?? null,
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
  const [repos, packages] = await Promise.all([
    getOrgRepos(token, org),
    getOrgPackages(token, org),
  ])

  // Match each repo to its container package (name may be "repo" or "repo/service")
  const packageByRepo = new Map<string, string>()
  for (const pkg of packages) {
    const repoName = pkg.name.split("/")[0]
    if (!packageByRepo.has(repoName)) packageByRepo.set(repoName, pkg.name)
  }

  return Promise.all(
    repos.map(async repo => {
      const packageName = packageByRepo.get(repo.name)
      const imageTagsByEnv = packageName
        ? await getImageTagsByEnv(token, org, packageName)
        : {}
      return fetchRepoDeployment(token, repo, imageTagsByEnv)
    })
  )
}
