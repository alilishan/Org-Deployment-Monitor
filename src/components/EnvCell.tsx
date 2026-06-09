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

  return (
    <div className="flex flex-col gap-0.5">
      <Tooltip>
        <TooltipTrigger
          render={(props) => (
            <a {...props} href={deployment.deploymentUrl} target="_blank" rel="noopener noreferrer">
              <Badge className={`font-mono text-xs ${statusStyles[deployment.status]}`}>
                {deployment.version ?? "unknown"}
                {statusSuffix[deployment.status] ?? ""}
              </Badge>
            </a>
          )}
        />
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
