"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Send, FileText, MessageSquare, Phone, Mail, Video } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function SupportPage() {
  const { toast } = useToast()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [category, setCategory] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      toast({
        title: "Support request submitted",
        description: "We'll get back to you as soon as possible.",
      })
      setName("")
      setEmail("")
      setSubject("")
      setMessage("")
      setCategory("")
    }, 1500)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" asChild className="mr-2">
          <Link href="/">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-emerald-800 dark:text-emerald-400">Support Center</h1>
      </div>

      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-600 dark:text-gray-400">Get help and support for your dairy farm management</p>
      </div>

      <Tabs defaultValue="contact" className="mb-6">
        <TabsList className="bg-emerald-100 dark:bg-emerald-900/30">
          <TabsTrigger value="contact">Contact Us</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="guides">Guides</TabsTrigger>
          <TabsTrigger value="videos">Video Tutorials</TabsTrigger>
        </TabsList>

        <TabsContent value="contact">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Contact Support</CardTitle>
                <CardDescription>Fill out the form below to get in touch with our support team</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Your Name</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={category} onValueChange={setCategory} required>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technical">Technical Issue</SelectItem>
                        <SelectItem value="billing">Billing & Subscription</SelectItem>
                        <SelectItem value="feature">Feature Request</SelectItem>
                        <SelectItem value="account">Account Management</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Enter subject"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Describe your issue or question in detail"
                      rows={5}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" /> Send Message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>Alternative ways to reach our support team</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start">
                  <Mail className="h-5 w-5 mr-3 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Email Support</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      For general inquiries and support:
                      <br />
                      <a
                        href="mailto:support@smartcow.com"
                        className="text-emerald-600 dark:text-emerald-400 hover:underline"
                      >
                        support@smartcow.com
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Phone className="h-5 w-5 mr-3 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Phone Support</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Available Monday-Friday, 8am-5pm:
                      <br />
                      <a href="tel:+254723252885" className="text-emerald-600 dark:text-emerald-400 hover:underline">
                        +254 723 252 885
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <MessageSquare className="h-5 w-5 mr-3 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Live Chat</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Chat with our support team on WhatsApp for immediate assistance.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => window.open(`https://wa.me/254723252885`, "_blank")}
                    >
                      Start WhatsApp Chat
                    </Button>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="font-medium mb-2">Business Hours</h3>
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <div className="flex justify-between">
                      <span>Monday - Friday:</span>
                      <span>8:00 AM - 5:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Saturday:</span>
                      <span>9:00 AM - 1:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sunday:</span>
                      <span>Closed</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="faq">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>Find answers to common questions about using Smart Cow</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>How do I add a new cow to my herd?</AccordionTrigger>
                  <AccordionContent>
                    <p>
                      To add a new cow to your herd, navigate to the "Cow Management" section from the main dashboard.
                      Click on the "Add Cow" button in the top right corner. Fill in the required information such as
                      tag number, name, breed, date of birth, and lactation status. You can also add optional details
                      like purchase date, purchase price, and notes. Click "Save" to add the cow to your herd.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger>How do I record milk production?</AccordionTrigger>
                  <AccordionContent>
                    <p>
                      To record milk production, go to the "Milk Production" section from the main dashboard. Click on
                      "Add Production" and select the cow, date, and time of milking (morning or evening). Enter the
                      amount of milk produced in liters and any notes if needed. Click "Save" to record the production.
                      You can view production history and trends in the same section.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger>How do I track expenses?</AccordionTrigger>
                  <AccordionContent>
                    <p>
                      To track expenses, navigate to the "Expenses" section from the main dashboard. Click on "Add
                      Expense" and fill in details like date, category, description, and amount. You can also specify
                      the payment method. Click "Save" to record the expense. The expenses page provides visualizations
                      and summaries to help you understand your spending patterns.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4">
                  <AccordionTrigger>How do I manage feed inventory?</AccordionTrigger>
                  <AccordionContent>
                    <p>
                      To manage feed inventory, go to the "Feeds" section from the main dashboard. Here you can add new
                      feed types, record purchases, and track usage. Click on "Add Feed" to add a new type of feed with
                      details like name, type, cost, and quantity. You can also record when feed is used in the "Cow
                      Feeding" section, which will automatically update your inventory.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5">
                  <AccordionTrigger>How do I schedule veterinary visits?</AccordionTrigger>
                  <AccordionContent>
                    <p>
                      To schedule veterinary visits, navigate to the "Veterinary" section from the main dashboard. Click
                      on "Add Visit" and select the cow, date, and reason for the visit. You can add details about the
                      diagnosis, treatment, medications, and cost. You can also set a follow-up date if needed. The
                      system will remind you of upcoming scheduled visits.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-6">
                  <AccordionTrigger>How do I generate reports?</AccordionTrigger>
                  <AccordionContent>
                    <p>
                      To generate reports, go to the "Reports" section from the main dashboard. Here you can select the
                      type of report you want (milk production, expenses, income, etc.) and specify the date range. You
                      can view the reports directly in the app or export them as PDF or CSV files for further analysis
                      or sharing.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-7">
                  <AccordionTrigger>How do I manage my subscription?</AccordionTrigger>
                  <AccordionContent>
                    <p>
                      To manage your subscription, navigate to the "Subscription" section from the main dashboard. Here
                      you can view your current plan, billing cycle, and payment history. You can upgrade or downgrade
                      your plan, update payment information, or cancel your subscription. If you have any billing
                      issues, you can contact our support team directly from this page.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-8">
                  <AccordionTrigger>Is my data secure?</AccordionTrigger>
                  <AccordionContent>
                    <p>
                      Yes, your data is secure with Smart Cow. We use industry-standard encryption to protect your
                      information both in transit and at rest. Your data is backed up regularly, and we have strict
                      access controls in place. We do not share your data with third parties without your consent. You
                      can also export your data at any time for your own records.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guides">
          <Card>
            <CardHeader>
              <CardTitle>User Guides</CardTitle>
              <CardDescription>Step-by-step guides to help you get the most out of Smart Cow</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href="/support/guides/getting-started">
                  <Card className="h-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                    <CardContent className="p-4 flex items-start">
                      <FileText className="h-8 w-8 mr-4 text-emerald-600 dark:text-emerald-400" />
                      <div>
                        <h3 className="font-medium text-lg">Getting Started Guide</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Learn the basics of setting up and using Smart Cow for your dairy farm
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/support/guides/milk-production">
                  <Card className="h-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                    <CardContent className="p-4 flex items-start">
                      <FileText className="h-8 w-8 mr-4 text-emerald-600 dark:text-emerald-400" />
                      <div>
                        <h3 className="font-medium text-lg">Milk Production Tracking</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Learn how to record, analyze, and optimize your milk production
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/support/guides/cow-management">
                  <Card className="h-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                    <CardContent className="p-4 flex items-start">
                      <FileText className="h-8 w-8 mr-4 text-emerald-600 dark:text-emerald-400" />
                      <div>
                        <h3 className="font-medium text-lg">Cow Management</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Best practices for managing your herd, health records, and breeding
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/support/guides/financial-management">
                  <Card className="h-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                    <CardContent className="p-4 flex items-start">
                      <FileText className="h-8 w-8 mr-4 text-emerald-600 dark:text-emerald-400" />
                      <div>
                        <h3 className="font-medium text-lg">Financial Management</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Track expenses, income, and profitability of your dairy operation
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/support/guides/feed-management">
                  <Card className="h-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                    <CardContent className="p-4 flex items-start">
                      <FileText className="h-8 w-8 mr-4 text-emerald-600 dark:text-emerald-400" />
                      <div>
                        <h3 className="font-medium text-lg">Feed Management</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Optimize feed inventory, nutrition, and feeding schedules
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/support/guides/reports">
                  <Card className="h-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                    <CardContent className="p-4 flex items-start">
                      <FileText className="h-8 w-8 mr-4 text-emerald-600 dark:text-emerald-400" />
                      <div>
                        <h3 className="font-medium text-lg">Reports & Analytics</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Generate insights and make data-driven decisions for your farm
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="videos">
          <Card>
            <CardHeader>
              <CardTitle>Video Tutorials</CardTitle>
              <CardDescription>Watch step-by-step video guides for using Smart Cow</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center mb-3">
                      <Video className="h-12 w-12 text-gray-400" />
                    </div>
                    <h3 className="font-medium">Getting Started with Smart Cow</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      A complete walkthrough of setting up your account and basic features
                    </p>
                    <div className="mt-3 flex items-center text-sm text-gray-500">
                      <span>10:25</span>
                      <span className="mx-2">•</span>
                      <span>Beginner</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center mb-3">
                      <Video className="h-12 w-12 text-gray-400" />
                    </div>
                    <h3 className="font-medium">Recording Milk Production</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Learn how to record daily milk production and analyze trends
                    </p>
                    <div className="mt-3 flex items-center text-sm text-gray-500">
                      <span>7:15</span>
                      <span className="mx-2">•</span>
                      <span>Beginner</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center mb-3">
                      <Video className="h-12 w-12 text-gray-400" />
                    </div>
                    <h3 className="font-medium">Managing Your Herd</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      How to add, edit, and track information about your cows
                    </p>
                    <div className="mt-3 flex items-center text-sm text-gray-500">
                      <span>8:45</span>
                      <span className="mx-2">•</span>
                      <span>Intermediate</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center mb-3">
                      <Video className="h-12 w-12 text-gray-400" />
                    </div>
                    <h3 className="font-medium">Financial Management</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Track expenses, income, and generate financial reports
                    </p>
                    <div className="mt-3 flex items-center text-sm text-gray-500">
                      <span>12:30</span>
                      <span className="mx-2">•</span>
                      <span>Intermediate</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
