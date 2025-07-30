import { type NextRequest, NextResponse } from "next/server"
import { tasks, taskOptions } from "@/lib/storage"

export async function GET(request: NextRequest, { params }: { params: Promise<{ taskId: string }> }) {
  try {
    const { taskId } = await params

    const task = tasks.get(taskId)
    if (!task) {
      return NextResponse.json({ success: false, error: "Task not found" }, { status: 404 })
    }

    // Get task options
    const options = Array.from(taskOptions.values()).filter((option: any) => option.task_id === taskId)

    const taskWithOptions = {
      ...task,
      options: options.sort((a: any, b: any) => a.order_index - b.order_index)
    }

    return NextResponse.json({
      success: true,
      data: taskWithOptions,
    })
  } catch (error) {
    console.error("Error fetching task:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}