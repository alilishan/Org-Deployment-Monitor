import { sortEnvironments } from "@/lib/env-order"
import type { EnvDeployment } from "@/types/deployment"

export type SyncStatus =
  | { kind: "synced"; label: string }
  | { kind: "pending"; env: string; label: string }

const ENV_LABELS: Record<string, string> = {
  dev: "Dev",
  uat: "UAT",
  prod: "Prod",
}

function envLabel(env: string): string {
  return ENV_LABELS[env] ?? env.charAt(0).toUpperCase() + env.slice(1)
}

export function getSyncStatus(environments: EnvDeployment[]): SyncStatus | null {
  const byEnv = new Map(environments.map(e => [e.environment, e]))
  const ordered = sortEnvironments([...byEnv.keys()])
    .map(name => byEnv.get(name)!)
    .filter(e => e.version != null)

  if (ordered.length < 2) return null

  for (let i = 0; i < ordered.length - 1; i++) {
    if (ordered[i].version !== ordered[i + 1].version) {
      const env = ordered[i].environment
      return { kind: "pending", env, label: `In ${envLabel(env)}` }
    }
  }
  return { kind: "synced", label: "All Synced" }
}
