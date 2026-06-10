"use client"

import { Fragment, useState } from "react"
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

const envDot: Record<string, string> = {
  dev:  "bg-cyan-500 dark:bg-cyan-400",
  uat:  "bg-amber-500 dark:bg-amber-400",
  prod: "bg-emerald-500 dark:bg-emerald-400",
}

const TEMPLATE_REPOS = new Set(["bucc-app-template", "bucc-service-template"])

export default function DeploymentTable({ repos }: Props) {
  const [showTemplates, setShowTemplates] = useState(false)

  const visibleRepos = showTemplates
    ? repos
    : repos.filter(r => !TEMPLATE_REPOS.has(r.name))

  const hiddenCount = repos.filter(r => TEMPLATE_REPOS.has(r.name)).length

  const allEnvs = sortEnvironments([
    ...new Set(visibleRepos.flatMap(r => r.environments.map(e => e.environment))),
  ])

  return (
    <div className="space-y-3">
      {hiddenCount > 0 && (
        <div className="flex items-center justify-end">
          <button
            onClick={() => setShowTemplates(v => !v)}
            className="font-mono text-[11px] px-3 py-1.5 rounded-[5px] border border-border bg-background text-muted-foreground hover:text-foreground hover:border-muted-foreground/40 transition-colors duration-150"
          >
            {showTemplates ? "Hide template repos" : `Show template repos (${hiddenCount})`}
          </button>
        </div>
      )}
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
          </TableRow>
        </TableHeader>
        <TableBody>
          {visibleRepos.map((repo, rowIndex) => {
            const envMap = new Map(repo.environments.map(e => [e.environment, e]))
            const tagFingerprints = repo.environments
              .map(e => [...e.imageTags].sort().join(","))
              .filter(s => s !== "")
            const imageDrifted = tagFingerprints.length > 1 && new Set(tagFingerprints).size > 1
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
                        ⚠ drift
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
                          <span className={`font-mono text-sm ${sameAsNext ? "text-border" : "text-muted-foreground/50"}`}>
                            →
                          </span>
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
      </div>
    </div>
  )
}
