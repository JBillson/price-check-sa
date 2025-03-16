import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Return user data (without password)
    const { password, ...userData } = user
    return NextResponse.json({ user: userData })
  } catch (error) {
    console.error("Get current user error:", error)
    return NextResponse.json({ error: "An error occurred" }, { status: 500 })
  }
}

