"use client"

import { useState } from "react"
import { refreshDashboard } from "@/app/actions"
import RefreshButton from "@/components/RefreshButton"
import ThemeToggle from "@/components/ThemeToggle"
import HeaderNav from "@/components/HeaderNav"
import DeploymentTable from "@/components/DeploymentTable"
import { TEMPLATE_REPOS } from "@/lib/template-repos"
import type { RepoDeployment } from "@/types/deployment"
import type { Summary } from "@/lib/summary"

type Props = {
  repos: RepoDeployment[]
  summary: Summary
  userName: string | null | undefined
}

export default function DashboardShell({ repos, summary, userName }: Props) {
  const [showTemplates, setShowTemplates] = useState(false)
  const hiddenCount = repos.filter(r => TEMPLATE_REPOS.has(r.name)).length

  return (
    <main className="min-h-screen">
      <header className="relative border-b border-border bg-card px-6 py-3 flex items-center justify-between gap-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/[0.04] via-transparent to-transparent pointer-events-none" />

        {/* Logo */}
        <div className="relative flex items-center gap-3 shrink-0">
          <div className="flex items-center justify-center w-7 h-7 rounded-[6px] bg-muted border border-border">
            <div className="w-2 h-2 rounded-full bg-cyan-500 dark:bg-cyan-400" />
          </div>
          <div className="flex items-center gap-2.5">
            <span className="font-heading font-bold text-foreground tracking-wide text-[13px] uppercase">
              BUCC-Ounch
            </span>
            <span className="text-muted-foreground/40 font-mono text-sm leading-none">╱</span>
            <span className="font-heading font-semibold text-muted-foreground tracking-widest text-[11px] uppercase">
              Deployments
            </span>
          </div>
          <HeaderNav />
        </div>

        {/* Summary stats */}
        <div className="relative flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="relative flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
              <span className="absolute w-3 h-3 rounded-full bg-emerald-500/20 dark:bg-emerald-400/20 animate-ping" />
            </div>
            <span className="font-mono text-[12px] font-semibold text-emerald-600 dark:text-emerald-400">{summary.healthy}</span>
            <span className="font-mono text-[10px] text-muted-foreground tracking-wider">healthy</span>
          </div>
          <span className="text-border font-mono">·</span>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400 opacity-80" />
            <span className="font-mono text-[12px] font-semibold text-amber-600 dark:text-amber-400">{summary.pending}</span>
            <span className="font-mono text-[10px] text-muted-foreground tracking-wider">pending</span>
          </div>
          <span className="text-border font-mono">·</span>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 dark:bg-red-400 opacity-80" />
            <span className="font-mono text-[12px] font-semibold text-red-600 dark:text-red-400">{summary.failed}</span>
            <span className="font-mono text-[10px] text-muted-foreground tracking-wider">failed</span>
          </div>
        </div>

        {/* Controls */}
        <div className="relative flex items-center gap-2">
          {hiddenCount > 0 && (
            <button
              onClick={() => setShowTemplates(v => !v)}
              className="font-mono text-[11px] px-3 py-1.5 rounded-[5px] border border-border bg-background text-muted-foreground hover:text-foreground hover:border-muted-foreground/40 transition-colors duration-150"
            >
              {showTemplates ? "Hide templates" : `Templates (${hiddenCount})`}
            </button>
          )}
          <form action={refreshDashboard}>
            <RefreshButton />
          </form>
          <div className="w-px h-5 bg-border mx-1" />
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 opacity-75" />
            <span className="font-mono text-[11px] text-muted-foreground">{userName}</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <div className="px-6 py-5">
        <DeploymentTable repos={repos} showTemplates={showTemplates} />
      </div>
    </main>
  )
}
