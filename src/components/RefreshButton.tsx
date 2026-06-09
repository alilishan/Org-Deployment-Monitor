"use client"

import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"

export default function RefreshButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" variant="outline" size="sm" disabled={pending}>
      <span className={pending ? "animate-spin inline-block mr-1" : "mr-1"}>↻</span>
      {pending ? "Refreshing…" : "Refresh"}
    </Button>
  )
}
