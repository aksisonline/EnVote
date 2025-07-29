import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { name: string } }) {
  try {
    const { name } = params

    // In a real implementation, you would query Cloudflare D1 here
    // For now, we'll simulate the database operation
    const event = {
      id: crypto.randomUUID(),
      name,
      title: `Event: ${name}`,
      description: "Sample event description",
      creator_email: "creator@example.com",
      creator_name: "Event Creator",
      max_vote_balance: 10,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
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
