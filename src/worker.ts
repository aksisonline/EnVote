// Worker implementation using @cloudflare/workers-types
import type {
  D1Database,
  DurableObjectNamespace,
  DurableObjectState,
  WebSocket,
  ExportedHandler
} from "@cloudflare/workers-types"

// WebSocketPair is available globally in the Workers runtime
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
    private env: Env
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

      // Add to event sessions
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
      return obj.fetch(request as any) as any
    }

    // API Routes would go here
    // For now, return a simple response
    return new Response(
      JSON.stringify({
        success: true,
        message: "Cloudflare Worker API",
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      },
    )
  },
}
