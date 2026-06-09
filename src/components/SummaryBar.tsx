import { refreshDashboard } from "@/app/actions"
import RefreshButton from "@/components/RefreshButton"
import type { Summary } from "@/lib/summary"

export default function SummaryBar({ healthy, pending, failed }: Summary) {
  return (
    <div className="flex items-center gap-6 px-6 py-3 border-b border-border bg-muted/20 text-sm">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-green-500 inline-block" />
        <span className="text-muted-foreground">{healthy} healthy</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-amber-500 inline-block" />
        <span className="text-muted-foreground">{pending} pending</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-red-500 inline-block" />
        <span className="text-muted-foreground">{failed} failed</span>
      </div>
      <form action={refreshDashboard} className="ml-auto">
        <RefreshButton />
      </form>
    </div>
  )
}
