import type { Metadata } from "next"
import { Geist, Geist_Mono, Syne } from "next/font/google"
import { TooltipProvider } from "@/components/ui/tooltip"
import "./globals.css"

const geist     = Geist({ subsets: ["latin"], variable: "--font-geist" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" })
const syne      = Syne({ subsets: ["latin"], variable: "--font-syne", weight: ["600", "700", "800"] })

export const metadata: Metadata = {
  title: "BUCC Deployments",
  description: "Deployment status across all BUCC-Ounch repositories",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${geist.variable} ${geistMono.variable} ${syne.variable} antialiased bg-background text-foreground`}>
        <TooltipProvider>
          {children}
        </TooltipProvider>
      </body>
    </html>
  )
}
