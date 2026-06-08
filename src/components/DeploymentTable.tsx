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
