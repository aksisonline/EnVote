class CloudflareClient {
  private baseUrl: string

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://envote-app.teamscientify2016.workers.dev"
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

  async getUserSession(userId: string, eventId: string) {
    // Implementation for getting user session
    return null
  }

  async joinEvent(userId: string, eventId: string) {
    // Implementation for joining event
    return { vote_balance: 10 }
  }

  async getUserResponses(userId: string, eventId: string) {
    // Implementation for getting user responses
    return []
  }

  async getTaskWithOptions(taskId: string) {
    // Implementation for getting task with options
    return null
  }

  async createTask(eventId: string, taskData: any) {
    // Implementation for creating task
    return null
  }

  async startTask(taskId: string) {
    // Implementation for starting task
    return null
  }

  async endTask(taskId: string) {
    // Implementation for ending task
    return null
  }

  async getEventTasks(eventId: string) {
    // Implementation for getting event tasks
    return []
  }
}

export const cloudflareClient = new CloudflareClient()
