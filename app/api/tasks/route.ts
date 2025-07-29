import { type NextRequest, NextResponse } from "next/server"

// In-memory storage for development (replace with D1 in production)
const tasks = new Map()
const taskOptions = new Map()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { event_id, title, type, voting_mode, time_limit, votes_required, options } = body

    if (!event_id || !title || !type || !voting_mode || !options || options.length < 2) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    const taskId = crypto.randomUUID()
    const task = {
      id: taskId,
      event_id,
      title,
      type,
      voting_mode,
      time_limit: time_limit || 0,
      votes_required: votes_required || 1,
      is_active: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    tasks.set(taskId, task)

    // Create options
    const taskOptionsArray = options.map((option: any, index: number) => ({
      id: crypto.randomUUID(),
      task_id: taskId,
      text: option.text,
      is_correct: option.is_correct || false,
      order_index: index,
    }))

    taskOptionsArray.forEach((option: any) => {
      taskOptions.set(option.id, option)
    })

    return NextResponse.json({
      success: true,
      data: {
        ...task,
        options: taskOptionsArray,
      },
    })
  } catch (error) {
    console.error("Error creating task:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
