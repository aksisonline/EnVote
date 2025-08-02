"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Plus, Play, Square, Users, BarChart3, Trash2, Copy, ExternalLink } from "lucide-react"
import Link from "next/link"
import { cloudflareClient } from "@/lib/cloudflare-client"
import { useAuth } from "@/lib/auth"
import { AuthModal } from "@/components/auth-modal"

interface Event {
  id: string
  name: string
  title: string
  description: string | null
  creator_email: string
  max_vote_balance: number
  is_active: boolean
}

interface Task {
  id: string
  title: string
  type: "quiz" | "voting"
  voting_mode: "single" | "multi"
  time_limit: number
  votes_required: number
  is_active: boolean
  created_at: string
  options: Array<{
    id: string
    text: string
    is_correct: boolean
    order_index: number
  }>
}

export default function EventDashboard() {
  const params = useParams()
  const router = useRouter()
  const eventName = params.eventName as string
  const [event, setEvent] = useState<Event | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [showCreateTask, setShowCreateTask] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  // Task creation form state
  const [taskTitle, setTaskTitle] = useState("")
  const [taskType, setTaskType] = useState<"quiz" | "voting">("voting")
  const [votingMode, setVotingMode] = useState<"single" | "multi">("single")
  const [timeLimit, setTimeLimit] = useState(15)
  const [votesRequired, setVotesRequired] = useState(1)
  const [options, setOptions] = useState([
    { text: "", is_correct: false },
    { text: "", is_correct: false },
  ])

  useEffect(() => {
    if (eventName) {
      fetchEvent()
    }
  }, [eventName])

  useEffect(() => {
    if (user && event) {
      checkPermissions()
      fetchTasks()
    }
  }, [user, event])

  const fetchEvent = async () => {
    try {
      const eventData = await cloudflareClient.getEvent(eventName)
      setEvent(eventData)
    } catch (error) {
      console.error("Error fetching event:", error)
      router.push("/")
    } finally {
      setLoading(false)
    }
  }

  const checkPermissions = () => {
    if (!user || !event) return

    if (user.email !== event.creator_email) {
      alert("You don't have permission to access this dashboard.")
      router.push(`/${eventName}`)
    }
  }

  const fetchTasks = async () => {
    if (!event) return

    try {
      const tasksData = await cloudflareClient.getEventTasks(event.id)
      setTasks(tasksData || [])

      // Find active task
      const active = tasksData?.find((task: Task) => task.is_active)
      setActiveTask(active || null)
    } catch (error) {
      console.error("Error fetching tasks:", error)
    }
  }

  const handleCreateTask = async () => {
    if (!event || !taskTitle.trim() || options.some((opt) => !opt.text.trim())) {
      alert("Please fill in all required fields")
      return
    }

    try {
      await cloudflareClient.createTask({
        event_id: event.id,
        title: taskTitle,
        type: taskType,
        voting_mode: votingMode,
        time_limit: taskType === "quiz" ? timeLimit : 0,
        votes_required: votingMode === "multi" ? votesRequired : 1,
        options: options.map((opt) => ({
          text: opt.text,
          is_correct: taskType === "quiz" ? opt.is_correct : false,
        })),
      })

      // Reset form
      setTaskTitle("")
      setOptions([
        { text: "", is_correct: false },
        { text: "", is_correct: false },
      ])
      setShowCreateTask(false)

      // Refresh tasks
      fetchTasks()
    } catch (error) {
      console.error("Error creating task:", error)
      alert("Failed to create task. Please try again.")
    }
  }

  const handleStartTask = async (taskId: string) => {
    try {
      await cloudflareClient.startTask(taskId)
      fetchTasks()
    } catch (error) {
      console.error("Error starting task:", error)
      alert("Failed to start task. Please try again.")
    }
  }

  const handleEndTask = async (taskId: string) => {
    try {
      await cloudflareClient.endTask(taskId)
      fetchTasks()
    } catch (error) {
      console.error("Error ending task:", error)
      alert("Failed to end task. Please try again.")
    }
  }

  const addOption = () => {
    setOptions([...options, { text: "", is_correct: false }])
  }

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index))
    }
  }

  const updateOption = (index: number, field: "text" | "is_correct", value: string | boolean) => {
    const newOptions = [...options]
    newOptions[index] = { ...newOptions[index], [field]: value }
    setOptions(newOptions)
  }

  const copyEventUrl = () => {
    const url = `${window.location.origin}/${eventName}`
    navigator.clipboard.writeText(url)
    alert("Event URL copied to clipboard!")
  }

  const handleDeleteEvent = async () => {
    if (!event) return

    const confirmed = confirm(
      `Are you absolutely sure you want to delete "${event.title}"? This action cannot be undone.`
    )

    if (!confirmed) return

    try {
      await cloudflareClient.deleteEvent(eventName)
      alert("Event deleted successfully!")
      router.push("/dashboard")
    } catch (error) {
      console.error("Error deleting event:", error)
      alert("Failed to delete event. Please try again.")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
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
            <CardDescription>The event you're looking for doesn't exist.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Authentication Required</CardTitle>
            <CardDescription>Please sign in to access the event dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setShowAuthModal(true)} className="w-full h-12 text-lg">
              Sign In
            </Button>
          </CardContent>
        </Card>

        <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} onSuccess={() => setShowAuthModal(false)} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" asChild>
              <Link href={`/${eventName}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Event
              </Link>
            </Button>
            <Badge variant="outline" className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              Dashboard
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
              <p className="text-gray-600 mt-1">Event Management Dashboard</p>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={copyEventUrl}>
                <Copy className="mr-2 h-4 w-4" />
                Copy Event URL
              </Button>
              <Button variant="outline" asChild>
                <Link href={`/${eventName}/live`} target="_blank">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Live Stats
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <Tabs defaultValue="tasks" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tasks">Tasks & Polls</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="space-y-6">
            {/* Active Task Status */}
            {activeTask ? (
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-green-800">Active Task</CardTitle>
                      <CardDescription className="text-green-600">{activeTask.title}</CardDescription>
                    </div>
                    <Button variant="destructive" onClick={() => handleEndTask(activeTask.id)}>
                      <Square className="mr-2 h-4 w-4" />
                      End Task
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>No Active Task</CardTitle>
                  <CardDescription>Create and start a task to begin engaging with participants</CardDescription>
                </CardHeader>
              </Card>
            )}

            {/* Create Task Button */}
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">All Tasks</h2>
              <Dialog open={showCreateTask} onOpenChange={setShowCreateTask}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Task
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create New Task</DialogTitle>
                    <DialogDescription>Set up a new poll or quiz for your participants</DialogDescription>
                  </DialogHeader>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="taskTitle">Task Title</Label>
                      <Input
                        id="taskTitle"
                        placeholder="What's your favorite color?"
                        value={taskTitle}
                        onChange={(e) => setTaskTitle(e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Task Type</Label>
                        <Select value={taskType} onValueChange={(value: "quiz" | "voting") => setTaskType(value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="voting">Voting Session</SelectItem>
                            <SelectItem value="quiz">Quiz</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Voting Mode</Label>
                        <Select value={votingMode} onValueChange={(value: "single" | "multi") => setVotingMode(value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="single">Single Vote</SelectItem>
                            <SelectItem value="multi">Multi Vote</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {taskType === "quiz" && (
                      <div className="space-y-2">
                        <Label htmlFor="timeLimit">Time Limit (seconds)</Label>
                        <Input
                          id="timeLimit"
                          type="number"
                          min="5"
                          max="300"
                          value={timeLimit}
                          onChange={(e) => setTimeLimit(Number(e.target.value))}
                        />
                      </div>
                    )}

                    {votingMode === "multi" && (
                      <div className="space-y-2">
                        <Label htmlFor="votesRequired">Votes Required</Label>
                        <Input
                          id="votesRequired"
                          type="number"
                          min="1"
                          max="10"
                          value={votesRequired}
                          onChange={(e) => setVotesRequired(Number(e.target.value))}
                        />
                      </div>
                    )}

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Options</Label>
                        <Button type="button" variant="outline" size="sm" onClick={addOption}>
                          <Plus className="mr-2 h-3 w-3" />
                          Add Option
                        </Button>
                      </div>

                      {options.map((option, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input
                            placeholder={`Option ${index + 1}`}
                            value={option.text}
                            onChange={(e) => updateOption(index, "text", e.target.value)}
                          />
                          {taskType === "quiz" && (
                            <label className="flex items-center gap-2 whitespace-nowrap">
                              <input
                                type="checkbox"
                                checked={option.is_correct}
                                onChange={(e) => updateOption(index, "is_correct", e.target.checked)}
                              />
                              Correct
                            </label>
                          )}
                          {options.length > 2 && (
                            <Button type="button" variant="outline" size="sm" onClick={() => removeOption(index)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowCreateTask(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateTask}>Create Task</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Tasks List */}
            <div className="grid gap-4">
              {tasks.map((task) => (
                <Card key={task.id} className={task.is_active ? "border-green-200" : ""}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {task.title}
                          {task.is_active && <Badge variant="default">Active</Badge>}
                          <Badge variant="outline">{task.type}</Badge>
                          <Badge variant="secondary">{task.voting_mode}</Badge>
                        </CardTitle>
                        <CardDescription>
                          {task.options.length} options • Created {new Date(task.created_at).toLocaleDateString()}
                        </CardDescription>
                      </div>

                      <div className="flex items-center gap-2">
                        {!task.is_active && !activeTask && (
                          <Button onClick={() => handleStartTask(task.id)}>
                            <Play className="mr-2 h-4 w-4" />
                            Start
                          </Button>
                        )}
                        {task.is_active && (
                          <Button variant="destructive" onClick={() => handleEndTask(task.id)}>
                            <Square className="mr-2 h-4 w-4" />
                            End
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {task.options.map((option, index) => (
                        <div key={option.id} className="p-2 bg-gray-50 rounded text-sm">
                          {option.text}
                          {task.type === "quiz" && option.is_correct && (
                            <Badge variant="default" className="ml-1 text-xs">
                              ✓
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {tasks.length === 0 && (
                <Card>
                  <CardContent className="text-center py-12">
                    <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Tasks Created</h3>
                    <p className="text-gray-600 mb-4">Create your first poll or quiz to get started</p>
                    <Button onClick={() => setShowCreateTask(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create First Task
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Event Analytics</CardTitle>
                <CardDescription>View participation statistics and response data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Analytics Coming Soon</h3>
                  <p className="text-gray-600">Detailed analytics and reporting features will be available soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Event Settings</CardTitle>
                  <CardDescription>Manage your event configuration</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label>Event URL</Label>
                      <div className="flex items-center gap-2">
                        <Input value={`${window.location.origin}/${eventName}`} readOnly />
                        <Button variant="outline" onClick={copyEventUrl}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Max Vote Balance</Label>
                      <Input value={event.max_vote_balance} readOnly />
                      <p className="text-sm text-gray-500">
                        Maximum votes each participant can use across all multi-vote sessions
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Event Status</Label>
                      <Badge variant={event.is_active ? "default" : "secondary"}>
                        {event.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="text-red-800">Danger Zone</CardTitle>
                  <CardDescription className="text-red-600">
                    These actions cannot be undone. Please proceed with caution.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg">
                      <div className="space-y-1">
                        <h4 className="font-medium text-red-800">Delete Event</h4>
                        <p className="text-sm text-red-600">
                          Permanently delete this event and all associated data including tasks, responses, and analytics.
                        </p>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Event
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Are you absolutely sure?</DialogTitle>
                            <DialogDescription>
                              This action cannot be undone. This will permanently delete the event "{event.title}" and 
                              remove all associated data from our servers including:
                              <br /><br />
                              • All tasks and polls
                              <br />
                              • All participant responses
                              <br />
                              • All analytics data
                              <br />
                              • Event settings and configuration
                            </DialogDescription>
                          </DialogHeader>
                          <div className="flex items-center space-x-2">
                            <Button variant="destructive" onClick={handleDeleteEvent} className="flex-1">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Yes, delete event permanently
                            </Button>
                            <DialogTrigger asChild>
                              <Button variant="outline" className="flex-1">
                                Cancel
                              </Button>
                            </DialogTrigger>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
