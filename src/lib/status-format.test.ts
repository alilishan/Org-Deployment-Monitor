import { describe, it, expect } from "vitest"
import { formatUptime, formatBytes, formatAge, heartbeatState } from "./status-format"

describe("formatUptime", () => {
  it("formats seconds-only durations", () => {
    expect(formatUptime(42)).toBe("42s")
  })

  it("formats minutes and seconds", () => {
    expect(formatUptime(125)).toBe("2m 5s")
  })

  it("formats hours and minutes, dropping seconds", () => {
    expect(formatUptime(3 * 3600 + 12 * 60 + 9)).toBe("3h 12m")
  })

  it("formats days and hours, dropping minutes", () => {
    expect(formatUptime(97136.94)).toBe("1d 2h")
  })
})

describe("formatBytes", () => {
  it("formats bytes below a KB", () => {
    expect(formatBytes(512)).toBe("512 B")
  })

  it("formats KB and MB with one decimal", () => {
    expect(formatBytes(202256)).toBe("197.5 KB")
    expect(formatBytes(97189888)).toBe("92.7 MB")
  })

  it("formats GB", () => {
    expect(formatBytes(2147483648)).toBe("2.0 GB")
  })
})

describe("formatAge", () => {
  const now = 1781247466000

  it("formats sub-minute ages in seconds", () => {
    expect(formatAge(now - 12_000, now)).toBe("12s ago")
  })

  it("formats minutes and hours", () => {
    expect(formatAge(now - 180_000, now)).toBe("3m ago")
    expect(formatAge(now - 7_200_000, now)).toBe("2h ago")
  })

  it("never goes negative on clock skew", () => {
    expect(formatAge(now + 5_000, now)).toBe("0s ago")
  })
})

describe("heartbeatState", () => {
  const now = 1781247466000

  it("is ok when the heartbeat is under 90 seconds old", () => {
    expect(heartbeatState(now - 10_000, now)).toBe("ok")
    expect(heartbeatState(now - 89_000, now)).toBe("ok")
  })

  it("is stale between 90 seconds and 5 minutes", () => {
    expect(heartbeatState(now - 91_000, now)).toBe("stale")
    expect(heartbeatState(now - 299_000, now)).toBe("stale")
  })

  it("is down after 5 minutes", () => {
    expect(heartbeatState(now - 301_000, now)).toBe("down")
  })
})
