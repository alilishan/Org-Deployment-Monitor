"use client"

import {
  Server,
  Clock,
  MemoryStick,
  Rabbit,
  HeartPulse,
  Boxes,
  Route,
  type LucideIcon,
} from "lucide-react"
import { refreshStatus } from "@/app/actions"
import RefreshButton from "@/components/RefreshButton"
import ThemeToggle from "@/components/ThemeToggle"
import HeaderNav from "@/components/HeaderNav"
import { formatUptime, formatBytes, formatAge, heartbeatState, type HeartbeatState } from "@/lib/status-format"
import type { GatewayStatus, GatewayService } from "@/types/status"

type Props = {
  status: GatewayStatus
  fetchedAt: number
  userName: string | null | undefined
}

const stateDot: Record<HeartbeatState, string> = {
  ok:    "bg-emerald-500 dark:bg-emerald-400",
  stale: "bg-amber-500 dark:bg-amber-400",
  down:  "bg-red-500 dark:bg-red-400",
}

const statePill: Record<HeartbeatState, string> = {
  ok:    "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900",
  stale: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900",
  down:  "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900",
}

const stateLabel: Record<HeartbeatState, string> = {
  ok: "up",
  stale: "stale",
  down: "down",
}

function serviceState(service: GatewayService, now: number): HeartbeatState {
  const states = service.instances.map(i => heartbeatState(i.lastHeartbeat, now))
  if (states.some(s => s === "down")) return "down"
  if (states.some(s => s === "stale")) return "stale"
  return "ok"
}

function Card({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[8px] border border-border bg-card p-4 transition-colors hover:border-muted-foreground/30">
      <div className="flex items-center gap-2 mb-3.5">
        <div className="flex items-center justify-center w-6 h-6 rounded-[5px] bg-muted border border-border">
          <Icon className="w-3.5 h-3.5 text-muted-foreground" />
        </div>
        <span className="font-mono text-[10px] tracking-widest text-muted-foreground/60 uppercase">
          {title}
        </span>
      </div>
      {children}
    </div>
  )
}

function Stat({ label, value, accent }: { label: string; value: string | number; accent?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="font-mono text-[11px] text-muted-foreground">{label}</span>
      <span className={`font-mono text-[12px] font-semibold ${accent ?? "text-foreground"}`}>{value}</span>
    </div>
  )
}

