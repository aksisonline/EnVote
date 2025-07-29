"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { cloudflareClient } from "@/lib/cloudflare-client"
import { useAuth } from "@/lib/auth"
import { AuthModal } from "@/components/auth-modal"

export default function CreateEventPage() {
  const [eventName, setEventName] = useState("")
  const [eventTitle, setEventTitle] = useState("")
  const [eventDescription, setEventDescription] = useState("")
  const [maxVoteBalance, setMaxVoteBalance] = useState(10)
  const [loading, setLoading] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const { user } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      setShowAuthModal(true)
      return
    }

    if (!eventName || !eventTitle) return

    setLoading(true)
    try {
      const event = await cloudflareClient.createEvent({
        name: eventName,
        title: eventTitle,
        description: eventDescription,
        creator_email: user.email,
        creator_name: user.name,
        max_vote_balance: maxVoteBalance,
      })

      router.push(`/${event.name}/dashboard`)
    } catch (error) {
      console.error("Error creating event:", error)
      if (error.message.includes("already exists")) {
        alert("Event name already exists. Please choose a different name.")
      } else {
        alert("Failed to create event. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleAuthSuccess = () => {
    // After successful auth, the form will be submitted automatically
    handleSubmit(new Event("submit") as any)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Create New Event</h1>
          <p className="text-gray-600 mt-2">Set up your live polling and quiz event</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Event Details</CardTitle>
            <CardDescription>Configure your event settings and get a custom URL for participants</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="eventName">Event Name (URL)</Label>
                <Input
                  id="eventName"
                  placeholder="my-awesome-event"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  required
                  className="h-12"
                />
                <p className="text-sm text-gray-500">
                  This will be your event URL: {window.location.origin}/
                  {eventName.toLowerCase().replace(/[^a-z0-9]/g, "-")}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="eventTitle">Event Title</Label>
                <Input
                  id="eventTitle"
                  placeholder="My Awesome Event"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  required
                  className="h-12"
                />
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
                <Label htmlFor="maxVoteBalance">Max Vote Balance per User</Label>
                <Input
                  id="maxVoteBalance"
                  type="number"
                  min="1"
                  max="100"
                  value={maxVoteBalance}
                  onChange={(e) => setMaxVoteBalance(Number.parseInt(e.target.value) || 10)}
                  className="h-12"
                />
                <p className="text-sm text-gray-500">
                  Maximum votes each participant can use across all multi-vote sessions
                </p>
              </div>

              <Button type="submit" className="w-full h-12 text-lg" disabled={loading || !eventName || !eventTitle}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Event...
                  </>
                ) : (
                  "Create Event"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} onSuccess={handleAuthSuccess} />
    </div>
  )
}
