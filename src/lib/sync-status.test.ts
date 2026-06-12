import { describe, it, expect } from "vitest"
import { getSyncStatus } from "./sync-status"
import type { EnvDeployment } from "@/types/deployment"

function env(environment: string, version: string | null): EnvDeployment {
  return { environment, version, imageTags: [], status: "success", deployedAt: null, deployedBy: null, deploymentUrl: "" }
}

describe("getSyncStatus", () => {
  it("returns All Synced when dev, uat, and prod share the same version", () => {
    expect(getSyncStatus([env("dev", "1.0.0"), env("uat", "1.0.0"), env("prod", "1.0.0")]))
      .toEqual({ kind: "synced", label: "All Synced" })
  })

  it("returns In Dev when dev differs from uat", () => {
    expect(getSyncStatus([env("dev", "1.1.0"), env("uat", "1.0.0"), env("prod", "1.0.0")]))
      .toEqual({ kind: "pending", env: "dev", label: "In Dev" })
  })

  it("returns In UAT when dev matches uat but prod is behind", () => {
    expect(getSyncStatus([env("dev", "1.1.0"), env("uat", "1.1.0"), env("prod", "1.0.0")]))
      .toEqual({ kind: "pending", env: "uat", label: "In UAT" })
  })

  it("returns In Dev when dev differs even if uat is also ahead of prod", () => {
    expect(getSyncStatus([env("dev", "1.2.0"), env("uat", "1.1.0"), env("prod", "1.0.0")]))
      .toEqual({ kind: "pending", env: "dev", label: "In Dev" })
  })

  it("compares adjacent present envs when one is missing", () => {
    expect(getSyncStatus([env("uat", "1.1.0"), env("prod", "1.0.0")]))
      .toEqual({ kind: "pending", env: "uat", label: "In UAT" })
    expect(getSyncStatus([env("dev", "1.1.0"), env("prod", "1.0.0")]))
      .toEqual({ kind: "pending", env: "dev", label: "In Dev" })
  })

  it("returns All Synced for two matching envs", () => {
    expect(getSyncStatus([env("dev", "1.0.0"), env("prod", "1.0.0")]))
      .toEqual({ kind: "synced", label: "All Synced" })
  })

  it("returns null when fewer than two envs have a version", () => {
    expect(getSyncStatus([env("dev", "1.0.0")])).toBeNull()
    expect(getSyncStatus([env("dev", "1.0.0"), env("uat", null)])).toBeNull()
    expect(getSyncStatus([])).toBeNull()
  })

  it("ignores envs with a null version when comparing the rest", () => {
    expect(getSyncStatus([env("dev", null), env("uat", "1.1.0"), env("prod", "1.0.0")]))
      .toEqual({ kind: "pending", env: "uat", label: "In UAT" })
  })

  it("sorts environments into pipeline order before comparing", () => {
    expect(getSyncStatus([env("prod", "1.0.0"), env("dev", "1.1.0"), env("uat", "1.0.0")]))
      .toEqual({ kind: "pending", env: "dev", label: "In Dev" })
  })
})
