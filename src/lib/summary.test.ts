import { describe, it, expect } from "vitest"
import { computeSummary } from "./summary"
import type { RepoDeployment } from "@/types/deployment"

const repos: RepoDeployment[] = [
  {
    name: "repo-a", fullName: "org/repo-a", latestTag: "v1.0.0",
    environments: [
      { environment: "dev",  version: "v1.0.0", imageTag: null, status: "success", deployedAt: null, deployedBy: null, deploymentUrl: "" },
      { environment: "prod", version: "v0.9.0", imageTag: null, status: "failure", deployedAt: null, deployedBy: null, deploymentUrl: "" },
    ],
  },
  {
    name: "repo-b", fullName: "org/repo-b", latestTag: "v2.0.0",
    environments: [
      { environment: "dev", version: "v2.0.0", imageTag: null, status: "success", deployedAt: null, deployedBy: null, deploymentUrl: "" },
      { environment: "uat", version: "v1.9.0", imageTag: null, status: "pending", deployedAt: null, deployedBy: null, deploymentUrl: "" },
    ],
  },
]

describe("computeSummary", () => {
  it("counts healthy, pending, and failed across all env cells", () => {
    expect(computeSummary(repos)).toEqual({ healthy: 2, pending: 1, failed: 1 })
  })

  it("returns zeros for empty repos array", () => {
    expect(computeSummary([])).toEqual({ healthy: 0, pending: 0, failed: 0 })
  })
})
