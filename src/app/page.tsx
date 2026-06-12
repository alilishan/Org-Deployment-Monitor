import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { fetchDashboard, GitHubAuthError } from "@/lib/github"
import { computeSummary } from "@/lib/summary"
import DashboardShell from "@/components/DashboardShell"
import AuthErrorBanner from "@/components/AuthErrorBanner"

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.accessToken) redirect("/api/auth/signin")

  try {
    const repos = await fetchDashboard(session.accessToken)
    const summary = computeSummary(repos)

    return (
      <DashboardShell repos={repos} summary={summary} userName={session.user?.name} />
    )
  } catch (e) {
    if (e instanceof GitHubAuthError) return <AuthErrorBanner error={e} />
    throw e
  }
}
