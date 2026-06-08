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
