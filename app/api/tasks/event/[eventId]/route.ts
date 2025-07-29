import { type NextRequest, NextResponse } from "next/server"

// In-memory storage for development (replace with D1 in production)
const tasks = new Map()
const taskOptions = new Map()

export async function GET(request: NextRequest, { params }: { params: { eventId: string } }) {
  try {
    const eventId = params.eventId

    // Get all tasks for the event
    const eventTasks = Array.from(tasks.values()).filter((task: any) => task.event_id === eventId)

    // Add options to each task
    const tasksWithOptions = eventTasks.map((task: any) => {
      const options = Array.from(taskOptions.values())
        .filter((option: any) => option.task_id === task.id)
        .sort((a: any, b: any) => a.order_index - b.order_index)

      return {
        ...task,
        options,
      }
    })

    return NextResponse.json({
      success: true,
      data: tasksWithOptions,
    })
  } catch (error) {
    console.error("Error fetching tasks:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
