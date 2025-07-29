import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { event_id, title, type, voting_mode, time_limit = 15, votes_required = 1, options } = body

    if (!event_id || !title || !type || !voting_mode || !options || options.length === 0) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // In a real implementation, you would:
    // 1. Insert task into D1
    // 2. Insert options into D1
    // 3. Return the complete task with options
    const taskId = crypto.randomUUID()
    const task = {
      id: taskId,
      event_id,
      title,
      type,
      voting_mode,
      time_limit,
      votes_required,
      is_active: false,
      is_completed: false,
      started_at: null,
      completed_at: null,
      created_at: new Date().toISOString(),
      options: options.map((option: any, index: number) => ({
        id: crypto.randomUUID(),
        task_id: taskId,
        text: option.text,
        is_correct: option.is_correct || false,
        order_index: index,
        created_at: new Date().toISOString(),
      })),
    }

    return NextResponse.json({
      success: true,
      data: task,
    })
  } catch (error) {
    console.error("Error creating task:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
