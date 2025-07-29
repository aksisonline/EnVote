"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Calendar, Users, BarChart3, ExternalLink, Settings } from "lucide-react"
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
  creator_name: string
  max_vote_balance: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export default function Dashboard() {
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>([])
  const [showCreateEvent, setShowCreateEvent] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  // Event creation form state
  const [eventName, setEventName] = useState("")
  const [eventTitle, setEventTitle] = useState("")
  const [eventDescription, setEventDescription] = useState("")
  const [maxVoteBalance, setMaxVoteBalance] = useState(10)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    if (user) {
      fetchUserEvents()
    } else {
      setLoading(false)
    }
  }, [user])

  const fetchUserEvents = async () => {
    if (!user) return

    try {
      const userEvents = await cloudflareClient.getUserEvents(user.email)
      setEvents(userEvents || [])
    } catch (error) {
      console.error("Error fetching user events:", error)
      setEvents([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreateEvent = async () => {
    if (!user || !eventName.trim() || !eventTitle.trim()) {
      alert("Please fill in all required fields")
      return
    }

    setCreating(true)
    try {
      const newEvent = await cloudflareClient.createEvent({
        name: eventName,
        title: eventTitle,
        description: eventDescription,
        creator_email: user.email,
        creator_name: user.name,
        max_vote_balance: maxVoteBalance,
      })

      // Reset form
      setEventName("")
      setEventTitle("")
      setEventDescription("")
      setMaxVoteBalance(10)
      setShowCreateEvent(false)

      // Refresh events
      fetchUserEvents()

      // Navigate to the new event's dashboard
      router.push(`/${newEvent.name}/dashboard`)
    } catch (error: any) {
      console.error("Error creating event:", error)
      alert(error.message || "Failed to create event. Please try again.")
    } finally {
      setCreating(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
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

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome to EnVote</CardTitle>
            <CardDescription>Please sign in to access your dashboard and manage your events</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setShowAuthModal(true)} className="w-full h-12 text-lg">
              Sign In to Dashboard
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Event Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back, {user.name}</p>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" asChild>
                <Link href="/">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Back to Home
                </Link>
              </Button>
              <Dialog open={showCreateEvent} onOpenChange={setShowCreateEvent}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Event
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Event</DialogTitle>
                    <DialogDescription>Set up a new polling or quiz event for your audience</DialogDescription>
                  </DialogHeader>

                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="eventName">Event Name (URL)</Label>
                        <Input
                          id="eventName"
                          placeholder="my-awesome-event"
                          value={eventName}
                          onChange={(e) => setEventName(e.target.value)}
                        />
                        <p className="text-sm text-gray-500">
                          This will be your event URL: /{eventName.toLowerCase().replace(/[^a-z0-9]/g, "-")}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="eventTitle">Event Title</Label>
                        <Input
                          id="eventTitle"
                          placeholder="My Awesome Event"
                          value={eventTitle}
                          onChange={(e) => setEventTitle(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="eventDescription">Description (Optional)</Label>
                      <Textarea
                        id="eventDescription"
                        placeholder="Describe your event..."
                        value={eventDescription}
                        onChange={(e) => setEventDescription(e.target.value)}
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="maxVoteBalance">Max Vote Balance</Label>
                      <Input
                        id="maxVoteBalance"
                        type="number"
                        min="1"
                        max="100"
                        value={maxVoteBalance}
                        onChange={(e) => setMaxVoteBalance(Number(e.target.value))}
                      />
                      <p className="text-sm text-gray-500">
                        Maximum votes each participant can use across all multi-vote sessions
                      </p>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowCreateEvent(false)} disabled={creating}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateEvent} disabled={creating}>
                        {creating ? "Creating..." : "Create Event"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{events.length}</div>
              <p className="text-xs text-muted-foreground">Events created</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Events</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{events.filter((e) => e.is_active).length}</div>
              <p className="text-xs text-muted-foreground">Currently active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {
                  events.filter((e) => {
                    const eventDate = new Date(e.created_at)
                    const now = new Date()
                    return eventDate.getMonth() === now.getMonth() && eventDate.getFullYear() === now.getFullYear()
                  }).length
                }
              </div>
              <p className="text-xs text-muted-foreground">Events created this month</p>
            </CardContent>
          </Card>
        </div>

        {/* Events List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Your Events</h2>
          </div>

          {events.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Events Created</h3>
                <p className="text-gray-600 mb-4">Create your first event to start engaging with your audience</p>
                <Button onClick={() => setShowCreateEvent(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Event
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {events.map((event) => (
                <Card key={event.id} className={event.is_active ? "border-green-200" : ""}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {event.title}
                          {event.is_active ? (
                            <Badge variant="default">Active</Badge>
                          ) : (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </CardTitle>
                        <CardDescription>
                          /{event.name} • Created {formatDate(event.created_at)}
                        </CardDescription>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button variant="outline" asChild>
                          <Link href={`/${event.name}`} target="_blank">
                            <ExternalLink className="mr-2 h-4 w-4" />
                            View Event
                          </Link>
                        </Button>
                        <Button asChild>
                          <Link href={`/${event.name}/dashboard`}>
                            <Settings className="mr-2 h-4 w-4" />
                            Manage
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  {event.description && (
                    <CardContent>
                      <p className="text-gray-600">{event.description}</p>
                      <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                        <span>Max Vote Balance: {event.max_vote_balance}</span>
                        <span>•</span>
                        <span>Last updated: {formatDate(event.updated_at)}</span>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
