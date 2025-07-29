import { type NextRequest, NextResponse } from "next/server"

// In-memory storage for development (replace with D1 in production)
const events = new Map()
const users = new Map()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, title, description, creator_email, creator_name, max_vote_balance = 10 } = body

    if (!name || !title || !creator_email || !creator_name) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Create URL-friendly name
    const urlName = name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim()

    // Check if event name already exists
    const existingEvent = Array.from(events.values()).find((event: any) => event.name === urlName)
    if (existingEvent) {
      return NextResponse.json(
        {
          success: false,
          error: "Event name already exists. Please choose a different name.",
        },
        { status: 400 },
      )
    }

    // Create or get user
    let user = Array.from(users.values()).find((u: any) => u.email === creator_email)
    if (!user) {
      user = {
        id: crypto.randomUUID(),
        email: creator_email,
        name: creator_name,
        created_at: new Date().toISOString(),
      }
      users.set(user.id, user)
    }

    const eventData = {
      id: crypto.randomUUID(),
      name: urlName,
      title,
      description: description || null,
      creator_email,
      creator_name,
      creator_id: user.id,
      max_vote_balance,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    events.set(eventData.id, eventData)

    return NextResponse.json({
      success: true,
      data: eventData,
    })
  } catch (error) {
    console.error("Error creating event:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const creator_email = url.searchParams.get("creator_email")

    if (creator_email) {
      // Get events for a specific creator
      const userEvents = Array.from(events.values()).filter((event: any) => event.creator_email === creator_email)

      return NextResponse.json({
        success: true,
        data: userEvents,
      })
    }

    // Return all events (for admin purposes)
    return NextResponse.json({
      success: true,
      data: Array.from(events.values()),
    })
  } catch (error) {
    console.error("Error fetching events:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
