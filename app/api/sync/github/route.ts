import { type NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"
import { syncDatabaseToGitHub } from "@/lib/github-sync"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  const authResult = await verifyAuth(request)
  if (!authResult.authenticated || !authResult.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { action } = await request.json()

    if (action !== "sync") {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    const githubToken = process.env.GITHUB_TOKEN
    const repository = process.env.GITHUB_REPOSITORY
    const owner = process.env.GITHUB_OWNER

    if (!githubToken || !repository || !owner) {
      return NextResponse.json({ error: "GitHub configuration not set in environment variables" }, { status: 400 })
    }

    const result = await syncDatabaseToGitHub({
      token: githubToken,
      repository,
      owner,
    })

    return NextResponse.json(result, { status: result.success ? 200 : 400 })
  } catch (error) {
    console.error("[v0] Sync error:", error)
    return NextResponse.json({ error: "Sync failed" }, { status: 500 })
  }
}
