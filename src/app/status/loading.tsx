export default function Loading() {
  return (
    <main className="min-h-screen">
      <header className="relative border-b border-border bg-card px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-[6px] bg-muted border border-border animate-pulse" />
          <div className="flex items-center gap-2.5">
            <div className="h-3.5 w-28 rounded bg-muted animate-pulse" />
            <div className="h-3 w-3 rounded bg-muted animate-pulse" />
            <div className="h-3 w-16 rounded bg-muted animate-pulse" />
          </div>
        </div>
        <div className="h-3 w-32 rounded bg-muted animate-pulse" />
        <div className="h-3 w-20 rounded bg-muted animate-pulse" />
      </header>

      <div className="px-6 py-5 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-[8px] border border-border bg-card p-4">
              <div className="h-2.5 w-16 rounded bg-muted animate-pulse mb-4" />
              <div className="space-y-2.5">
                <div className="h-3.5 w-full rounded bg-muted animate-pulse" />
                <div className="h-3.5 w-3/4 rounded bg-muted animate-pulse" />
                <div className="h-3.5 w-1/2 rounded bg-muted animate-pulse" />
              </div>
            </div>
          ))}
        </div>

        <div>
          <div className="h-2.5 w-24 rounded bg-muted animate-pulse mb-3" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-[8px] border border-border bg-card p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-4 w-20 rounded bg-muted animate-pulse" />
                  <div className="h-3 w-10 rounded bg-muted animate-pulse" />
                </div>
                <div className="h-3 w-full rounded bg-muted animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
