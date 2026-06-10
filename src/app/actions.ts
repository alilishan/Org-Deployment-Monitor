"use server"
import { revalidatePath } from "next/cache"
import { signOut } from "@/lib/auth"

export async function refreshDashboard() {
  revalidatePath("/")
}

export async function reauthenticate() {
  await signOut({ redirectTo: "/api/auth/signin" })
}

export async function logout() {
  await signOut({ redirectTo: "/api/auth/signin" })
}
