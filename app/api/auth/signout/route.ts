import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    cookieStore.delete("auth_token")
    cookieStore.delete("username")

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("[v0] Signout error:", error)
    return NextResponse.json({ error: "Signout failed" }, { status: 500 })
  }
}
