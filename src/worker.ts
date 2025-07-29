import type { D1Database, DurableObjectNamespace, DurableObjectState, WebSocket } from "@cloudflare/workers-types"

declare const WebSocketPair: {
  new (): { 0: WebSocket; 1: WebSocket }
}

export interface Env {
  DB: D1Database
  REALTIME: DurableObjectNamespace
}

// Durable Object for real-time connections
export class RealtimeHandler {
  private sessions: Map<string, WebSocket> = new Map()
  private eventSessions: Map<string, Set<string>> = new Map()

  constructor(
    private state: DurableObjectState,
    private env: Env,
  ) {}

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url)

    if (url.pathname === "/ws") {
      const eventId = url.searchParams.get("event_id")
      if (!eventId) {
        return new Response("Missing event_id", { status: 400 })
      }

      const upgradeHeader = request.headers.get("Upgrade")
      if (upgradeHeader !== "websocket") {
        return new Response("Expected websocket", { status: 400 })
      }

      const webSocketPair = new WebSocketPair()
      const [client, server] = Object.values(webSocketPair)

      const sessionId = crypto.randomUUID()
      this.sessions.set(sessionId, server as WebSocket)

      if (!this.eventSessions.has(eventId)) {
        this.eventSessions.set(eventId, new Set())
      }
      this.eventSessions.get(eventId)!.add(sessionId)
      ;(server as WebSocket).accept()
      ;(server as WebSocket).addEventListener("close", () => {
        this.sessions.delete(sessionId)
        this.eventSessions.get(eventId)?.delete(sessionId)
      })

      return new Response(null, {
        status: 101,
        webSocket: client,
      } as ResponseInit)
    }

    return new Response("Not found", { status: 404 })
  }

  broadcast(eventId: string, message: any) {
    const sessions = this.eventSessions.get(eventId)
    if (!sessions) return

    const messageStr = JSON.stringify(message)
    sessions.forEach((sessionId) => {
      const ws = this.sessions.get(sessionId)
      if (ws) {
        try {
          ws.send(messageStr)
        } catch (error) {
          console.error("Error sending message:", error)
          this.sessions.delete(sessionId)
          sessions.delete(sessionId)
        }
      }
    })
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    // Handle CORS
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      })
    }

    // Route to Durable Object for WebSocket connections
    if (url.pathname.startsWith("/ws")) {
      const id = env.REALTIME.idFromName("realtime")
      const obj = env.REALTIME.get(id)
      return obj.fetch(request)
    }

    // API Routes
    if (url.pathname.startsWith("/api/")) {
      return handleApiRequest(request, env)
    }

    return new Response("Not found", { status: 404 })
  },
}

