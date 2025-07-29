import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, title, description, creator_email, creator_name, max_vote_balance } = body

    if (!name || !title || !creator_email || !creator_name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Sanitize event name for URL
    const sanitizedName = name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")

    if (!sanitizedName) {
      return NextResponse.json({ error: "Invalid event name" }, { status: 400 })
    }

    // Create event via API call to worker
    const workerUrl = process.env.NEXT_PUBLIC_API_URL || "https://envote-app.teamscientify2016.workers.dev"

    const response = await fetch(`${workerUrl}/api/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: sanitizedName,
        title,
        description: description || null,
        creator_email,
        creator_name,
        max_vote_balance: max_vote_balance || 10,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json({ error: error.message || "Failed to create event" }, { status: response.status })
    }

    const event = await response.json()
    return NextResponse.json(event)
  } catch (error) {
    console.error("Error creating event:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const creator_email = searchParams.get("creator_email")

    if (!creator_email) {
      return NextResponse.json({ error: "Missing creator_email parameter" }, { status: 400 })
    }

    // Fetch events via API call to worker
    const workerUrl = process.env.NEXT_PUBLIC_API_URL || "https://envote-app.teamscientify2016.workers.dev"

    const response = await fetch(`${workerUrl}/api/events?creator_email=${encodeURIComponent(creator_email)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json({ error: error.message || "Failed to fetch events" }, { status: response.status })
    }

    const events = await response.json()
    return NextResponse.json(events)
  } catch (error) {
    console.error("Error fetching events:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
