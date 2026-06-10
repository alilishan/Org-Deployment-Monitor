"use server"
import { revalidatePath } from "next/cache"
import { signIn, signOut } from "@/lib/auth"

export async function refreshDashboard() {
  revalidatePath("/")
}

export async function reauthenticate() {
  // Sign out first (clears session cookie), then immediately start a fresh
  // GitHub OAuth so there is no window where the browser holds both the old
  // stale cookie and the redirect to the sign-in page.
  await signOut({ redirect: false })
  await signIn("github", { redirectTo: "/" })
}

export async function logout() {
  await signOut({ redirectTo: "/api/auth/signin?callbackUrl=/" })
}
