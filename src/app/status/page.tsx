import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { fetchGatewayStatus, GatewayError, type GatewaySnapshot } from "@/lib/gateway"
import StatusShell from "@/components/StatusShell"
import { refreshStatus } from "@/app/actions"
import RefreshButton from "@/components/RefreshButton"

function StatusError({ error }: { error: unknown }) {
  const message = error instanceof GatewayError
    ? `Gateway returned ${error.status}`
    : "Could not reach the gateway"
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="rounded-[8px] border border-border bg-card p-6 max-w-md w-full text-center space-y-4">
        <div className="font-mono text-[10px] tracking-widest text-muted-foreground/60 uppercase">
          Gateway Status
        </div>
        <p className="font-mono text-[13px] text-red-600 dark:text-red-400">{message}</p>
        <p className="font-mono text-[11px] text-muted-foreground">
          {error instanceof Error ? error.message : String(error)}
        </p>
        <form action={refreshStatus} className="flex justify-center">
          <RefreshButton />
        </form>
      </div>
    </main>
  )
}

export default async function StatusPage() {
  const session = await auth()
  if (!session?.accessToken) redirect("/api/auth/signin")

  let snapshot: GatewaySnapshot | null = null
  let error: unknown = null
  try {
    snapshot = await fetchGatewayStatus()
  } catch (e) {
    error = e
  }

  if (!snapshot) return <StatusError error={error} />
  return (
    <StatusShell
      status={snapshot.status}
      fetchedAt={snapshot.fetchedAt}
      userName={session.user?.name}
    />
  )
}
