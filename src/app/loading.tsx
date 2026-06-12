export default function Loading() {
  return (
    <main className="min-h-screen">
      <header className="relative border-b border-border bg-card px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-[6px] bg-muted border border-border animate-pulse" />
          <div className="flex items-center gap-2.5">
            <div className="h-3.5 w-28 rounded bg-muted animate-pulse" />
            <div className="h-3 w-3 rounded bg-muted animate-pulse" />
            <div className="h-3 w-24 rounded bg-muted animate-pulse" />
          </div>
        </div>
        <div className="h-3 w-20 rounded bg-muted animate-pulse" />
      </header>

      <div className="flex items-center gap-0 border-b border-border bg-muted/40 dark:bg-[#0a0e1c]">
        {["w-28", "w-24", "w-24"].map((w, i) => (
          <div key={i} className="flex items-center gap-3 px-6 py-3.5 border-r border-border">
            <div className="w-2 h-2 rounded-full bg-muted animate-pulse" />
            <div className="flex flex-col gap-1.5">
              <div className="h-5 w-6 rounded bg-muted animate-pulse" />
              <div className={`h-2.5 ${w} rounded bg-muted animate-pulse`} />
            </div>
          </div>
        ))}
        <div className="ml-auto px-6">
          <div className="h-8 w-20 rounded-[6px] bg-muted animate-pulse" />
        </div>
      </div>

      <div className="px-6 py-5">
        <div className="rounded-[8px] border border-border overflow-hidden">
          <div className="bg-muted/40 dark:bg-[#0a0e1c] border-b border-border px-5 py-3 flex gap-8">
            <div className="h-3 w-20 rounded bg-muted animate-pulse" />
            <div className="h-3 w-12 rounded bg-muted animate-pulse" />
            <div className="h-3 w-12 rounded bg-muted animate-pulse" />
            <div className="h-3 w-12 rounded bg-muted animate-pulse" />
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={`border-b border-border px-5 py-4 flex gap-8 items-start ${
                i % 2 === 0 ? "bg-background" : "bg-muted/20 dark:bg-[#090c1a]"
              }`}
            >
              <div className="flex flex-col gap-1.5 w-44">
                <div className="h-4 w-36 rounded bg-muted animate-pulse" />
                <div className="h-2.5 w-24 rounded bg-muted animate-pulse" />
              </div>
              {[1, 2, 3].map(j => (
                <div key={j} className="flex flex-col gap-1.5">
                  <div className="h-6 w-28 rounded-[5px] bg-muted animate-pulse" />
                  <div className="flex gap-1">
                    <div className="h-4 w-16 rounded bg-muted animate-pulse" />
                    <div className="h-4 w-14 rounded bg-muted animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
