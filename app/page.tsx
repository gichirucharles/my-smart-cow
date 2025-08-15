"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">🐄</span>
            </div>
            <h1 className="text-2xl font-bold text-green-800">Smart Cow</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost" className="text-green-700 hover:text-green-800">
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-green-600 hover:bg-green-700 text-white">Get Started</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-green-800 mb-6">Smart Dairy Farm Management</h2>
          <p className="text-xl text-green-600 mb-8 max-w-3xl mx-auto">
            Streamline your dairy operations with our comprehensive farm management system. Track milk production,
            manage cattle, monitor expenses, and optimize your farm's performance.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/signup">
              <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8 py-3">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/login">
              <Button
                size="lg"
                variant="outline"
                className="border-green-600 text-green-600 hover:bg-green-50 px-8 py-3 bg-transparent"
              >
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="shadow-lg border-0 hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🥛</span>
              </div>
              <CardTitle className="text-green-800">Milk Production Tracking</CardTitle>
              <CardDescription className="text-green-600">
                Monitor daily milk production by cow and time of day with detailed analytics
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="shadow-lg border-0 hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🐄</span>
              </div>
              <CardTitle className="text-green-800">Cattle Management</CardTitle>
              <CardDescription className="text-green-600">
                Keep detailed records of your cattle including health, breeding, and performance data
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="shadow-lg border-0 hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🌾</span>
              </div>
              <CardTitle className="text-green-800">Feed Management</CardTitle>
              <CardDescription className="text-green-600">
                Track feed inventory, consumption, and costs to optimize nutrition and expenses
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="shadow-lg border-0 hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">💰</span>
              </div>
              <CardTitle className="text-green-800">Financial Tracking</CardTitle>
              <CardDescription className="text-green-600">
                Monitor expenses, revenue, and profitability with comprehensive financial reports
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="shadow-lg border-0 hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <CardTitle className="text-green-800">Analytics & Reports</CardTitle>
              <CardDescription className="text-green-600">
                Get insights with detailed charts, graphs, and performance analytics
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-white rounded-2xl shadow-xl p-12">
          <h3 className="text-3xl font-bold text-green-800 mb-4">Ready to Transform Your Dairy Farm?</h3>
          <p className="text-lg text-green-600 mb-8">
            Join thousands of farmers who trust Smart Cow to manage their operations efficiently.
          </p>
          <Link href="/signup">
            <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-12 py-4">
              Start Your Free Trial Today
            </Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-16">
        <div className="text-center text-green-600">
          <p>© 2024 Smart Cow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
