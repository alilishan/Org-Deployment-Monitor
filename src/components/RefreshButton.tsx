"use client"

import { useFormStatus } from "react-dom"
import { RefreshCw } from "lucide-react"

export default function RefreshButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center gap-2 px-3.5 py-2 rounded-[6px] border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 font-mono text-[11px] tracking-wide"
    >
      <RefreshCw className={`w-3.5 h-3.5 ${pending ? "animate-spin" : ""}`} />
      {pending ? "Refreshing" : "Refresh"}
    </button>
  )
}
