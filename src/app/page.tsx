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
        <header className="relative border-b border-[#192034] bg-[#0c1020] px-6 py-4 flex items-center justify-between overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/[0.04] via-transparent to-transparent pointer-events-none" />
          <div className="relative flex items-center gap-3">
            <div className="flex items-center justify-center w-7 h-7 rounded-[6px] bg-[#192034] border border-[#243050]">
              <div className="w-2 h-2 rounded-full bg-cyan-400" />
            </div>
            <div className="flex items-center gap-2.5">
              <span className="font-heading font-bold text-[#bcc6dc] tracking-wide text-[13px] uppercase">
                BUCC-Ounch
              </span>
              <span className="text-[#243050] font-mono text-sm leading-none">╱</span>
              <span className="font-heading font-semibold text-[#4d6080] tracking-widest text-[11px] uppercase">
                Deployments
              </span>
            </div>
          </div>
          <div className="relative flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 opacity-75" />
            <span className="font-mono text-[11px] text-[#4d6080]">{session.user?.name}</span>
          </div>
        </header>
        <SummaryBar {...summary} />
        <div className="px-6 py-5">
          <DeploymentTable repos={repos} />
        </div>
      </main>
    )
  } catch (e) {
    if (e instanceof GitHubAuthError) return <AuthErrorBanner />
    throw e
  }
}
