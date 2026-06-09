export type DeploymentStatus = "success" | "failure" | "pending" | "none"

export type EnvDeployment = {
  environment: string
  version: string | null
  status: DeploymentStatus
  deployedAt: string | null
  deployedBy: string | null
  deploymentUrl: string
}

export type RepoDeployment = {
  name: string
  fullName: string
  latestTag: string | null
  latestImageTag: string | null
  environments: EnvDeployment[]
}
