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

    // End any other active tasks for this event
    Array.from(tasks.values()).forEach((t: any) => {
      if (t.event_id === task.event_id && t.is_active) {
        t.is_active = false
        t.updated_at = new Date().toISOString()
        tasks.set(t.id, t)
      }
    })

    // Start this task
    task.is_active = true
    task.started_at = new Date().toISOString()
    task.updated_at = new Date().toISOString()
    tasks.set(taskId, task)

    return NextResponse.json({
      success: true,
      data: task,
    })
  } catch (error) {
    console.error("Error starting task:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
