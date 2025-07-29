"use client"

interface CloudflareResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

class CloudflareClient {
  private baseUrl: string

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api"
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result: CloudflareResponse<T> = await response.json()

    if (!result.success) {
      throw new Error(result.error || "Request failed")
    }

    return result.data as T
  }

  // Events
  async createEvent(event: {
    name: string
    title: string
    description?: string
    creator_email: string
    creator_name: string
    max_vote_balance?: number
  }) {
    return this.request("/events", {
      method: "POST",
      body: JSON.stringify(event),
    })
  }

  async getEvent(name: string) {
    return this.request(`/events/${name}`)
  }

  async getEventById(id: string) {
    return this.request(`/events/by-id/${id}`)
  }

  // Users
  async createOrGetUser(email: string, name: string) {
    return this.request("/users", {
      method: "POST",
      body: JSON.stringify({ email, name }),
    })
  }

  // User Sessions
  async joinEvent(userId: string, eventId: string) {
    return this.request("/user-sessions", {
      method: "POST",
      body: JSON.stringify({ user_id: userId, event_id: eventId }),
    })
  }

  async getUserSession(userId: string, eventId: string) {
    return this.request(`/user-sessions/${userId}/${eventId}`)
  }

  async updateVoteBalance(userId: string, eventId: string, voteBalance: number) {
    return this.request(`/user-sessions/${userId}/${eventId}`, {
      method: "PATCH",
      body: JSON.stringify({ vote_balance: voteBalance }),
    })
  }

  // Tasks
  async createTask(task: {
    event_id: string
    title: string
    type: "quiz" | "voting"
    voting_mode: "single" | "multi"
    time_limit?: number
    votes_required?: number
    options: Array<{ text: string; is_correct?: boolean }>
  }) {
    return this.request("/tasks", {
      method: "POST",
      body: JSON.stringify(task),
    })
  }

  async getEventTasks(eventId: string) {
    return this.request(`/tasks/event/${eventId}`)
  }

  async startTask(taskId: string) {
    return this.request(`/tasks/${taskId}/start`, {
      method: "POST",
    })
  }

  async endTask(taskId: string) {
    return this.request(`/tasks/${taskId}/end`, {
      method: "POST",
    })
  }

  async getTaskWithOptions(taskId: string) {
    return this.request(`/tasks/${taskId}/with-options`)
  }

  // User Responses
  async submitResponse(response: {
    user_id: string
    task_id: string
    option_id: string
    votes_used?: number
  }) {
    return this.request("/user-responses", {
      method: "POST",
      body: JSON.stringify(response),
    })
  }

  async getUserResponses(userId: string, eventId?: string) {
    const query = eventId ? `?event_id=${eventId}` : ""
    return this.request(`/user-responses/user/${userId}${query}`)
  }

  async getTaskStats(taskId: string) {
    return this.request(`/tasks/${taskId}/stats`)
  }

  // Real-time connection
  connectToEvent(eventId: string, onMessage: (data: any) => void): WebSocket | null {
    if (typeof window === "undefined") return null

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || `ws://localhost:8787/ws`
    const ws = new WebSocket(`${wsUrl}?event_id=${eventId}`)

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        onMessage(data)
      } catch (error) {
        console.error("Error parsing WebSocket message:", error)
      }
    }

    ws.onerror = (error) => {
      console.error("WebSocket error:", error)
    }

    return ws
  }
}

export const cloudflareClient = new CloudflareClient()
