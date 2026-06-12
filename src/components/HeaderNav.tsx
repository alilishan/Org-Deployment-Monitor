"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const LINKS = [
  { href: "/", label: "Deployments" },
  { href: "/status", label: "Status" },
]

export default function HeaderNav() {
  const pathname = usePathname()
  return (
    <nav className="flex items-center gap-1">
      {LINKS.map(({ href, label }) => {
        const active = pathname === href
        return (
          <Link
            key={href}
            href={href}
            className={`font-mono text-[11px] px-3 py-1.5 rounded-[5px] border transition-colors duration-150 ${
              active
                ? "border-border bg-muted text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
