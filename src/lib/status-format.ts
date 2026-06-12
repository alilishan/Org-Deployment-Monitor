export function formatUptime(seconds: number): string {
  const s = Math.floor(seconds)
  const days = Math.floor(s / 86_400)
  const hours = Math.floor((s % 86_400) / 3600)
  const mins = Math.floor((s % 3600) / 60)
  const secs = s % 60
  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${mins}m`
  if (mins > 0) return `${mins}m ${secs}s`
  return `${secs}s`
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  const units = ["KB", "MB", "GB", "TB"]
  let value = bytes
  let unit = ""
  for (const u of units) {
    value /= 1024
    unit = u
    if (value < 1024) break
  }
  return `${value.toFixed(1)} ${unit}`
}

export function formatAge(thenMs: number, nowMs: number): string {
  const secs = Math.max(0, Math.floor((nowMs - thenMs) / 1000))
  if (secs < 60) return `${secs}s ago`
  const mins = Math.floor(secs / 60)
  if (mins < 60) return `${mins}m ago`
  return `${Math.floor(mins / 60)}h ago`
}

export type HeartbeatState = "ok" | "stale" | "down"

const STALE_AFTER_MS = 90_000
const DOWN_AFTER_MS = 300_000

export function heartbeatState(lastHeartbeatMs: number, nowMs: number): HeartbeatState {
  const age = nowMs - lastHeartbeatMs
  if (age <= STALE_AFTER_MS) return "ok"
  if (age <= DOWN_AFTER_MS) return "stale"
  return "down"
}
