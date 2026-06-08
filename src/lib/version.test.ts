import { describe, it, expect } from "vitest"
import { resolveVersion } from "./version"

const tags = [
  { name: "v2.2.0", commit: { sha: "abc123def456abc123def456abc123def456abc1" } },
  { name: "v2.1.0", commit: { sha: "deadbeefdeadbeefdeadbeefdeadbeefdeadbeef" } },
]

describe("resolveVersion", () => {
  it("returns the ref when it exactly matches a tag name", () => {
    expect(resolveVersion("v2.2.0", tags)).toBe("v2.2.0")
  })

  it("returns the tag name when ref is a full SHA matching a tag commit", () => {
    expect(resolveVersion("abc123def456abc123def456abc123def456abc1", tags)).toBe("v2.2.0")
  })

  it("returns the tag name when ref is a short SHA prefix of a tag commit", () => {
    expect(resolveVersion("abc123d", tags)).toBe("v2.2.0")
  })

  it("returns a 7-char short SHA when no tag matches", () => {
    expect(resolveVersion("999999abcdef0123456789", tags)).toBe("999999a")
  })

  it("returns null when ref is null", () => {
    expect(resolveVersion(null, tags)).toBeNull()
  })
})
