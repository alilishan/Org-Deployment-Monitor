import { Button } from "@/components/ui/button"

export default function AuthErrorBanner() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-3">
        <p className="text-muted-foreground text-sm">
          Your GitHub session has expired or lacks the required permissions
          (<code className="text-xs">read:org</code>, <code className="text-xs">repo</code>).
        </p>
        <a href="/api/auth/signin">
          <Button>Re-authenticate with GitHub</Button>
        </a>
      </div>
    </div>
  )
}
