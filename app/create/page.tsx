"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth"
import { AuthModal } from "@/components/auth-modal"
import { cloudflareClient } from "@/lib/cloudflare-client"

export default function CreateEventPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)

  // Form state
  const [eventName, setEventName] = useState("")
  const [eventTitle, setEventTitle] = useState("")
  const [eventDescription, setEventDescription] = useState("")
  const [maxVoteBalance, setMaxVoteBalance] = useState(10)
  const [creating, setCreating] = useState(false)

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
        name: eventName.toLowerCase().replace(/[^a-z0-9]/g, "-"),
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

  const handleAuthSuccess = () => {
    setShowAuthModal(false)
    // After successful auth, the form will be ready to submit
  }

  const sanitizedEventName = eventName.toLowerCase().replace(/[^a-z0-9]/g, "-")

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <span className="text-xl font-bold text-gray-900">EnVote</span>
            </div>
          </div>

          {user && (
            <div className="text-sm text-gray-600">
              Signed in as <span className="font-medium">{user.name}</span>
            </div>
          )}
        </div>
      </header>

      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Create Your Event</h1>
          <p className="text-xl text-gray-600">
            Set up a new polling or quiz event and start engaging with your audience
          </p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader>
            <CardTitle>Event Details</CardTitle>
            <CardDescription>Configure your event settings and customize the experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="eventName">Event Name (URL)</Label>
                <Input
                  id="eventName"
                  placeholder="my-awesome-event"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  className="h-12"
                />
                {eventName && (
                  <p className="text-sm text-gray-500">
                    URL: <span className="font-mono">/{sanitizedEventName}</span>
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="eventTitle">Event Title</Label>
                <Input
                  id="eventTitle"
                  placeholder="My Awesome Event"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="h-12"
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
                className="resize-none"
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
                className="h-12"
              />
              <p className="text-sm text-gray-500">
                Maximum votes each participant can use across all multi-vote sessions
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                onClick={handleCreateEvent}
                disabled={creating || !eventName.trim() || !eventTitle.trim()}
                className="flex-1 h-12 text-lg"
              >
                {creating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Event...
                  </>
                ) : (
                  "Create Event"
                )}
              </Button>
              <Button variant="outline" asChild className="h-12 bg-transparent">
                <Link href="/">Cancel</Link>
              </Button>
            </div>

            {!user && (
              <div className="text-center pt-4 border-t">
                <p className="text-sm text-gray-600 mb-2">You'll need to sign in to create an event</p>
                <Button variant="outline" onClick={() => setShowAuthModal(true)}>
                  Sign In First
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} onSuccess={handleAuthSuccess} mode="signin" />
    </div>
  )
}
