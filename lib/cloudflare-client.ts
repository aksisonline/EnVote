"use client"

class CloudflareClient {
  private baseUrl: string

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || ""
  }

  async createOrGetUser(email: string, name: string) {
    const response = await fetch("/api/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, name }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to create/get user")
    }

    return response.json()
  }

  async createEvent(eventData: {
    name: string
    title: string
    description?: string
    creator_email: string
    creator_name: string
    max_vote_balance: number
  }) {
    const response = await fetch("/api/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(eventData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to create event")
    }

    return response.json()
  }

  async getEvent(eventName: string) {
    const response = await fetch(`/api/events/${encodeURIComponent(eventName)}`)

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Event not found")
      }
      const error = await response.json()
      throw new Error(error.error || "Failed to fetch event")
    }

    return response.json()
  }

  async getUserEvents(creatorEmail: string) {
    const response = await fetch(`/api/events?creator_email=${encodeURIComponent(creatorEmail)}`)

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to fetch user events")
    }

    return response.json()
  }

  async updateEvent(eventName: string, updates: any) {
    const response = await fetch(`/api/events/${encodeURIComponent(eventName)}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to update event")
    }

    return response.json()
  }

  async createTask(taskData: {
    event_id: string
    title: string
    type: "quiz" | "voting"
    voting_mode: "single" | "multi"
    time_limit: number
    votes_required: number
    options: Array<{
      text: string
      is_correct: boolean
    }>
  }) {
    const response = await fetch("/api/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(taskData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to create task")
    }

    const result = await response.json()
    return result.data
  }

  async startTask(taskId: string) {
    const response = await fetch(`/api/tasks/${taskId}/start`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to start task")
    }

    const result = await response.json()
    return result.data
  }

  async endTask(taskId: string) {
    const response = await fetch(`/api/tasks/${taskId}/end`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to end task")
    }

    const result = await response.json()
    return result.data
  }

  async getEventTasks(eventId: string) {
    const response = await fetch(`/api/tasks/event/${eventId}`)

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to fetch tasks")
    }

    const result = await response.json()
    return result.data
  }
}

export const cloudflareClient = new CloudflareClient()
