import { Button } from "@/components/ui/button"
import { reauthenticate } from "@/app/actions"

export default function AuthErrorBanner() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-3">
        <p className="text-muted-foreground text-sm">
          Your GitHub session has expired or lacks the required permissions
          (<code className="text-xs">read:org</code>, <code className="text-xs">repo</code>,{" "}
          <code className="text-xs">read:packages</code>).
        </p>
        <form action={reauthenticate}>
          <Button type="submit">Re-authenticate with GitHub</Button>
        </form>
      </div>
    </div>
  )
}
