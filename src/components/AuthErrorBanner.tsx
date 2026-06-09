import { reauthenticate } from "@/app/actions"

export default function AuthErrorBanner() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4 max-w-sm text-center">
        <div className="flex items-center justify-center w-10 h-10 rounded-[8px] bg-[#1a0808] border border-[#441313]">
          <span className="text-red-400 text-lg">!</span>
        </div>
        <div className="space-y-1.5">
          <p className="font-heading font-semibold text-[#bcc6dc] text-sm">Session expired</p>
          <p className="text-[11px] text-[#4d6080] leading-relaxed">
            Your GitHub session has expired or lacks the required permissions:{" "}
            <code className="font-mono text-[10px] text-[#4d88cc]">read:org</code>,{" "}
            <code className="font-mono text-[10px] text-[#4d88cc]">repo</code>,{" "}
            <code className="font-mono text-[10px] text-[#4d88cc]">read:packages</code>.
          </p>
        </div>
        <form action={reauthenticate}>
          <button
            type="submit"
            className="px-4 py-2 rounded-[6px] border border-[#243050] bg-[#0f1828] text-[#8aabcc] hover:text-cyan-300 hover:border-[#2f4466] hover:bg-[#122038] transition-all duration-150 font-mono text-[11px] tracking-wide"
          >
            Re-authenticate with GitHub
          </button>
        </form>
      </div>
    </div>
  )
}
