"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Users, Zap, BarChart3, Smartphone, Globe, Shield } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth"
import { AuthModal } from "@/components/auth-modal"
import { UserMenu } from "@/components/user-menu"

export default function HomePage() {
  const [showAuthModal, setShowAuthModal] = useState(false)
  const { user } = useAuth()

  const handleSignInSuccess = () => {
    setShowAuthModal(false)
    // Optionally redirect to dashboard after sign in
    window.location.href = "/dashboard"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <span className="text-xl font-bold text-gray-900">EnVote</span>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Button variant="outline" asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
                <UserMenu />
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={() => setShowAuthModal(true)}>
                  Sign In
                </Button>
                <Button asChild>
                  <Link href="/create">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge variant="secondary" className="mb-4">
            Real-time Polling & Quiz Platform
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Engage Your Audience with{" "}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Live Polls
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Create interactive polls, quizzes, and voting sessions that bring your audience together. Perfect for
            events, classrooms, meetings, and live streams.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8" asChild>
              <Link href="/create">
                Create Your First Event
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            {!user && (
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 bg-transparent"
                onClick={() => setShowAuthModal(true)}
              >
                Sign In to Dashboard
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for Interactive Events
            </h2>
            <p className="text-xl text-gray-600">Powerful features designed for seamless audience engagement</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Zap className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle>Real-time Results</CardTitle>
                <CardDescription>
                  See votes and responses update instantly as participants engage with your content
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Users className="h-12 w-12 text-indigo-600 mb-4" />
                <CardTitle>Easy Participation</CardTitle>
                <CardDescription>
                  Simple join process with just a name and email. No app downloads or complex signups required
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <BarChart3 className="h-12 w-12 text-purple-600 mb-4" />
                <CardTitle>Live Statistics</CardTitle>
                <CardDescription>
                  Beautiful real-time charts and statistics perfect for presentations and live streams
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Smartphone className="h-12 w-12 text-green-600 mb-4" />
                <CardTitle>Mobile First</CardTitle>
                <CardDescription>
                  Optimized for mobile devices with large, touch-friendly buttons and responsive design
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Globe className="h-12 w-12 text-orange-600 mb-4" />
                <CardTitle>Global Scale</CardTitle>
                <CardDescription>
                  Powered by Cloudflare's global network for ultra-low latency worldwide
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Shield className="h-12 w-12 text-red-600 mb-4" />
                <CardTitle>Secure & Reliable</CardTitle>
                <CardDescription>
                  Enterprise-grade security with built-in DDoS protection and 99.9% uptime
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="container mx-auto text-center max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Engage Your Audience?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of event organizers, educators, and content creators who trust EnVote
          </p>
          <Button size="lg" variant="secondary" className="text-lg px-8" asChild>
            <Link href="/create">
              Start Creating Events
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <span className="text-xl font-bold">EnVote</span>
            </div>
            <div className="text-gray-400 text-sm">© 2024 EnVote. All rights reserved.</div>
          </div>
        </div>
      </footer>

      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} onSuccess={handleSignInSuccess} mode="signin" />
    </div>
  )
}
