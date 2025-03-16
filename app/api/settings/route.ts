import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Get user settings
    const settings = await prisma.settings.findUnique({
      where: { userId: user.id },
    })

    if (!settings) {
      return NextResponse.json({ error: "Settings not found" }, { status: 404 })
    }

    return NextResponse.json({ settings })
  } catch (error) {
    console.error("Get settings error:", error)
    return NextResponse.json({ error: "An error occurred" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const data = await request.json()

    // Update user settings
    const settings = await prisma.settings.update({
      where: { userId: user.id },
      data: {
        theme: data.theme,
        currency: data.currency,
        notifications: data.notifications,
        defaultShops: Array.isArray(data.defaultShops) ? data.defaultShops.join(",") : data.defaultShops,
        language: data.language,
      },
    })

    return NextResponse.json({ settings })
  } catch (error) {
    console.error("Update settings error:", error)
    return NextResponse.json({ error: "An error occurred" }, { status: 500 })
  }
}

