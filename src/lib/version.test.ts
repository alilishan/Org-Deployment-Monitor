import { describe, it, expect } from "vitest"
import { isShaVersion, resolveVersion } from "./version"

const tags = [
  { name: "v2.2.0", commit: { sha: "abc123def456abc123def456abc123def456abc1" } },
  { name: "v2.1.0", commit: { sha: "deadbeefdeadbeefdeadbeefdeadbeefdeadbeef" } },
]

describe("resolveVersion", () => {
  it("returns the ref when it exactly matches a tag name", () => {
    expect(resolveVersion("v2.2.0", null, tags)).toBe("v2.2.0")
  })

  it("returns the tag name when the deployment sha matches a tag commit, even for branch refs", () => {
    expect(resolveVersion("main", "abc123def456abc123def456abc123def456abc1", tags)).toBe("v2.2.0")
  })

  it("returns the tag name when ref is a full SHA matching a tag commit", () => {
    expect(resolveVersion("abc123def456abc123def456abc123def456abc1", null, tags)).toBe("v2.2.0")
  })

  it("returns the tag name when ref is a short SHA prefix of a tag commit", () => {
    expect(resolveVersion("abc123d", null, tags)).toBe("v2.2.0")
  })

  it("returns a short deployment sha for branch refs on untagged commits", () => {
    expect(resolveVersion("main", "999999abcdef0123456789abcdef0123456789ab", tags)).toBe("999999a")
  })

  it("returns a 7-char short SHA of the ref when no tag matches and there is no sha", () => {
    expect(resolveVersion("999999abcdef0123456789", null, tags)).toBe("999999a")
  })

  it("returns null when ref and sha are null", () => {
    expect(resolveVersion(null, null, tags)).toBeNull()
  })
})

describe("isShaVersion", () => {
  it("recognises a 7-char short SHA", () => {
    expect(isShaVersion("a42e479")).toBe(true)
    expect(isShaVersion("999999a")).toBe(true)
  })

  it("rejects release tags and branch names", () => {
    expect(isShaVersion("0.0.4")).toBe(false)
    expect(isShaVersion("v2.2.0")).toBe(false)
    expect(isShaVersion("main")).toBe(false)
  })

  it("rejects null", () => {
    expect(isShaVersion(null)).toBe(false)
  })
})
