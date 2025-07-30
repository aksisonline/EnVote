import { type NextRequest, NextResponse } from "next/server"
import { userSessions, events } from "@/lib/storage"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const user_id = searchParams.get("user_id")
    const event_id = searchParams.get("event_id")

    if (!user_id || !event_id) {
      return NextResponse.json({ success: false, error: "User ID and Event ID are required" }, { status: 400 })
    }

    // Find existing session
    const existingSession = Array.from(userSessions.values()).find((session: any) => 
      session.user_id === user_id && session.event_id === event_id && session.is_active
    )

    if (!existingSession) {
      return NextResponse.json({ success: false, error: "Session not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: existingSession,
    })
  } catch (error) {
    console.error("Error fetching user session:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, event_id } = body

    if (!user_id || !event_id) {
      return NextResponse.json({ success: false, error: "User ID and Event ID are required" }, { status: 400 })
    }

    // Check if session already exists
    const existingSession = Array.from(userSessions.values()).find((session: any) => 
      session.user_id === user_id && session.event_id === event_id && session.is_active
    )

    if (existingSession) {
      return NextResponse.json({
        success: true,
        data: existingSession,
      })
    }

    // Get event to determine vote balance
    const event = Array.from(events.values()).find((e: any) => e.id === event_id)
    const maxVoteBalance = event?.max_vote_balance || 10

    const session = {
      id: crypto.randomUUID(),
      user_id,
      event_id,
      vote_balance: maxVoteBalance,
      is_active: true,
      joined_at: new Date().toISOString(),
    }

    userSessions.set(session.id, session)

    return NextResponse.json({
      success: true,
      data: session,
    })
  } catch (error) {
    console.error("Error creating user session:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
