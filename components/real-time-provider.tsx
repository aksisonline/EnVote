"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { cloudflareClient } from "@/lib/cloudflare-client"

interface RealTimeContextType {
  isConnected: boolean
  subscribe: (eventId: string, callback: (data: any) => void) => () => void
}

const RealTimeContext = createContext<RealTimeContextType | null>(null)

export function RealTimeProvider({ children }: { children: ReactNode }) {
  const [connections, setConnections] = useState<Map<string, WebSocket>>(new Map())
  const [isConnected, setIsConnected] = useState(false)

  const subscribe = (eventId: string, callback: (data: any) => void) => {
    // Check if we already have a connection for this event
    if (connections.has(eventId)) {
      return () => {} // Return empty cleanup function
    }

    const ws = cloudflareClient.connectToEvent(eventId, callback)

    if (ws) {
      ws.onopen = () => {
        setIsConnected(true)
        setConnections((prev) => new Map(prev).set(eventId, ws))
      }

      ws.onclose = () => {
        setIsConnected(false)
        setConnections((prev) => {
          const newMap = new Map(prev)
          newMap.delete(eventId)
          return newMap
        })
      }

      // Return cleanup function
      return () => {
        ws.close()
        setConnections((prev) => {
          const newMap = new Map(prev)
          newMap.delete(eventId)
          return newMap
        })
      }
    }

    return () => {}
  }

  useEffect(() => {
    // Cleanup all connections on unmount
    return () => {
      connections.forEach((ws) => ws.close())
    }
  }, [])

  return <RealTimeContext.Provider value={{ isConnected, subscribe }}>{children}</RealTimeContext.Provider>
}

export function useRealTime() {
  const context = useContext(RealTimeContext)
  if (!context) {
    throw new Error("useRealTime must be used within a RealTimeProvider")
  }
  return context
}
