"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Zap, Users, BarChart3 } from "lucide-react"
import Link from "next/link"
import { cloudflareClient } from "@/lib/cloudflare-client"
import { useAuth } from "@/lib/auth"
import { AuthModal } from "@/components/auth-modal"

export default function CreateEvent() {
  const router = useRouter()
  const [eventName, setEventName] = useState("")
  const [eventTitle, setEventTitle] = useState("")
  const [eventDescription, setEventDescription] = useState("")
  const [maxVoteBalance, setMaxVoteBalance] = useState(10)
  const [creating, setCreating] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const { user } = useAuth()

  const handleCreateEvent = async () => {
    if (!user) {
      setShowAuthModal(true)
      return
    }

    if (!eventName.trim() || !eventTitle.trim()) {
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

      // Navigate to the new event's dashboard
      router.push(`/${newEvent.name}/dashboard`)
    } catch (error: any) {
      console.error("Error creating event:", error)
      alert(error.message || "Failed to create event. Please try again.")
    } finally {
      setCreating(false)
    }
  }

  const previewUrl = eventName
    ? `/${eventName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")}`
    : "/your-event-name"

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>

          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Create Your Event</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Set up a new polling or quiz event and start engaging with your audience in real-time
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
              <CardDescription>Configure your event settings and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="eventName">Event Name (URL)</Label>
                  <Input
                    id="eventName"
                    placeholder="my-awesome-event"
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                  />
                  <p className="text-sm text-gray-500">
                    This will be your event URL: <code className="bg-gray-100 px-1 rounded">{previewUrl}</code>
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
                  placeholder="Describe your event and what participants can expect..."
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  rows={4}
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

              <Button onClick={handleCreateEvent} disabled={creating} className="w-full h-12 text-lg">
                {creating ? "Creating Event..." : "Create Event"}
              </Button>

              {!user && (
                <p className="text-sm text-gray-500 text-center">
                  You'll be prompted to sign in before creating the event
                </p>
              )}
            </CardContent>
          </Card>

          {/* Features */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-blue-600" />
                  Real-time Engagement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Create live polls and quizzes that participants can respond to in real-time. Perfect for
                  presentations, workshops, and interactive sessions.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-600" />
                  Easy Participation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Participants join with just a name and email - no complex registration required. Mobile-optimized
                  interface ensures everyone can participate easily.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                  Live Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  View real-time results and analytics. Export data for further analysis and use the live overlay for
                  streaming and presentations.
                </p>
              </CardContent>
            </Card>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Get access to your event dashboard</li>
                <li>• Create polls and quizzes</li>
                <li>• Share your event URL with participants</li>
                <li>• Launch live sessions and view real-time results</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <AuthModal
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
        onSuccess={() => {
          setShowAuthModal(false)
          handleCreateEvent()
        }}
      />
    </div>
  )
}
