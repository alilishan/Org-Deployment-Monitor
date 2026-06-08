import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { formatRelative } from "./format-date"

describe("formatRelative", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-06-08T12:00:00Z"))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("shows minutes for recent dates", () => {
    expect(formatRelative("2026-06-08T11:45:00Z")).toBe("15m ago")
  })

  it("shows hours for same-day dates", () => {
    expect(formatRelative("2026-06-08T09:00:00Z")).toBe("3h ago")
  })

  it("shows days for older dates", () => {
    expect(formatRelative("2026-06-05T12:00:00Z")).toBe("3d ago")
  })
})
