import { type NextRequest, NextResponse } from "next/server"

// In-memory storage for development (replace with D1 in production)
const events = new Map()

export async function GET(request: NextRequest, { params }: { params: { name: string } }) {
  try {
    const eventName = params.name

    // Find event by name
    const event = Array.from(events.values()).find((e: any) => e.name === eventName)

    if (!event) {
      return NextResponse.json({ success: false, error: "Event not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: event,
    })
  } catch (error) {
    console.error("Error fetching event:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { name: string } }) {
  try {
    const eventName = params.name
    const body = await request.json()

    // Find event by name
    const event = Array.from(events.values()).find((e: any) => e.name === eventName)

    if (!event) {
      return NextResponse.json({ success: false, error: "Event not found" }, { status: 404 })
    }

    // Update event
    const updatedEvent = {
      ...event,
      ...body,
      updated_at: new Date().toISOString(),
    }

    events.set(event.id, updatedEvent)

    return NextResponse.json({
      success: true,
      data: updatedEvent,
    })
  } catch (error) {
    console.error("Error updating event:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
