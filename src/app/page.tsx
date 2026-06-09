import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { fetchDashboard, GitHubAuthError } from "@/lib/github"
import { computeSummary } from "@/lib/summary"
import DeploymentTable from "@/components/DeploymentTable"
import SummaryBar from "@/components/SummaryBar"
import AuthErrorBanner from "@/components/AuthErrorBanner"

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.accessToken) redirect("/api/auth/signin")

  try {
    const repos = await fetchDashboard(session.accessToken)
    const summary = computeSummary(repos)

    return (
      <main className="min-h-screen">
        <header className="border-b border-border bg-background px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-semibold">BUCC-Ounch</span>
            <span className="text-muted-foreground">/</span>
            <span className="text-muted-foreground">Deployments</span>
          </div>
          <span className="text-xs text-muted-foreground">{session.user?.name}</span>
        </header>
        <SummaryBar {...summary} />
        <div className="p-6">
          <DeploymentTable repos={repos} />
        </div>
      </main>
    )
  } catch (e) {
    if (e instanceof GitHubAuthError) return <AuthErrorBanner />
    throw e
  }
}
