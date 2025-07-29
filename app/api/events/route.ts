import { type NextRequest, NextResponse } from "next/server"

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
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")

    const eventData = {
      name: urlName,
      title,
      description: description || null,
      creator_email,
      creator_name,
      max_vote_balance,
    }

    // In a real implementation, you would use Cloudflare D1 here
    // For now, we'll simulate the database operation
    const event = {
      id: crypto.randomUUID(),
      ...eventData,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      data: event,
    })
  } catch (error) {
    console.error("Error creating event:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
