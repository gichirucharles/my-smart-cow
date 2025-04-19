"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import { LoadingSpinner } from "@/components/loading-spinner"

export default function PaymentSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [paymentDetails, setPaymentDetails] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [verificationStatus, setVerificationStatus] = useState<"pending" | "success" | "failed">("pending")
  const [verificationMessage, setVerificationMessage] = useState("")

  useEffect(() => {
    async function verifyPayment(orderTrackingId: string) {
      try {
        const response = await fetch(`/api/pesapal-verify?orderTrackingId=${orderTrackingId}`)
        const data = await response.json()

        if (data.error) {
          throw new Error(data.error)
        }

        if (data.status_code === "1") {
          setVerificationStatus("success")
          setVerificationMessage("Payment verified successfully")

          // Save subscription to localStorage
          const subscription = {
            planId: localStorage.getItem("selectedPlanId") || "bronze",
            planName: localStorage.getItem("selectedPlanName") || "Bronze",
            price: localStorage.getItem("selectedPlanPrice") || "1500",
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
            status: "active",
            paymentMethod: "pesapal",
            transactionId: orderTrackingId,
          }

          localStorage.setItem("subscription", JSON.stringify(subscription))

          // Save to payment history
          const user = JSON.parse(localStorage.getItem("currentUser") || "{}")
          const payments = JSON.parse(localStorage.getItem("paymentHistory") || "[]")
          payments.push({
            userId: user?.id,
            userName: user?.name,
            userEmail: user?.email,
            planId: subscription.planId,
            planName: subscription.planName,
            amount: Number.parseInt(subscription.price),
            date: new Date().toISOString(),
            paymentMethod: "pesapal",
            paymentDetails: `Transaction ID: ${orderTrackingId}`,
            transactionId: orderTrackingId,
          })
          localStorage.setItem("paymentHistory", JSON.stringify(payments))
        } else {
          setVerificationStatus("failed")
          setVerificationMessage(`Payment verification failed: ${data.status_description || "Unknown error"}`)
        }
      } catch (error) {
        console.error("Payment verification error:", error)
        setVerificationStatus("failed")
        setVerificationMessage("Failed to verify payment. Please contact support.")
      } finally {
        setLoading(false)
      }
    }

    // Get payment details from URL parameters
    const orderTrackingId = searchParams.get("OrderTrackingId")
    const orderMerchantReference = searchParams.get("OrderMerchantReference")
    const orderNotificationType = searchParams.get("OrderNotificationType")

    if (orderTrackingId && orderMerchantReference) {
      setPaymentDetails({
        orderTrackingId,
        orderMerchantReference,
        orderNotificationType,
      })

      // Verify the payment
      verifyPayment(orderTrackingId)
    } else {
      setLoading(false)
    }
  }, [searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {loading ? (
            <div className="mx-auto w-16 h-16 flex items-center justify-center">
              <LoadingSpinner size="lg" />
            </div>
          ) : verificationStatus === "success" ? (
            <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900 mb-4">
              <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
          ) : (
            <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900 mb-4">
              <AlertCircle className="h-10 w-10 text-amber-600 dark:text-amber-400" />
            </div>
          )}
          <CardTitle className="text-2xl">
            {loading
              ? "Verifying Payment..."
              : verificationStatus === "success"
                ? "Payment Successful!"
                : "Payment Verification Issue"}
          </CardTitle>
          <CardDescription>
            {loading
              ? "Please wait while we verify your payment"
              : verificationStatus === "success"
                ? "Your subscription has been activated successfully"
                : verificationMessage}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center">Processing your payment details...</p>
          ) : paymentDetails ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="font-medium">Transaction ID:</span>
                <span>{paymentDetails.orderTrackingId}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Reference:</span>
                <span>{paymentDetails.orderMerchantReference}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Status:</span>
                <span
                  className={
                    verificationStatus === "success"
                      ? "text-green-600 dark:text-green-400"
                      : "text-amber-600 dark:text-amber-400"
                  }
                >
                  {verificationStatus === "success" ? "Completed" : "Pending Verification"}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-center text-amber-600 dark:text-amber-400">
              No payment details found. If you've completed a payment, please contact support.
            </p>
          )}
        </CardContent>
        <CardFooter className="flex justify-center gap-4">
          {verificationStatus !== "success" && (
            <Button variant="outline" asChild>
              <Link href="/subscription">Back to Subscription</Link>
            </Button>
          )}
          <Button asChild className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600">
            <Link href="/">Go to Dashboard</Link>
          </Button>
          {verificationStatus === "success" && (
            <Button variant="outline" asChild>
              <Link href="/payment-history">View Payment History</Link>
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
