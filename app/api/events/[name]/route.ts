import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { name: string } }) {
  try {
    const eventName = params.name

    if (!eventName) {
      return NextResponse.json({ error: "Event name is required" }, { status: 400 })
    }

    // Fetch event via API call to worker
    const workerUrl = process.env.NEXT_PUBLIC_API_URL || "https://envote-app.teamscientify2016.workers.dev"

    const response = await fetch(`${workerUrl}/api/events/${encodeURIComponent(eventName)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: "Event not found" }, { status: 404 })
      }
      const error = await response.json()
      return NextResponse.json({ error: error.message || "Failed to fetch event" }, { status: response.status })
    }

    const event = await response.json()
    return NextResponse.json(event)
  } catch (error) {
    console.error("Error fetching event:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { name: string } }) {
  try {
    const eventName = params.name
    const body = await request.json()

    if (!eventName) {
      return NextResponse.json({ error: "Event name is required" }, { status: 400 })
    }

    // Update event via API call to worker
    const workerUrl = process.env.NEXT_PUBLIC_API_URL || "https://envote-app.teamscientify2016.workers.dev"

    const response = await fetch(`${workerUrl}/api/events/${encodeURIComponent(eventName)}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json({ error: error.message || "Failed to update event" }, { status: response.status })
    }

    const event = await response.json()
    return NextResponse.json(event)
  } catch (error) {
    console.error("Error updating event:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