async function handleApiRequest(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url)
  const path = url.pathname

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  }

  try {
    // Users API
    if (path === "/api/users" && request.method === "POST") {
      const { email, name } = await request.json()

      if (!email || !name) {
        return new Response(JSON.stringify({ error: "Email and name are required" }), {
          status: 400,
          headers: corsHeaders,
        })
      }

      // Check if user exists
      const existingUser = await env.DB.prepare("SELECT * FROM users WHERE email = ?").bind(email).first()

      if (existingUser) {
        // Update name if different
        if (existingUser.name !== name) {
          await env.DB.prepare("UPDATE users SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE email = ?")
            .bind(name, email)
            .run()
        }
        return new Response(
          JSON.stringify({
            id: existingUser.id,
            email: existingUser.email,
            name: name,
          }),
          { headers: corsHeaders },
        )
      }

      // Create new user
      const userId = crypto.randomUUID()
      await env.DB.prepare(`
        INSERT INTO users (id, email, name, created_at, updated_at)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `)
        .bind(userId, email, name)
        .run()

      return new Response(
        JSON.stringify({
          id: userId,
          email,
          name,
        }),
        { headers: corsHeaders },
      )
    }

    // Events API
    if (path === "/api/events") {
      if (request.method === "POST") {
        const { name, title, description, creator_email, creator_name, max_vote_balance } = await request.json()

        if (!name || !title || !creator_email || !creator_name) {
          return new Response(JSON.stringify({ error: "Missing required fields" }), {
            status: 400,
            headers: corsHeaders,
          })
        }

        // Sanitize event name
        const sanitizedName = name
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "-")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, "")

        if (!sanitizedName) {
          return new Response(JSON.stringify({ error: "Invalid event name" }), {
            status: 400,
            headers: corsHeaders,
          })
        }

        // Check if event name exists
        const existingEvent = await env.DB.prepare("SELECT id FROM events WHERE name = ?").bind(sanitizedName).first()

        if (existingEvent) {
          return new Response(JSON.stringify({ error: "Event name already exists" }), {
            status: 409,
            headers: corsHeaders,
          })
        }

        // Create event
        const eventId = crypto.randomUUID()
        await env.DB.prepare(`
          INSERT INTO events (id, name, title, description, creator_email, creator_name, max_vote_balance, is_active, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `)
          .bind(eventId, sanitizedName, title, description, creator_email, creator_name, max_vote_balance || 10)
          .run()

        const event = await env.DB.prepare("SELECT * FROM events WHERE id = ?").bind(eventId).first()

        return new Response(JSON.stringify(event), { headers: corsHeaders })
      }

      if (request.method === "GET") {
        const creator_email = url.searchParams.get("creator_email")

        if (!creator_email) {
          return new Response(JSON.stringify({ error: "Missing creator_email parameter" }), {
            status: 400,
            headers: corsHeaders,
          })
        }

        const events = await env.DB.prepare("SELECT * FROM events WHERE creator_email = ? ORDER BY created_at DESC")
          .bind(creator_email)
          .all()

        return new Response(JSON.stringify(events.results || []), { headers: corsHeaders })
      }
    }

    // Single event API
    if (path.startsWith("/api/events/") && path.split("/").length === 4) {
      const eventName = decodeURIComponent(path.split("/")[3])

      if (request.method === "GET") {
        const event = await env.DB.prepare("SELECT * FROM events WHERE name = ?").bind(eventName).first()

        if (!event) {
          return new Response(JSON.stringify({ error: "Event not found" }), {
            status: 404,
            headers: corsHeaders,
          })
        }

        return new Response(JSON.stringify(event), { headers: corsHeaders })
      }

      if (request.method === "PUT") {
        const updates = await request.json()

        const event = await env.DB.prepare("SELECT * FROM events WHERE name = ?").bind(eventName).first()

        if (!event) {
          return new Response(JSON.stringify({ error: "Event not found" }), {
            status: 404,
            headers: corsHeaders,
          })
        }

        // Update event
        const updateFields = []
        const updateValues = []

        if (updates.title !== undefined) {
          updateFields.push("title = ?")
          updateValues.push(updates.title)
        }
        if (updates.description !== undefined) {
          updateFields.push("description = ?")
          updateValues.push(updates.description)
        }
        if (updates.max_vote_balance !== undefined) {
          updateFields.push("max_vote_balance = ?")
          updateValues.push(updates.max_vote_balance)
        }
        if (updates.is_active !== undefined) {
          updateFields.push("is_active = ?")
          updateValues.push(updates.is_active ? 1 : 0)
        }

        if (updateFields.length > 0) {
          updateFields.push("updated_at = CURRENT_TIMESTAMP")
          updateValues.push(eventName)

          await env.DB.prepare(`UPDATE events SET ${updateFields.join(", ")} WHERE name = ?`)
            .bind(...updateValues)
            .run()
        }

        const updatedEvent = await env.DB.prepare("SELECT * FROM events WHERE name = ?").bind(eventName).first()

        return new Response(JSON.stringify(updatedEvent), { headers: corsHeaders })
      }
    }

    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: corsHeaders,
    })
  } catch (error) {
    console.error("API Error:", error)
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: corsHeaders,
    })
  }
}
