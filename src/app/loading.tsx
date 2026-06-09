export default function Loading() {
  return (
    <main className="min-h-screen">
      <header className="relative border-b border-[#192034] bg-[#0c1020] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-[6px] bg-[#192034] border border-[#243050] animate-pulse" />
          <div className="flex items-center gap-2.5">
            <div className="h-3.5 w-28 rounded bg-[#192034] animate-pulse" />
            <div className="h-3 w-3 rounded bg-[#192034] animate-pulse" />
            <div className="h-3 w-24 rounded bg-[#192034] animate-pulse" />
          </div>
        </div>
        <div className="h-3 w-20 rounded bg-[#192034] animate-pulse" />
      </header>

      <div className="flex items-center gap-0 border-b border-[#192034] bg-[#0a0e1c]">
        {["w-28", "w-24", "w-24"].map((w, i) => (
          <div key={i} className="flex items-center gap-3 px-6 py-3.5 border-r border-[#192034]">
            <div className="w-2 h-2 rounded-full bg-[#192034] animate-pulse" />
            <div className="flex flex-col gap-1.5">
              <div className="h-5 w-6 rounded bg-[#192034] animate-pulse" />
              <div className={`h-2.5 ${w} rounded bg-[#192034] animate-pulse`} />
            </div>
          </div>
        ))}
        <div className="ml-auto px-6">
          <div className="h-8 w-20 rounded-[6px] bg-[#192034] animate-pulse" />
        </div>
      </div>

      <div className="px-6 py-5">
        <div className="rounded-[8px] border border-[#192034] overflow-hidden">
          <div className="bg-[#0a0e1c] border-b border-[#192034] px-5 py-3 flex gap-8">
            <div className="h-3 w-20 rounded bg-[#192034] animate-pulse" />
            <div className="h-3 w-12 rounded bg-[#192034] animate-pulse" />
            <div className="h-3 w-12 rounded bg-[#192034] animate-pulse" />
            <div className="h-3 w-12 rounded bg-[#192034] animate-pulse" />
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={`border-b border-[#192034] px-5 py-4 flex gap-8 items-start ${
                i % 2 === 0 ? "bg-[#07080f]" : "bg-[#090c1a]"
              }`}
            >
              <div className="flex flex-col gap-1.5 w-44">
                <div className="h-4 w-36 rounded bg-[#192034] animate-pulse" />
                <div className="h-2.5 w-24 rounded bg-[#192034] animate-pulse" />
              </div>
              {[1, 2, 3].map(j => (
                <div key={j} className="flex flex-col gap-1.5">
                  <div className="h-6 w-28 rounded-[5px] bg-[#192034] animate-pulse" />
                  <div className="flex gap-1">
                    <div className="h-4 w-16 rounded bg-[#192034] animate-pulse" />
                    <div className="h-4 w-14 rounded bg-[#192034] animate-pulse" />
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
