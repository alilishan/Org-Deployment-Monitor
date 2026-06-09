import { refreshDashboard } from "@/app/actions"
import RefreshButton from "@/components/RefreshButton"
import type { Summary } from "@/lib/summary"

export default function SummaryBar({ healthy, pending, failed }: Summary) {
  return (
    <div className="flex items-center gap-0 border-b border-border bg-muted/30 dark:bg-[#0a0e1c]">
      <div className="flex items-center gap-3 px-6 py-3.5 border-r border-border">
        <div className="relative flex items-center justify-center">
          <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400" />
          <span className="absolute w-4 h-4 rounded-full bg-emerald-500/20 dark:bg-emerald-400/20 animate-ping" />
        </div>
        <div className="flex flex-col">
          <span className="font-heading font-bold text-emerald-600 dark:text-emerald-400 text-lg leading-none">{healthy}</span>
          <span className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase mt-0.5">Healthy</span>
        </div>
      </div>
      <div className="flex items-center gap-3 px-6 py-3.5 border-r border-border">
        <span className="w-2 h-2 rounded-full bg-amber-500 dark:bg-amber-400 opacity-80" />
        <div className="flex flex-col">
          <span className="font-heading font-bold text-amber-600 dark:text-amber-400 text-lg leading-none">{pending}</span>
          <span className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase mt-0.5">Pending</span>
        </div>
      </div>
      <div className="flex items-center gap-3 px-6 py-3.5 border-r border-border">
        <span className="w-2 h-2 rounded-full bg-red-500 dark:bg-red-400 opacity-80" />
        <div className="flex flex-col">
          <span className="font-heading font-bold text-red-600 dark:text-red-400 text-lg leading-none">{failed}</span>
          <span className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase mt-0.5">Failed</span>
        </div>
      </div>
      <form action={refreshDashboard} className="ml-auto px-6">
        <RefreshButton />
      </form>
    </div>
  )
}
