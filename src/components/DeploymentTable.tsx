"use client"

import { Fragment } from "react"
import { ArrowRight, Check, TriangleAlert } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { sortEnvironments } from "@/lib/env-order"
import { getSyncStatus } from "@/lib/sync-status"
import EnvCell from "@/components/EnvCell"
import { TEMPLATE_REPOS } from "@/lib/template-repos"
import type { RepoDeployment } from "@/types/deployment"

type Props = { repos: RepoDeployment[]; showTemplates: boolean }

const envDot: Record<string, string> = {
  dev:  "bg-cyan-500 dark:bg-cyan-400",
  uat:  "bg-amber-500 dark:bg-amber-400",
  prod: "bg-emerald-500 dark:bg-emerald-400",
}

const syncBadge: Record<string, string> = {
  synced: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900",
  dev:    "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-400 dark:border-cyan-900",
  uat:    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900",
}

const syncBadgeFallback =
  "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-950/40 dark:text-slate-400 dark:border-slate-800"

export default function DeploymentTable({ repos, showTemplates }: Props) {
  const visibleRepos = showTemplates
    ? repos
    : repos.filter(r => !TEMPLATE_REPOS.has(r.name))

  const allEnvs = sortEnvironments([
    ...new Set(visibleRepos.flatMap(r => r.environments.map(e => e.environment))),
  ])

  return (
    <div className="rounded-[8px] border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-border bg-muted/40 dark:bg-[#0a0e1c] hover:bg-muted/40 dark:hover:bg-[#0a0e1c]">
            <TableHead className="w-56 py-3 px-5 font-mono text-[10px] tracking-widest text-muted-foreground/60 uppercase">
              Repository
            </TableHead>
            {allEnvs.map((env, i) => (
              <Fragment key={env}>
                <TableHead className="py-3 px-4 font-mono text-[10px] tracking-widest uppercase">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${envDot[env] ?? "bg-slate-400"}`} />
                    <span className="text-muted-foreground">{env}</span>
                  </div>
                </TableHead>
                {i < allEnvs.length - 1 && (
                  <TableHead className="w-8 px-0" />
                )}
              </Fragment>
            ))}
            <TableHead className="w-28 py-3 px-4 font-mono text-[10px] tracking-widest text-muted-foreground/60 uppercase">
              Status
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visibleRepos.map((repo, rowIndex) => {
            const envMap = new Map(repo.environments.map(e => [e.environment, e]))
            const tagFingerprints = repo.environments
              .map(e => [...e.imageTags].sort().join(","))
              .filter(s => s !== "")
            const imageDrifted = tagFingerprints.length > 1 && new Set(tagFingerprints).size > 1
            const sync = getSyncStatus(repo.environments)
            return (
              <TableRow
                key={repo.fullName}
                className={`border-b border-border transition-colors hover:bg-muted/40 dark:hover:bg-[#0d1226] ${
                  rowIndex % 2 === 0
                    ? "bg-background"
                    : "bg-muted/20 dark:bg-[#090c1a]"
                }`}
              >
                <TableCell className="align-top py-4 px-5">
                  <div className="flex items-center gap-2">
                    <a
                      href={`https://github.com/${repo.fullName}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono font-semibold text-[13px] text-blue-600 dark:text-[#8aabcc] hover:text-blue-800 dark:hover:text-cyan-300 transition-colors"
                    >
                      {repo.name}
                    </a>
                    {imageDrifted && (
                      <span className="drift-badge" title="Image versions differ across environments">
                        <TriangleAlert className="w-3 h-3" />
                        drift
                      </span>
                    )}
                  </div>
                  {repo.latestTag && (
                    <div className="mt-1 font-mono text-[10px] text-muted-foreground/60">
                      tag: {repo.latestTag}
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
                      <TableCell className="align-top py-4 px-4">
                        <EnvCell deployment={current} />
                      </TableCell>
                      {i < allEnvs.length - 1 && (
                        <TableCell className="w-8 px-0 text-center align-middle">
                          <ArrowRight className={`w-3.5 h-3.5 mx-auto ${sameAsNext ? "text-border" : "text-muted-foreground/50"}`} />
                        </TableCell>
                      )}
                    </Fragment>
                  )
                })}
                <TableCell className="align-top py-4 px-4">
                  {sync ? (
                    <span
                      className={`inline-flex items-center gap-1 rounded-[4px] border px-1.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider whitespace-nowrap ${
                        syncBadge[sync.kind === "synced" ? "synced" : sync.env] ?? syncBadgeFallback
                      }`}
                    >
                      {sync.kind === "synced" && <Check className="w-3 h-3" />}
                      {sync.label}
                    </span>
                  ) : (
                    <span className="font-mono text-[11px] text-muted-foreground/30">—</span>
                  )}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
      </div>
  )
}
