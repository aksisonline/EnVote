import { type NextRequest, NextResponse } from "next/server"

// In-memory storage for development (replace with D1 in production)
const events = new Map()

export async function GET(request: NextRequest, { params }: { params: { name: string } }) {
  try {
    const eventName = params.name

    const event = Array.from(events.values()).find((e: any) => e.name === eventName)

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

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

    const event = Array.from(events.values()).find((e: any) => e.name === eventName)

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Update event
    const updatedEvent = {
      ...event,
      ...body,
      updated_at: new Date().toISOString(),
    }

    events.set(event.id, updatedEvent)

    return NextResponse.json(updatedEvent)
  } catch (error) {
    console.error("Error updating event:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
