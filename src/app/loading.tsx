export default function Loading() {
  return (
    <main className="min-h-screen">
      <header className="border-b border-border bg-background px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-semibold">BUCC-Ounch</span>
          <span className="text-muted-foreground">/</span>
          <span className="text-muted-foreground">Deployments</span>
        </div>
        <div className="h-3 w-24 rounded bg-muted animate-pulse" />
      </header>
      <div className="flex items-center gap-6 px-6 py-3 border-b border-border bg-muted/20">
        <div className="h-3 w-20 rounded bg-muted animate-pulse" />
        <div className="h-3 w-20 rounded bg-muted animate-pulse" />
        <div className="h-3 w-20 rounded bg-muted animate-pulse" />
        <div className="ml-auto h-7 w-20 rounded bg-muted animate-pulse" />
      </div>
      <div className="p-6 space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-12 rounded bg-muted/50 animate-pulse" />
        ))}
      </div>
    </main>
  )
}
