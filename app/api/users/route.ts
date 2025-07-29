import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { email?: string; name?: string }
    const { email, name } = body

    if (!email || !name) {
      return NextResponse.json({ error: "Email and name are required" }, { status: 400 })
    }

    // Create or get user via API call to worker
    const workerUrl = process.env.NEXT_PUBLIC_API_URL || "https://envote-app.teamscientify2016.workers.dev"

    console.log("Calling worker at:", `${workerUrl}/api/users`)

    const response = await fetch(`${workerUrl}/api/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, name }),
    })

    console.log("Worker response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Worker error response:", errorText)
      
      try {
        const error = JSON.parse(errorText)
        return NextResponse.json({ error: error.error || "Failed to create/get user" }, { status: response.status })
      } catch {
        return NextResponse.json({ error: `Worker error: ${errorText}` }, { status: response.status })
      }
    }

    const user = await response.json()
    console.log("User created/retrieved:", user)
    return NextResponse.json(user)
  } catch (error) {
    console.error("Error creating/getting user:", error)
    return NextResponse.json({ 
      error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 })
  }
}
