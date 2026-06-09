"use client"

import { useFormStatus } from "react-dom"

export default function RefreshButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center gap-2 px-3.5 py-2 rounded-[6px] border border-[#243050] bg-[#0f1828] text-[#4d6080] hover:text-[#8aabcc] hover:border-[#2f4466] hover:bg-[#122038] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 font-mono text-[11px] tracking-wide"
    >
      <span className={pending ? "animate-spin inline-block" : "inline-block"} style={{ lineHeight: 1 }}>
        ↻
      </span>
      {pending ? "Refreshing" : "Refresh"}
    </button>
  )
}
