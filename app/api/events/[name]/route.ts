import { type NextRequest, NextResponse } from "next/server"
import { events, tasks, taskOptions, userSessions } from "@/lib/storage"

export async function GET(request: NextRequest, { params }: { params: Promise<{ name: string }> }) {
  try {
    const { name: eventName } = await params

    const event = Array.from(events.values()).find((e: any) => e.name === eventName)

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    return NextResponse.json(event)
  } catch (error) {
    console.error("Error fetching event:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ name: string }> }) {
  try {
    const { name: eventName } = await params
    const body = await request.json()

    const event = Array.from(events.values()).find((e: any) => e.name === eventName)

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Update event
    const updatedEvent = {
      ...event,
      ...body,
      updated_at: new Date().toISOString(),
    }

    events.set(event.id, updatedEvent)

    return NextResponse.json(updatedEvent)
  } catch (error) {
    console.error("Error updating event:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ name: string }> }) {
  try {
    const { name: eventName } = await params

    const event = Array.from(events.values()).find((e: any) => e.name === eventName)

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Delete related data
    // Delete all tasks for this event
    const eventTasks = Array.from(tasks.values()).filter((task: any) => task.event_id === event.id)
    eventTasks.forEach((task: any) => {
      tasks.delete(task.id)
      // Delete task options for this task
      const taskOptionsList = Array.from(taskOptions.values()).filter((option: any) => option.task_id === task.id)
      taskOptionsList.forEach((option: any) => taskOptions.delete(option.id))
    })

    // Delete user sessions for this event
    const eventSessions = Array.from(userSessions.values()).filter((session: any) => session.event_id === event.id)
    eventSessions.forEach((session: any) => userSessions.delete(session.id))

    // Delete the event
    events.delete(event.id)

    return NextResponse.json({ success: true, message: "Event deleted successfully" })
  } catch (error) {
    console.error("Error deleting event:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
