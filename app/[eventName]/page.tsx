"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Clock, Vote } from "lucide-react"
import { useAuth } from "@/lib/auth"
import { AuthModal } from "@/components/auth-modal"
import { TaskModal } from "@/components/task-modal"
import { cloudflareClient } from "@/lib/cloudflare-client"
import { useRealTime } from "@/components/real-time-provider"

interface Event {
  id: string
  name: string
  title: string
  description: string | null
  max_vote_balance: number
}

interface Task {
  id: string
  title: string
  type: "quiz" | "voting"
  voting_mode: "single" | "multi"
  time_limit: number
  votes_required: number
  is_active: boolean
  options: Array<{
    id: string
    text: string
    is_correct: boolean
    order_index: number
  }>
}

interface UserResponse {
  id: string
  task_id: string
  option_id: string
  votes_used: number
  responded_at: string
  task: {
    title: string
    type: string
  }
  option: {
    text: string
  }
}

export default function EventPage() {
  const params = useParams()
  const eventName = params.eventName as string
  const [event, setEvent] = useState<Event | null>(null)
  const [currentTask, setCurrentTask] = useState<Task | null>(null)
  const [userVoteBalance, setUserVoteBalance] = useState(0)
  const [userResponses, setUserResponses] = useState<UserResponse[]>([])
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { subscribe } = useRealTime()

  useEffect(() => {
    if (eventName) {
      fetchEvent()
    }
  }, [eventName])

  useEffect(() => {
    if (user && event) {
      joinEvent()
      fetchUserResponses()
      subscribeToTasks()
    }
  }, [user, event])

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

  const joinEvent = async () => {
    if (!user || !event) return

    try {
      const existingSession = await cloudflareClient.getUserSession(user.id, event.id)

      if (!existingSession) {
        const session = await cloudflareClient.joinEvent(user.id, event.id)
        setUserVoteBalance(session.vote_balance)
      } else {
        setUserVoteBalance(existingSession.vote_balance)
      }
    } catch (error) {
      console.error("Error joining event:", error)
    }
  }

  const fetchUserResponses = async () => {
    if (!user || !event) return

    try {
      const responses = await cloudflareClient.getUserResponses(user.id, event.id)
      setUserResponses(responses || [])
    } catch (error) {
      console.error("Error fetching user responses:", error)
    }
  }

  const subscribeToTasks = () => {
    if (!event) return

    return subscribe(event.id, async (data) => {
      if (data.type === "task_started") {
        const taskWithOptions = await cloudflareClient.getTaskWithOptions(data.task_id)
        setCurrentTask(taskWithOptions)
      } else if (data.type === "task_ended") {
        setCurrentTask(null)
        fetchUserResponses()
      }
    })
  }

  const handleVoteBalanceUpdate = async (newBalance: number) => {
    setUserVoteBalance(newBalance)
  }

  const handleJoinSuccess = () => {
    setShowAuthModal(false)
    // The useEffect will handle joining the event once user is set
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading event...</p>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Event Not Found</CardTitle>
            <CardDescription>The event you're looking for doesn't exist or has ended.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{event.title}</CardTitle>
            {event.description && <CardDescription className="text-base">{event.description}</CardDescription>}
          </CardHeader>
          <CardContent>
            <Button onClick={() => setShowAuthModal(true)} className="w-full h-12 text-lg">
              Join Event
            </Button>
          </CardContent>
        </Card>

        <AuthModal
          open={showAuthModal}
          onOpenChange={setShowAuthModal}
          onSuccess={handleJoinSuccess}
          mode="join"
          eventTitle={event.title}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{event.title}</h1>
          {event.description && <p className="text-gray-600 mb-4">{event.description}</p>}
          <div className="flex items-center justify-center gap-4 text-sm">
            <Badge variant="outline" className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {user.name}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Vote className="h-3 w-3" />
              {userVoteBalance} votes left
            </Badge>
          </div>
        </div>

        {!currentTask ? (
          <Card className="text-center py-12">
            <CardContent>
              <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold mb-2">Waiting for Next Task</h2>
              <p className="text-gray-600">The event organizer will start the next poll or quiz shortly.</p>
            </CardContent>
          </Card>
        ) : null}

        {userResponses.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Your Response History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {userResponses.map((response) => (
                  <div key={response.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{response.task.title}</p>
                      <p className="text-sm text-gray-600">Your answer: {response.option.text}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={response.task.type === "quiz" ? "default" : "secondary"}>
                        {response.task.type}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">
                        {response.votes_used} vote{response.votes_used !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <TaskModal
        task={currentTask}
        open={!!currentTask}
        onClose={() => setCurrentTask(null)}
        userVoteBalance={userVoteBalance}
        onVoteBalanceUpdate={handleVoteBalanceUpdate}
      />
    </div>
  )
}
