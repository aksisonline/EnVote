"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Zap, Users, BarChart3, Smartphone, Globe, Shield, ArrowRight, Play } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth"

export default function Home() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">EnVote</span>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <Button asChild>
                <Link href="/dashboard">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
            ) : (
              <Button asChild>
                <Link href="/create">
                  <Play className="mr-2 h-4 w-4" />
                  Get Started
                </Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <Badge variant="outline" className="mb-4">
          Real-time Polling & Quiz Platform
        </Badge>
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          Engage Your Audience
          <br />
          <span className="text-blue-600">In Real-Time</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
          Create interactive polls, quizzes, and voting sessions that bring your audience together. Perfect for
          presentations, workshops, events, and classrooms.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild className="h-14 px-8 text-lg">
            <Link href="/create">
              <Zap className="mr-2 h-5 w-5" />
              Create Event
            </Link>
          </Button>
          {user && (
            <Button size="lg" variant="outline" asChild className="h-14 px-8 text-lg bg-transparent">
              <Link href="/dashboard">
                <BarChart3 className="mr-2 h-5 w-5" />
                My Dashboard
              </Link>
            </Button>
          )}
        </div>

        {/* Demo Preview */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl border overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span className="ml-4 text-sm text-gray-500">envote.app/my-awesome-event</span>
              </div>
            </div>
            <div className="p-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">What's your favorite programming language?</h3>
                <Badge>Live Poll • 47 participants</Badge>
              </div>
              <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
                {[
                  { name: "JavaScript", votes: 23, color: "bg-blue-500" },
                  { name: "Python", votes: 18, color: "bg-green-500" },
                  { name: "TypeScript", votes: 15, color: "bg-purple-500" },
                  { name: "Go", votes: 8, color: "bg-orange-500" },
                ].map((option) => (
                  <div key={option.name} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{option.name}</span>
                      <span className="text-sm text-gray-500">{option.votes}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`${option.color} h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${(option.votes / 47) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything You Need</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Powerful features designed to make audience engagement simple and effective
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>Real-time Polling</CardTitle>
              <CardDescription>Create live polls and see results update instantly as participants vote</CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>Easy Participation</CardTitle>
              <CardDescription>
                Participants join with just a name and email - no app downloads or complex registration
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>Live Analytics</CardTitle>
              <CardDescription>
                View real-time results, export data, and use live overlays for presentations
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Smartphone className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle>Mobile Optimized</CardTitle>
              <CardDescription>
                Touch-friendly interface designed for mobile devices with large, accessible buttons
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <Globe className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle>Global Reach</CardTitle>
              <CardDescription>Powered by Cloudflare's global network for ultra-low latency worldwide</CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-gray-600" />
              </div>
              <CardTitle>Secure & Private</CardTitle>
              <CardDescription>
                Enterprise-grade security with data protection and privacy controls built-in
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="border-0 shadow-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardContent className="text-center py-16">
            <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Create your first event in minutes and start engaging with your audience like never before
            </p>
            <Button size="lg" variant="secondary" asChild className="h-14 px-8 text-lg">
              <Link href="/create">
                Create Your First Event
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-gray-900">EnVote</span>
          </div>
          <p className="text-gray-500 text-sm">© 2024 EnVote. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
