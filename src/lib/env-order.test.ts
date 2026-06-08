import { describe, it, expect } from "vitest"
import { sortEnvironments } from "./env-order"

describe("sortEnvironments", () => {
  it("places dev before uat before prod", () => {
    expect(sortEnvironments(["prod", "dev", "uat"])).toEqual(["dev", "uat", "prod"])
  })

  it("handles a subset of known envs", () => {
    expect(sortEnvironments(["prod", "uat"])).toEqual(["uat", "prod"])
  })

  it("appends unknown envs alphabetically after prod", () => {
    expect(sortEnvironments(["prod", "dev", "canary", "uat"])).toEqual(["dev", "uat", "prod", "canary"])
  })

  it("handles an empty array", () => {
    expect(sortEnvironments([])).toEqual([])
  })

  it("deduplicates entries", () => {
    expect(sortEnvironments(["dev", "dev", "prod"])).toEqual(["dev", "prod"])
  })
})