export default function StatusShell({ status, fetchedAt, userName }: Props) {
  const rabbitOk = status.rabbitmq.connection === "ok" && status.rabbitmq.connection_details.connected
  const mgmt = status.rabbitmq.management
  const downCount = status.services.filter(s => serviceState(s, fetchedAt) === "down").length
  const heapPct = Math.min(100, Math.round((status.memory.heapUsed / status.memory.heapTotal) * 100))

  return (
    <main className="min-h-screen">
      <header className="relative border-b border-border bg-card px-6 py-3 flex items-center justify-between gap-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/[0.04] via-transparent to-transparent pointer-events-none" />

        <div className="relative flex items-center gap-3 shrink-0">
          <div className="flex items-center justify-center w-7 h-7 rounded-[6px] bg-muted border border-border">
            <div className="w-2 h-2 rounded-full bg-cyan-500 dark:bg-cyan-400" />
          </div>
          <div className="flex items-center gap-2.5">
            <span className="font-heading font-bold text-foreground tracking-wide text-[13px] uppercase">
              BUCC-Ounch
            </span>
            <span className="text-muted-foreground/40 font-mono text-sm leading-none">╱</span>
            <span className="font-heading font-semibold text-muted-foreground tracking-widest text-[11px] uppercase">
              Status
            </span>
          </div>
          <HeaderNav />
        </div>

        <div className="relative flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="relative flex items-center justify-center">
              <span className={`w-1.5 h-1.5 rounded-full ${downCount === 0 ? "bg-emerald-500 dark:bg-emerald-400" : "bg-red-500 dark:bg-red-400"}`} />
              {downCount === 0 && (
                <span className="absolute w-3 h-3 rounded-full bg-emerald-500/20 dark:bg-emerald-400/20 animate-ping" />
              )}
            </div>
            <span className="font-mono text-[11px] text-muted-foreground tracking-wider">
              {downCount === 0
                ? `all ${status.services.length} services up`
                : `${downCount} of ${status.services.length} services down`}
            </span>
          </div>
        </div>

        <div className="relative flex items-center gap-2">
          <form action={refreshStatus}>
            <RefreshButton />
          </form>
          <div className="w-px h-5 bg-border mx-1" />
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 opacity-75" />
            <span className="font-mono text-[11px] text-muted-foreground">{userName}</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <div className="px-6 py-5 space-y-5">
        {/* Gateway overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card icon={Server} title="Gateway">
            <div className="space-y-2">
              <Stat label="name" value={status.name} />
              <Stat label="version" value={status.version} />
              <Stat label="env" value={status.environment} accent="text-cyan-600 dark:text-cyan-400" />
            </div>
          </Card>

          <Card icon={Clock} title="Uptime">
            <div className="font-mono text-2xl font-semibold text-foreground leading-none">
              {formatUptime(status.uptime)}
            </div>
            <div className="mt-3 font-mono text-[11px] text-muted-foreground">
              checked {formatAge(new Date(status.timestamp).getTime(), fetchedAt)}
            </div>
          </Card>

          <Card icon={MemoryStick} title="Memory">
            <div className="flex items-baseline justify-between mb-2">
              <span className="font-mono text-[12px] font-semibold text-foreground">
                {formatBytes(status.memory.heapUsed)}
              </span>
              <span className="font-mono text-[10px] text-muted-foreground">
                of {formatBytes(status.memory.heapTotal)} heap
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-3">
              <div
                className={`h-full rounded-full ${heapPct > 85 ? "bg-red-500 dark:bg-red-400" : heapPct > 70 ? "bg-amber-500 dark:bg-amber-400" : "bg-cyan-500 dark:bg-cyan-400"}`}
                style={{ width: `${heapPct}%` }}
              />
            </div>
            <Stat label="rss" value={formatBytes(status.memory.rss)} />
          </Card>

          <Card icon={Rabbit} title="RabbitMQ">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-[4px] border px-1.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider ${rabbitOk ? statePill.ok : statePill.down}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${rabbitOk ? stateDot.ok : stateDot.down}`} />
                  {rabbitOk ? "connected" : "disconnected"}
                </span>
                {mgmt && <span className="font-mono text-[10px] text-muted-foreground/60">v{mgmt.version}</span>}
              </div>
              {mgmt && (
                <>
                  <Stat label="queues / consumers" value={`${mgmt.queues} / ${mgmt.consumers}`} />
                  <Stat
                    label="messages"
                    value={mgmt.messages.total}
                    accent={mgmt.messages.total > 0 ? "text-amber-600 dark:text-amber-400" : undefined}
                  />
                </>
              )}
            </div>
          </Card>
        </div>

        {/* Services */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Boxes className="w-3.5 h-3.5 text-muted-foreground/60" />
            <span className="font-mono text-[10px] tracking-widest text-muted-foreground/60 uppercase">
              Services ({status.services.length})
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {status.services.map(service => {
              const state = serviceState(service, fetchedAt)
              return (
                <div
                  key={service.serviceName}
                  className="rounded-[8px] border border-border bg-card p-4 transition-colors hover:border-muted-foreground/30"
                >
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="font-mono font-semibold text-[13px] text-foreground">
                      {service.serviceName}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-[4px] border px-1.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider ${statePill[state]}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${stateDot[state]}`} />
                      {stateLabel[state]}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {service.instances.map(instance => (
                      <div key={instance.url} className="flex items-center justify-between gap-3">
                        <span className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground truncate">
                          <Route className="w-3 h-3 text-muted-foreground/50 shrink-0" />
                          {instance.proxyUrl}
                        </span>
                        <span className="flex items-center gap-1 font-mono text-[11px] text-muted-foreground/60 whitespace-nowrap">
                          <HeartPulse className="w-3 h-3" />
                          {formatAge(instance.lastHeartbeat, fetchedAt)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </main>
  )
}
