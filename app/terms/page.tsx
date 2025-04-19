"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAuth } from "@/components/auth-provider"

export default function TermsPage() {
  const [accepted, setAccepted] = useState(false)
  const [hasAcceptedBefore, setHasAcceptedBefore] = useState(false)
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    // Check if terms have been accepted before
    if (typeof window !== "undefined") {
      const termsAccepted = localStorage.getItem("termsAccepted")
      if (termsAccepted === "true") {
        setHasAcceptedBefore(true)

        // If terms already accepted and not a new user, redirect to dashboard
        const params = new URLSearchParams(window.location.search)
        const isNewUser = params.get("newUser") === "true"

        if (!isNewUser) {
          router.push("/")
        }
      }
    }
  }, [router])

  const handleAccept = () => {
    localStorage.setItem("termsAccepted", "true")

    // Set a flag to indicate this user has completed onboarding
    localStorage.setItem("onboardingComplete", "true")

    // Ensure we have a user before redirecting to dashboard
    if (user) {
      router.push("/")
    } else {
      // If somehow we lost the user state, redirect to login
      router.push("/login")
    }
  }

  const handleReject = () => {
    // In a real app, you might want to log the user out or redirect to a different page
    router.push("/login")
  }

  const effectiveDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 p-4">
      <Card className="w-full max-w-3xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Terms and Conditions</CardTitle>
          <CardDescription className="text-center">
            Please read and accept our terms and conditions to continue using My Smart Cow App
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] rounded-md border p-4">
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Terms and Conditions for Using My Smart Cow App</h2>
              <p className="text-sm text-gray-500">Effective Date: {effectiveDate}</p>
              <p>
                Welcome to My Smart Cow, a smart dairy management application that helps you monitor milk production,
                track sales, and manage individual cow records efficiently.
              </p>
              <p>By using this app, you agree to the following terms and conditions:</p>

              <div className="space-y-4">
                <div>
                  <h3 className="font-bold">1. Acceptance of Terms</h3>
                  <p>
                    By tapping "Accept", you confirm that you have read, understood, and agreed to be bound by these
                    Terms and Conditions. If you do not agree, tap "Reject" and discontinue use of the app.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold">2. Free Trial and Subscription Fees</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>All users are entitled to a 1-month free trial from the date of registration.</li>
                    <li>
                      After the trial period ends, a monthly subscription fee based on your selected plan will be
                      charged to continue accessing the app's full features.
                    </li>
                    <li>Failure to pay the subscription may result in limited access or suspension of your account.</li>
                    <li>
                      Payment instructions will be provided within the app or sent via registered contact details.
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-bold">3. Use of the App</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>The app is intended for legitimate personal or commercial use by dairy farmers.</li>
                    <li>
                      You are responsible for entering accurate data, including cow records, milk volumes, and pricing.
                    </li>
                    <li>Any misuse, tampering, or unauthorized access attempts may result in account suspension.</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-bold">4. Data Privacy</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>
                      We respect your privacy. Data you input is stored securely and is not shared with third parties.
                    </li>
                    <li>If the app is linked to cloud services, data may be backed up for your convenience.</li>
                    <li>We will never sell or misuse your personal information or farm data.</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-bold">5. Intellectual Property</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>
                      All content, designs, and functionality of My Smart Cow are protected and remain the intellectual
                      property of the app developers.
                    </li>
                    <li>
                      You may not reproduce, modify, or redistribute any part of the app without written permission.
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-bold">6. Limitation of Liability</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>
                      While we strive for accuracy and reliability, we are not liable for any losses, damages, or
                      miscalculations resulting from your use of the app.
                    </li>
                    <li>You use the app at your own risk and discretion.</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-bold">7. Modifications and Updates</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>We may update these terms, improve features, or make changes at any time.</li>
                    <li>Continuing to use the app after updates indicates your acceptance of the new terms.</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-bold">8. Termination of Service</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>You may stop using the app at any time.</li>
                    <li>
                      We reserve the right to terminate or suspend access for users who violate these terms or fail to
                      pay the required subscription fee.
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-bold">9. Contact Information</h3>
                  <p>For support, billing inquiries, or other questions, contact:</p>
                  <p className="font-medium">📧 support.mysmartcow.app@gmail.com</p>
                </div>
              </div>
            </div>
          </ScrollArea>

          <div className="flex items-center space-x-2 mt-4">
            <Checkbox id="terms" checked={accepted} onCheckedChange={(checked) => setAccepted(checked as boolean)} />
            <Label
              htmlFor="terms"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I have read and agree to the terms and conditions
            </Label>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleReject}>
            Reject
          </Button>
          <Button
            onClick={handleAccept}
            disabled={!accepted}
            className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600"
          >
            Accept
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
