import { type NextRequest, NextResponse } from "next/server"

// In-memory storage for development (replace with D1 in production)
const users = new Map()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name } = body

    if (!email || !name) {
      return NextResponse.json({ success: false, error: "Email and name are required" }, { status: 400 })
    }

    // Check if user already exists
    let user = Array.from(users.values()).find((u: any) => u.email === email)

    if (user) {
      // Update name if it's different
      if (user.name !== name) {
        user.name = name
        user.updated_at = new Date().toISOString()
        users.set(user.id, user)
      }
    } else {
      // Create new user
      user = {
        id: crypto.randomUUID(),
        email,
        name,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      users.set(user.id, user)
    }

    return NextResponse.json({
      success: true,
      data: user,
    })
  } catch (error) {
    console.error("Error creating/updating user:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const email = url.searchParams.get("email")

    if (email) {
      const user = Array.from(users.values()).find((u: any) => u.email === email)
      if (!user) {
        return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
      }
      return NextResponse.json({
        success: true,
        data: user,
      })
    }

    return NextResponse.json({
      success: true,
      data: Array.from(users.values()),
    })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
