import type { Metadata } from "next"
import { Geist, Geist_Mono, Poppins } from "next/font/google"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ThemeProvider } from "@/components/ThemeProvider"
import "./globals.css"

const geist     = Geist({ subsets: ["latin"], variable: "--font-geist" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" })
const poppins   = Poppins({ subsets: ["latin"], variable: "--font-poppins", weight: ["600", "700", "800"] })

export const metadata: Metadata = {
  title: "BUCC Deployments",
  description: "Deployment status across all BUCC-Ounch repositories",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geist.variable} ${geistMono.variable} ${poppins.variable} antialiased bg-background text-foreground`}>
        <ThemeProvider>
          <TooltipProvider>
            {children}
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
