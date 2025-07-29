import { type NextRequest, NextResponse } from "next/server"
import { users } from "@/lib/storage"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { email?: string; name?: string }
    const { email, name } = body

    if (!email || !name) {
      return NextResponse.json({ error: "Email and name are required" }, { status: 400 })
    }

    // Check if user already exists
    let user = Array.from(users.values()).find((u: any) => u.email === email)

    if (!user) {
      // Create new user
      user = {
        id: crypto.randomUUID(),
        email,
        name,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      users.set(user.id, user)
    } else {
      // Update existing user name if needed
      if (user.name !== name) {
        user.name = name
        user.updated_at = new Date().toISOString()
        users.set(user.id, user)
      }
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error creating/getting user:", error)
    return NextResponse.json({ 
      error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 })
  }
}
