"use server"
import { revalidatePath } from "next/cache"
import { signOut } from "@/lib/auth"

export async function refreshDashboard() {
  revalidatePath("/")
}

export async function reauthenticate() {
  // callbackUrl=%2F ensures NextAuth redirects to / after OAuth completes,
  // not back to /api/auth/signin (which would create a redirect loop).
  await signOut({ redirectTo: "/api/auth/signin?callbackUrl=%2F" })
}

export async function logout() {
  await signOut({ redirectTo: "/api/auth/signin?callbackUrl=%2F" })
}
