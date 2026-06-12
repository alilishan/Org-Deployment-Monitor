import type { GatewayStatus } from "@/types/status"

export class GatewayError extends Error {
  constructor(public readonly status: number, message?: string) {
    super(message ?? `Gateway API error (${status})`)
  }
}

function env(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing environment variable: ${name}`)
  return value
}

// Tokens are valid for 30 minutes; re-sign a little early
const TOKEN_TTL_MS = 25 * 60_000
let cachedToken: { token: string; expiresAt: number } | null = null

async function signToken(): Promise<string> {
  const res = await fetch(`${env("API_URL")}/sign`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      appid: env("API_APP_ID"),
      key: env("API_APP_KEY"),
      secret: env("API_APP_SECRET"),
    }),
    cache: "no-store",
  })
  if (!res.ok) throw new GatewayError(res.status, `Token signing failed (${res.status})`)
  const body = (await res.json()) as { token?: string }
  if (!body.token) throw new GatewayError(res.status, "Token signing returned no token")
  return body.token
}

async function getToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) return cachedToken.token
  const token = await signToken()
  cachedToken = { token, expiresAt: Date.now() + TOKEN_TTL_MS }
  return token
}

async function statusRequest(token: string): Promise<Response> {
  return fetch(`${env("API_URL")}/status`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "direct-access-appid": env("API_APP_ID"),
    },
    cache: "no-store",
  })
}

export type GatewaySnapshot = { status: GatewayStatus; fetchedAt: number }

export async function fetchGatewayStatus(): Promise<GatewaySnapshot> {
  let res = await statusRequest(await getToken())

  // 403 can mean the cached token went stale — re-sign once and retry
  if (res.status === 403 && cachedToken) {
    cachedToken = null
    res = await statusRequest(await getToken())
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "")
    throw new GatewayError(res.status, body || `Status request failed (${res.status})`)
  }
  const status = (await res.json()) as GatewayStatus
  return { status, fetchedAt: Date.now() }
}
