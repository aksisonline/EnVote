import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name } = body

    if (!email || !name) {
      return NextResponse.json({ success: false, error: "Email and name are required" }, { status: 400 })
    }

    // In a real implementation, you would check if user exists in D1
    // and create if not exists
    const user = {
      id: crypto.randomUUID(),
      email,
      name,
      created_at: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      data: user,
    })
  } catch (error) {
    console.error("Error creating/getting user:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
