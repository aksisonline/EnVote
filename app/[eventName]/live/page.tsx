"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cloudflareClient } from "@/lib/cloudflare-client"
import { useRealTime } from "@/components/real-time-provider"

interface Event {
  id: string
  name: string
  title: string
}

interface Task {
  id: string
  title: string
  type: "quiz" | "voting"
  voting_mode: "single" | "multi"
  is_active: boolean
  options: Array<{
    id: string
    text: string
    order_index: number
  }>
}

interface TaskStats {
  task_id: string
  option_stats: Array<{
    option_id: string
    option_text: string
    vote_count: number
    percentage: number
  }>
  total_votes: number
  total_participants: number
  top_voter: {
    name: string
    votes_used: number
  } | null
}

export default function LiveStatsPage() {
  const params = useParams()
  const eventName = params.eventName as string
  const [event, setEvent] = useState<Event | null>(null)
  const [currentTask, setCurrentTask] = useState<Task | null>(null)
  const [taskStats, setTaskStats] = useState<TaskStats | null>(null)
  const [loading, setLoading] = useState(true)
  const { subscribe } = useRealTime()

  useEffect(() => {
    if (eventName) {
      fetchEvent()
    }
  }, [eventName])

  useEffect(() => {
    if (event) {
      subscribeToUpdates()
    }
  }, [event])

  useEffect(() => {
    if (currentTask) {
      fetchTaskStats()
      // Refresh stats every 2 seconds when task is active
      const interval = setInterval(fetchTaskStats, 2000)
      return () => clearInterval(interval)
    }
  }, [currentTask])

  const fetchEvent = async () => {
    try {
      const eventData = await cloudflareClient.getEvent(eventName)
      setEvent(eventData)
    } catch (error) {
      console.error("Error fetching event:", error)
    } finally {
      setLoading(false)
    }
  }

  const subscribeToUpdates = () => {
    if (!event) return

    return subscribe(event.id, async (data) => {
      if (data.type === "task_started") {
        const taskWithOptions = await cloudflareClient.getTaskWithOptions(data.task_id)
        setCurrentTask(taskWithOptions)
      } else if (data.type === "task_ended") {
        setCurrentTask(null)
        setTaskStats(null)
      } else if (data.type === "vote_submitted" && currentTask) {
        // Refresh stats when new vote comes in
        fetchTaskStats()
      }
    })
  }

  const fetchTaskStats = async () => {
    if (!currentTask) return

    try {
      const stats = await cloudflareClient.getTaskStats(currentTask.id)
      setTaskStats(stats)
    } catch (error) {
      console.error("Error fetching task stats:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black bg-opacity-90 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-xl">Loading live stats...</p>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-black bg-opacity-90 flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-2xl font-bold mb-4">Event Not Found</h1>
          <p className="text-gray-300">The event you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-transparent text-white p-8">
      <div className="container mx-auto max-w-6xl">
        {/* Event Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-white drop-shadow-lg">{event.title}</h1>
          <Badge variant="outline" className="text-white border-white bg-black bg-opacity-50 text-lg px-4 py-2">
            Live Statistics
          </Badge>
        </div>

        {!currentTask ? (
          <div className="text-center">
            <div className="bg-black bg-opacity-70 rounded-lg p-12">
              <h2 className="text-3xl font-semibold mb-4">Waiting for Next Task</h2>
              <p className="text-xl text-gray-300">No active poll or quiz at the moment</p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Current Task Header */}
            <div className="text-center bg-black bg-opacity-70 rounded-lg p-6">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{currentTask.title}</h2>
              <div className="flex items-center justify-center gap-4">
                <Badge variant="default" className="text-lg px-4 py-2">
                  {currentTask.type.toUpperCase()}
                </Badge>
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  {currentTask.voting_mode.toUpperCase()} VOTE
                </Badge>
              </div>
            </div>

            {/* Statistics */}
            {taskStats && (
              <>
                {/* Vote Results */}
                <div className="bg-black bg-opacity-70 rounded-lg p-8">
                  <h3 className="text-2xl font-bold mb-6 text-center">Live Results</h3>
                  <div className="space-y-4">
                    {taskStats.option_stats.map((option, index) => (
                      <div key={option.option_id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xl font-medium">{option.option_text}</span>
                          <div className="flex items-center gap-4">
                            <span className="text-lg font-bold">{option.vote_count} votes</span>
                            <span className="text-lg text-gray-300">{option.percentage.toFixed(1)}%</span>
                          </div>
                        </div>
                        <Progress value={option.percentage} className="h-4 bg-gray-800" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-black bg-opacity-70 rounded-lg p-6 text-center">
                    <h4 className="text-lg font-semibold mb-2">Total Votes</h4>
                    <p className="text-4xl font-bold text-blue-400">{taskStats.total_votes}</p>
                  </div>

                  <div className="bg-black bg-opacity-70 rounded-lg p-6 text-center">
                    <h4 className="text-lg font-semibold mb-2">Participants</h4>
                    <p className="text-4xl font-bold text-green-400">{taskStats.total_participants}</p>
                  </div>

                  <div className="bg-black bg-opacity-70 rounded-lg p-6 text-center">
                    <h4 className="text-lg font-semibold mb-2">Top Voter</h4>
                    {taskStats.top_voter ? (
                      <div>
                        <p className="text-2xl font-bold text-yellow-400">{taskStats.top_voter.name}</p>
                        <p className="text-lg text-gray-300">{taskStats.top_voter.votes_used} votes used</p>
                      </div>
                    ) : (
                      <p className="text-2xl text-gray-400">No votes yet</p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-gray-400 text-lg">EnVote Live Statistics • Updates in real-time</p>
        </div>
      </div>
    </div>
  )
}
