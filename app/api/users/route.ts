import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name } = body

    if (!email || !name) {
      return NextResponse.json({ error: "Email and name are required" }, { status: 400 })
    }

    // Create or get user via API call to worker
    const workerUrl = process.env.NEXT_PUBLIC_API_URL || "https://envote-app.teamscientify2016.workers.dev"

    const response = await fetch(`${workerUrl}/api/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, name }),
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json({ error: error.message || "Failed to create/get user" }, { status: response.status })
    }

    const user = await response.json()
    return NextResponse.json(user)
  } catch (error) {
    console.error("Error creating/getting user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
