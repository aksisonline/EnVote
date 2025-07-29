import { type NextRequest, NextResponse } from "next/server"

// In-memory storage for development (replace with D1 in production)
const tasks = new Map()

export async function POST(request: NextRequest, { params }: { params: { taskId: string } }) {
  try {
    const taskId = params.taskId

    const task = tasks.get(taskId)
    if (!task) {
      return NextResponse.json({ success: false, error: "Task not found" }, { status: 404 })
    }

    // End this task
    task.is_active = false
    task.ended_at = new Date().toISOString()
    task.updated_at = new Date().toISOString()
    tasks.set(taskId, task)

    return NextResponse.json({
      success: true,
      data: task,
    })
  } catch (error) {
    console.error("Error ending task:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
