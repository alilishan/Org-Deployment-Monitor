import { reauthenticate, logout } from "@/app/actions"
import type { GitHubAuthError } from "@/lib/github"

interface Props {
  error?: GitHubAuthError
}

export default function AuthErrorBanner({ error }: Props) {
  const is403 = error?.status === 403

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4 max-w-sm text-center">
        <div className="flex items-center justify-center w-10 h-10 rounded-[8px] bg-[#1a0808] border border-[#441313]">
          <span className="text-red-400 text-lg">!</span>
        </div>
        <div className="space-y-1.5">
          <p className="font-heading font-semibold text-[#bcc6dc] text-sm">
            {is403 ? "Access denied" : "Session expired"}
          </p>
          <p className="text-[11px] text-[#4d6080] leading-relaxed">
            {is403
              ? "Your token was accepted by GitHub but the organisation denied access. An org admin may need to approve this OAuth app, or you may need to grant org access during sign-in."
              : "Your GitHub session has expired or lacks the required permissions: "}
            {!is403 && (
              <>
                <code className="font-mono text-[10px] text-[#4d88cc]">read:org</code>,{" "}
                <code className="font-mono text-[10px] text-[#4d88cc]">repo</code>,{" "}
                <code className="font-mono text-[10px] text-[#4d88cc]">read:packages</code>.
              </>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <form action={reauthenticate}>
            <button
              type="submit"
              className="px-4 py-2 rounded-[6px] border border-[#243050] bg-[#0f1828] text-[#8aabcc] hover:text-cyan-300 hover:border-[#2f4466] hover:bg-[#122038] transition-all duration-150 font-mono text-[11px] tracking-wide"
            >
              Re-authenticate
            </button>
          </form>
          <form action={logout}>
            <button
              type="submit"
              className="px-4 py-2 rounded-[6px] border border-[#2a1f1f] bg-[#110c0c] text-[#7a6060] hover:text-red-400 hover:border-[#4a2020] hover:bg-[#1a0e0e] transition-all duration-150 font-mono text-[11px] tracking-wide"
            >
              Log out
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
