import { type NextRequest, NextResponse } from "next/server"

// In-memory storage for development (replace with D1 in production)
const events = new Map()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, title, description, creator_email, creator_name, max_vote_balance = 10 } = body

    if (!name || !title || !creator_email || !creator_name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if event name already exists
    const existingEvent = Array.from(events.values()).find((e: any) => e.name === name)
    if (existingEvent) {
      return NextResponse.json({ error: "Event name already exists" }, { status: 409 })
    }

    const event = {
      id: crypto.randomUUID(),
      name,
      title,
      description: description || null,
      creator_email,
      creator_name,
      max_vote_balance,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    events.set(event.id, event)

    return NextResponse.json(event)
  } catch (error) {
    console.error("Error creating event:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const creator_email = url.searchParams.get("creator_email")

    if (creator_email) {
      const userEvents = Array.from(events.values()).filter((e: any) => e.creator_email === creator_email)
      return NextResponse.json(userEvents)
    }

    return NextResponse.json(Array.from(events.values()))
  } catch (error) {
    console.error("Error fetching events:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
