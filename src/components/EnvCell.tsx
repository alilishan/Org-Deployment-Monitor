"use client"

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { formatRelative } from "@/lib/format-date"
import { isShaVersion } from "@/lib/version"
import type { EnvDeployment, DeploymentStatus } from "@/types/deployment"

const statusClass: Record<DeploymentStatus, string> = {
  success: "status-badge status-success",
  failure: "status-badge status-failure",
  pending: "status-badge status-pending",
  none:    "status-badge status-none",
}

const statusIcon: Partial<Record<DeploymentStatus, string>> = {
  failure: "✗",
  pending: "◌",
}

function tagClass(tag: string): string {
  if (tag === "main" || tag.startsWith("main.") || tag.startsWith("main-")) return "tag-chip tag-chip-green"
  if (/^v?\d+\.\d+(\.\d+)?(-\w+)?$/.test(tag)) return "tag-chip tag-chip-amber"
  return "tag-chip tag-chip-red"
}

type Props = { deployment: EnvDeployment | null }

export default function EnvCell({ deployment }: Props) {
  if (!deployment) {
    return <span className="font-mono text-[11px] text-muted-foreground/30">—</span>
  }

  const icon = statusIcon[deployment.status]
  // Blue for unreleased commits (short-SHA versions); failure/pending colors take precedence
  const badgeClass =
    deployment.status === "success" && isShaVersion(deployment.version)
      ? "status-badge status-sha"
      : statusClass[deployment.status]

  return (
    <div className="flex flex-col gap-1.5">
      <Tooltip>
        <TooltipTrigger
          render={(props) => (
            <a
              {...props}
              href={deployment.deploymentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block"
            >
              <span className={badgeClass}>
                {icon && <span className="mr-1 opacity-70">{icon}</span>}
                {deployment.version ?? "unknown"}
              </span>
            </a>
          )}
        />
        <TooltipContent
          side="top"
          className="bg-card border border-border text-foreground shadow-xl"
        >
          <div className="text-xs space-y-0.5">
            <p>
              <span className="text-muted-foreground">by </span>
              <span className="font-semibold">{deployment.deployedBy ?? "unknown"}</span>
            </p>
            {deployment.deployedAt && (
              <p className="text-muted-foreground">{new Date(deployment.deployedAt).toLocaleString()}</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>

      {deployment.imageTags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {deployment.imageTags.map(tag => (
            <span key={tag} className={tagClass(tag)}>{tag}</span>
          ))}
        </div>
      )}

      {(deployment.deployedBy || deployment.deployedAt) && (
        <div className="font-mono text-[11px] leading-tight">
          {deployment.deployedBy && (
            <span className="text-foreground/60">{deployment.deployedBy}</span>
          )}
          {deployment.deployedAt && (
            <span className="text-muted-foreground"> · {formatRelative(deployment.deployedAt)}</span>
          )}
        </div>
      )}
    </div>
  )
}
