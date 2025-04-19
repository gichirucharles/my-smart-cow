"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ArrowLeft,
  Check,
  MilkIcon as Cow,
  CreditCard,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  CreditCardIcon as CardIcon,
  Phone,
  Smartphone,
} from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { format } from "date-fns"
import Script from "next/script"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Move this function outside the component to make it accessible
const handleSuccessfulPayment = (
  plan,
  transactionId,
  paymentMethod,
  user,
  setCurrentSubscription,
  setPaymentSuccess,
  isUpgrading,
  isDowngrading,
  currencySymbol,
) => {
  // Save subscription to localStorage
  const subscription = {
    planId: plan.id,
    planName: plan.name,
    price: plan.price,
    cowLimit: plan.cowLimit,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    status: "active",
    paymentMethod: paymentMethod,
    transactionId: transactionId,
  }

  localStorage.setItem("subscription", JSON.stringify(subscription))
  setCurrentSubscription(subscription)
  setPaymentSuccess(true)

  // Save to payment history for admin
  const payments = JSON.parse(localStorage.getItem("paymentHistory") || "[]")
  payments.push({
    userId: user?.id,
    userName: user?.name,
    userEmail: user?.email,
    planId: plan.id,
    planName: plan.name,
    amount: plan.price,
    date: new Date().toISOString(),
    paymentMethod: paymentMethod,
    paymentDetails: `Transaction ID: ${transactionId}`,
    transactionId: transactionId,
    isUpgrade: isUpgrading,
    isDowngrade: isDowngrading,
  })
  localStorage.setItem("paymentHistory", JSON.stringify(payments))

  // Log activity
  const activityLogs = JSON.parse(localStorage.getItem("activityLogs") || "[]")
  let actionType = "New Subscription"
  if (isUpgrading) actionType = "Subscription Upgrade"
  if (isDowngrading) actionType = "Subscription Downgrade"

  activityLogs.unshift({
    id: Date.now().toString(),
    userId: user?.id,
    userName: user?.name,
    action: actionType,
    details: `User ${isUpgrading ? "upgraded to" : isDowngrading ? "downgraded to" : "subscribed to"} ${plan.name} plan for ${currencySymbol} ${plan.price}`,
    timestamp: new Date().toISOString(),
  })
  localStorage.setItem("activityLogs", JSON.stringify(activityLogs))

  // Show success message
  alert(`Payment successful! Your ${plan.name} subscription is now active.`)
}

// Add this new component for the simplified payment flow
function SimplePaymentForm({ onClose, plans, currencySymbol, handlePaymentSuccess }) {
  const [amount, setAmount] = useState(0)
  const [packageName, setPackageName] = useState("")

  useEffect(() => {
    const script = document.createElement("script")
    script.src = "https://checkout.flutterwave.com/v3.js"
    script.async = true
    document.body.appendChild(script)

    return () => {
      // Clean up the script when component unmounts
      document.body.removeChild(script)
    }
  }, [])

  const handlePayment = () => {
    if (!amount || !packageName) return alert("Please select a package")

    window.FlutterwaveCheckout({
      public_key: "FLWPUBK_TEST-YOUR-PUBLIC-KEY-HERE", // Replace with your actual public key
      tx_ref: "TX_" + Date.now(),
      amount: amount,
      currency: currencySymbol === "KSH" ? "KES" : currencySymbol,
      payment_options: "card,mpesa,ussd",
      customer: {
        email: "charlesmuiruri024@gmail.com", // This should be replaced with the user's email
        phonenumber: "0723252885", // This should be replaced with the user's phone
        name: "Charles Muiruri Gichiru", // This should be replaced with the user's name
      },
      customizations: {
        title: "Smart Cow App",
        description: `${packageName} Subscription Payment`,
        logo: "https://yourdomain.com/logo.png", // Optional: Your logo URL
      },
      callback: (response) => {
        console.log("Payment complete", response)
        // Find the selected plan
        const selectedPlan = plans.find((p) => p.name === packageName)
        if (selectedPlan && response.status === "successful") {
          // Handle successful payment using the existing function
          handlePaymentSuccess(selectedPlan, response.transaction_id, "flutterwave")
          onClose()
        }
      },
      onclose: () => {
        console.log("Payment modal closed")
      },
    })
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Choose a Subscription Package</h1>

      <select
        className="w-full p-3 border rounded mb-4 bg-white dark:bg-gray-800"
        onChange={(e) => {
          const value = e.target.value
          setPackageName(value)
          const selectedPlan = plans.find((p) => p.name === value)
          setAmount(selectedPlan ? selectedPlan.price : 0)
        }}
      >
        <option value="">-- Select Package --</option>
        {plans.map((plan) => (
          <option key={plan.id} value={plan.name}>
            {plan.name} ({currencySymbol} {plan.price})
          </option>
        ))}
      </select>

      <div className="flex gap-2 justify-end mt-4">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={handlePayment}
          className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600"
          disabled={!amount}
        >
          Pay Now
        </Button>
      </div>
    </div>
  )
}

// Add this new component for Pesapal payment
function PesapalPaymentForm({ onClose, plans, currencySymbol, user }) {
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handlePesapalPayment = async () => {
    if (!selectedPlan) {
      toast({
        title: "Please select a plan",
        description: "You need to select a subscription plan to continue",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Save selected plan details for the success page
      localStorage.setItem("selectedPlanId", selectedPlan.id)
      localStorage.setItem("selectedPlanName", selectedPlan.name)
      localStorage.setItem("selectedPlanPrice", selectedPlan.price.toString())

      // Call our API route
      const response = await fetch("/api/pesapal-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: selectedPlan.price,
          customerEmail: user?.email || "",
          customerName: user?.name || "",
          customerPhone: user?.phone || "",
          invoiceId: `INV-${Date.now()}`,
        }),
      })

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      // Redirect to Pesapal payment page
      if (data.redirect_url) {
        window.location.href = data.redirect_url
      } else {
        throw new Error("No redirect URL received from payment gateway")
      }
    } catch (error) {
      console.error("Payment initiation error:", error)
      toast({
        title: "Payment Error",
        description: error.message || "Failed to initiate payment. Please try again.",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Pay with Pesapal</h1>

      <div className="space-y-4 mb-6">
        <Label>Select a Plan</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {plans.map((plan) => (
            <Button
              key={plan.id}
              variant={selectedPlan?.id === plan.id ? "default" : "outline"}
              className={`p-4 h-auto flex flex-col items-start text-left ${
                selectedPlan?.id === plan.id ? plan.color : ""
              } ${selectedPlan?.id === plan.id ? "text-white" : ""}`}
              onClick={() => setSelectedPlan(plan)}
            >
              <span className="text-lg font-bold">{plan.name}</span>
              <span className="text-sm opacity-90">
                {currencySymbol} {plan.price}/month
              </span>
            </Button>
          ))}
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md mb-6">
        <h4 className="font-medium mb-2">Payment Instructions:</h4>
        <ol className="list-decimal pl-5 space-y-1 text-sm">
          <li>Select your preferred subscription plan</li>
          <li>Click "Proceed to Payment" to be redirected to Pesapal</li>
          <li>Complete your payment using M-Pesa, card, or other available methods</li>
          <li>You'll be redirected back to Smart Cow App after payment</li>
        </ol>
      </div>

      <div className="flex gap-2 justify-end mt-4">
        <Button variant="outline" onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          onClick={handlePesapalPayment}
          className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600"
          disabled={!selectedPlan || isLoading}
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" /> Processing...
            </>
          ) : (
            "Proceed to Payment"
          )}
        </Button>
      </div>
    </div>
  )
}

interface SubscriptionPlan {
  id: string
  name: string
  price: number
  cowLimit: number
  color: string
  features: string[]
}

interface Subscription {
  planId: string
  planName: string
  price: number
  startDate: string
  endDate: string
  status: "active" | "expired" | "trial"
  paymentMethod: string
  transactionId: string
}

declare global {
  interface Window {
    FlutterwaveCheckout: (config: any) => void
  }
}

export default function SubscriptionPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null)
  const [cowCount, setCowCount] = useState(0)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [trialWarningOpen, setTrialWarningOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null)
  const [paymentMethod, setPaymentMethod] = useState("mpesa")
  const [paymentNumber, setPaymentNumber] = useState("")
  const [cardNumber, setCardNumber] = useState("")
  const [cardExpiry, setCardExpiry] = useState("")
  const [cardCvv, setCardCvv] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [trialEndsAt, setTrialEndsAt] = useState<Date | null>(null)
  const [selectedCountry, setSelectedCountry] = useState("Kenya")
  const [currencySymbol, setCurrencySymbol] = useState("KSH")
  const [isUpgrading, setIsUpgrading] = useState(false)
  const [isDowngrading, setIsDowngrading] = useState(false)
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false)
  const [renewalWarningOpen, setRenewalWarningOpen] = useState(false)
  const [flutterwaveReady, setFlutterwaveReady] = useState(false)
  const [flutterwaveEmail, setFlutterwaveEmail] = useState("")
  const [flutterwaveName, setFlutterwaveName] = useState("")
  const [flutterwavePhone, setFlutterwavePhone] = useState("")
  const [simplePaymentOpen, setSimplePaymentOpen] = useState(false)
  const [pesapalPaymentOpen, setPesapalPaymentOpen] = useState(false)

  const countries = [
    { name: "Kenya", currency: "KSH" },
    { name: "Uganda", currency: "UGX" },
    { name: "Tanzania", currency: "TZS" },
    { name: "United States", currency: "USD" },
    { name: "United Kingdom", currency: "GBP" },
  ]

  const plans: SubscriptionPlan[] = [
    {
      id: "bronze",
      name: "Bronze",
      price: 1500,
      cowLimit: 3,
      color: "bg-amber-600",
      features: [
        "3 cows or less",
        "Basic reporting",
        "Email support",
        "Data export",
        "Cow health tracking",
        "Feed optimization",
        "Breeding management",
      ],
    },
    {
      id: "copper",
      name: "Copper",
      price: 2000,
      cowLimit: 7,
      color: "bg-orange-600",
      features: [
        "7 cows or less",
        "Advanced reporting",
        "Priority email support",
        "Data export",
        "Cow health tracking",
        "Feed optimization",
        "Breeding management",
      ],
    },
    {
      id: "gold",
      name: "Gold",
      price: 3000,
      cowLimit: 15,
      color: "bg-yellow-600",
      features: [
        "15 cows or less",
        "Advanced reporting",
        "Priority support",
        "Data export",
        "Cow health tracking",
        "Feed optimization",
        "Breeding management",
        "Financial analytics",
      ],
    },
    {
      id: "diamond",
      name: "Diamond",
      price: 4000,
      cowLimit: 30,
      color: "bg-blue-600",
      features: [
        "30 cows and above",
        "Advanced reporting",
        "Priority support",
        "Data export",
        "Cow health tracking",
        "Feed optimization",
        "Breeding management",
        "Financial analytics",
        "Custom reports",
      ],
    },
  ]

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Get cow count
      const cows = JSON.parse(localStorage.getItem("cows") || "[]")
      setCowCount(cows.length)

      // Get current subscription
      const subscription = localStorage.getItem("subscription")
      if (subscription) {
        const parsedSubscription = JSON.parse(subscription)
        setCurrentSubscription(parsedSubscription)
      }

      // Check trial period
      const userCreatedAt = user?.createdAt ? new Date(user.createdAt) : null
      if (userCreatedAt) {
        const trialEnd = new Date(userCreatedAt)
        trialEnd.setMonth(trialEnd.getMonth() + 1)
        setTrialEndsAt(trialEnd)
      }

      // Get country and currency settings
      const settings = localStorage.getItem("appSettings")
      if (settings) {
        const parsedSettings = JSON.parse(settings)
        if (parsedSettings.country) {
          setSelectedCountry(parsedSettings.country)
          const country = countries.find((c) => c.name === parsedSettings.country)
          if (country) setCurrencySymbol(country.currency)
        }
      }

      // Set Flutterwave user info if available
      if (user) {
        setFlutterwaveEmail(user.email || "")
        setFlutterwaveName(user.name || "")
        setFlutterwavePhone(user.phone || "")
      }
    }
  }, [user])

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan)

    // Check if user has an active subscription
    if (currentSubscription && currentSubscription.status === "active") {
      const currentEndDate = new Date(currentSubscription.endDate)
      const today = new Date()

      // If current subscription is still active
      if (currentEndDate > today) {
        // If selected plan is the same as current plan, show renewal warning
        if (plan.id === currentSubscription.planId) {
          setRenewalWarningOpen(true)
          return
        }

        // If selected plan price is higher than current plan, it's an upgrade
        const currentPlan = plans.find((p) => p.id === currentSubscription.planId)
        if (currentPlan && plan.price > currentPlan.price) {
          setIsUpgrading(true)
          setIsDowngrading(false)
          setConfirmationDialogOpen(true)
          return
        }

        // If selected plan price is lower than current plan, it's a downgrade
        if (currentPlan && plan.price < currentPlan.price) {
          setIsUpgrading(false)
          setIsDowngrading(true)
          setConfirmationDialogOpen(true)
          return
        }
      }
    }

    // Check if user is still in trial period
    const isTrialActive = trialEndsAt ? new Date() < trialEndsAt : false
    if (isTrialActive && !currentSubscription) {
      setTrialWarningOpen(true)
      return
    }

    // Otherwise, proceed to payment
    setPaymentDialogOpen(true)
  }

  const proceedToPayment = () => {
    setTrialWarningOpen(false)
    setRenewalWarningOpen(false)
    setConfirmationDialogOpen(false)
    setPaymentDialogOpen(true)
  }

  const initiateFlutterwavePayment = (plan: SubscriptionPlan) => {
    if (!flutterwaveReady) {
      toast({
        title: "Payment system initializing",
        description: "Please try again in a moment.",
        variant: "destructive",
      })
      return
    }

    const tx_ref = "SC_" + Date.now().toString()

    try {
      window.FlutterwaveCheckout({
        public_key: "FLWPUBK_TEST-YOUR-PUBLIC-KEY-HERE", // Replace with your Flutterwave public key
        tx_ref: tx_ref,
        amount: plan.price,
        currency: currencySymbol === "KSH" ? "KES" : currencySymbol,
        payment_options: "card, mpesa, ussd",
        customer: {
          email: flutterwaveEmail || user?.email || "customer@example.com",
          phone_number: flutterwavePhone || user?.phone || "",
          name: flutterwaveName || user?.name || "Customer",
        },
        customizations: {
          title: "Smart Cow App Subscription",
          description: `Payment for ${plan.name} Plan`,
          logo: "https://www.example.com/logo.png", // Replace with your logo URL
        },
        callback: (response: any) => {
          // Handle successful payment
          if (response.status === "successful") {
            handlePaymentSuccess(plan, response.transaction_id, "flutterwave")
          } else {
            toast({
              title: "Payment failed",
              description: response.message || "Your payment was not successful. Please try again.",
              variant: "destructive",
            })
          }
        },
        onclose: () => {
          // Handle when customer closes payment modal
          console.log("Payment modal closed")
        },
      })
    } catch (error) {
      console.error("Flutterwave initialization error:", error)
      toast({
        title: "Payment error",
        description: "There was an error initializing the payment. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handlePaymentSuccess = (plan, transactionId, paymentMethod) => {
    handleSuccessfulPayment(
      plan,
      transactionId,
      paymentMethod,
      user,
      setCurrentSubscription,
      setPaymentSuccess,
      isUpgrading,
      isDowngrading,
      currencySymbol,
    )
  }

  const handlePayment = async () => {
    if (!selectedPlan) return

    // Validate payment details
    if (paymentMethod === "mpesa" || paymentMethod === "airtel") {
      if (!paymentNumber) return
    } else if (paymentMethod === "card") {
      if (!cardNumber || !cardExpiry || !cardCvv) return
    }

    setIsProcessing(true)

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Generate transaction ID
    const transactionId =
      paymentMethod === "card"
        ? "CARD-" + Math.floor(Math.random() * 1000000000)
        : paymentMethod === "mpesa"
          ? "MPESA-" + Math.floor(Math.random() * 1000000000)
          : "AIRTEL-" + Math.floor(Math.random() * 1000000000)

    handlePaymentSuccess(selectedPlan, transactionId, paymentMethod)
    setIsProcessing(false)
    setPaymentSuccess(true)

    // Reset after 3 seconds
    setTimeout(() => {
      setPaymentDialogOpen(false)
      setPaymentSuccess(false)
      setPaymentNumber("")
      setCardNumber("")
      setCardExpiry("")
      setCardCvv("")
      setIsUpgrading(false)
      setIsDowngrading(false)
    }, 3000)
  }

  const handleCountryChange = (country: string) => {
    setSelectedCountry(country)
    const selectedCountryObj = countries.find((c) => c.name === country)
    if (selectedCountryObj) {
      setCurrencySymbol(selectedCountryObj.currency)

      // Save to settings
      const settings = JSON.parse(localStorage.getItem("appSettings") || "{}")
      settings.country = country
      settings.currency = selectedCountryObj.currency
      localStorage.setItem("appSettings", JSON.stringify(settings))
    }
  }

  const isTrialActive = trialEndsAt ? new Date() < trialEndsAt : false
  const daysLeftInTrial = trialEndsAt
    ? Math.max(0, Math.ceil((trialEndsAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
    : 0

  const getCurrentPlanStatus = () => {
    if (currentSubscription && currentSubscription.status === "active") {
      const plan = plans.find((p) => p.id === currentSubscription.planId)
      const endDate = new Date(currentSubscription.endDate)
      const daysLeft = Math.max(0, Math.ceil((endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))

      return (
        <div className="flex items-center gap-2">
          <Badge className={`${plan?.color} text-white`}>{plan?.name}</Badge>
          <span>{daysLeft} days remaining</span>
        </div>
      )
    } else if (isTrialActive) {
      return (
        <div className="flex items-center gap-2">
          <Badge className="bg-green-600 text-white">Free Trial</Badge>
          <span>{daysLeftInTrial} days remaining</span>
        </div>
      )
    } else {
      return (
        <div className="flex items-center gap-2">
          <Badge variant="outline">No Active Plan</Badge>
        </div>
      )
    }
  }

  const canUpgrade = () => {
    if (!currentSubscription || currentSubscription.status !== "active") return false

    const currentPlan = plans.find((p) => p.id === currentSubscription.planId)
    if (!currentPlan) return false

    // Check if there are higher-priced plans available
    return plans.some((p) => p.price > currentPlan.price)
  }

  const canDowngrade = () => {
    if (!currentSubscription || currentSubscription.status !== "active") return false

    const currentPlan = plans.find((p) => p.id === currentSubscription.planId)
    if (!currentPlan) return false

    // Check if there are lower-priced plans available
    return plans.some((p) => p.price < currentPlan.price)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Flutterwave Script */}
      <Script
        src="https://checkout.flutterwave.com/v3.js"
        onLoad={() => setFlutterwaveReady(true)}
        onError={() => {
          console.error("Failed to load Flutterwave script")
          toast({
            title: "Payment system error",
            description: "Payment system could not be initialized. Please try again later.",
            variant: "destructive",
          })
        }}
      />

      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" asChild className="mr-2">
          <Link href="/">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-emerald-800 dark:text-emerald-400">Subscription Plans</h1>
      </div>

      <div className="mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Your Subscription</CardTitle>
            <CardDescription>
              {isTrialActive
                ? `You are currently in your free trial period, which ends on ${trialEndsAt?.toLocaleDateString()}`
                : currentSubscription && currentSubscription.status === "active"
                  ? `You are currently on the ${plans.find((p) => p.id === currentSubscription.planId)?.name} plan until ${format(new Date(currentSubscription.endDate), "MMMM dd, yyyy")}`
                  : "Your free trial has ended. Please select a subscription plan to continue using all features."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4">
              <div className="flex items-center space-x-4">
                <div className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 p-3 rounded-full">
                  <Cow className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-medium">Current Plan Status: {getCurrentPlanStatus()}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Current Cow Count: {cowCount}</p>
                </div>
              </div>
              <div className="mt-2">
                <Button variant="link" asChild className="p-0 h-auto text-emerald-600 dark:text-emerald-400">
                  <Link href="/payment-history">View Payment History</Link>
                </Button>
              </div>

              {currentSubscription && currentSubscription.status === "active" && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {canUpgrade() && (
                    <Button
                      variant="outline"
                      className="flex items-center gap-2"
                      onClick={() => {
                        setIsUpgrading(true)
                        setIsDowngrading(false)
                        setConfirmationDialogOpen(true)
                      }}
                    >
                      <ArrowUpRight className="h-4 w-4" />
                      Upgrade Subscription
                    </Button>
                  )}

                  {canDowngrade() && (
                    <Button
                      variant="outline"
                      className="flex items-center gap-2"
                      onClick={() => {
                        setIsUpgrading(false)
                        setIsDowngrading(true)
                        setConfirmationDialogOpen(true)
                      }}
                    >
                      <ArrowDownRight className="h-4 w-4" />
                      Downgrade Subscription
                    </Button>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <Label htmlFor="country">Select Your Country</Label>
                  <Select value={selectedCountry} onValueChange={handleCountryChange}>
                    <SelectTrigger id="country" className="mt-1">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country.name} value={country.name}>
                          {country.name} ({country.currency})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="phoneExample">Your Mobile Number Format</Label>
                  <div className="mt-1 p-2 border rounded-md bg-gray-50 dark:bg-gray-800">Example: 0723***885</div>
                </div>
              </div>

              <div className="mt-4">
                <Tabs defaultValue="flutterwave" className="w-full">
                  <TabsList className="grid grid-cols-2 mb-4">
                    <TabsTrigger value="flutterwave">Flutterwave</TabsTrigger>
                    <TabsTrigger value="pesapal">Pesapal</TabsTrigger>
                  </TabsList>
                  <TabsContent value="flutterwave">
                    <Button
                      onClick={() => setSimplePaymentOpen(true)}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600"
                    >
                      Pay with Flutterwave
                    </Button>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
                      Pay using M-Pesa, Card, or other methods
                    </p>
                  </TabsContent>
                  <TabsContent value="pesapal">
                    <Button
                      onClick={() => setPesapalPaymentOpen(true)}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600"
                    >
                      Pay with Pesapal
                    </Button>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
                      Secure payments via Pesapal
                    </p>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`${
              currentSubscription && currentSubscription.status === "active" && currentSubscription.planId === plan.id
                ? "border-2 border-emerald-500"
                : ""
            }`}
          >
            <CardHeader className={`${plan.color} text-white`}>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription className="text-white text-opacity-90">{plan.features[0]}</CardDescription>
              <div className="text-3xl font-bold mt-2">
                {currencySymbol} {plan.price.toLocaleString()}
              </div>
              <div className="text-sm">per month</div>
            </CardHeader>
            <CardContent className="pt-4">
              <ul className="space-y-2">
                {plan.features.slice(1).map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mr-2 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => handleSelectPlan(plan)}
                className={`w-full ${
                  currentSubscription &&
                  currentSubscription.status === "active" &&
                  currentSubscription.planId === plan.id
                    ? "bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600"
                    : "bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600"
                }`}
              >
                {currentSubscription &&
                currentSubscription.status === "active" &&
                currentSubscription.planId === plan.id
                  ? "Current Plan"
                  : "Select Plan"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Subscription FAQs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium">How do I change my plan?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              You can upgrade or downgrade your plan at any time by clicking the respective buttons in your subscription
              details.
            </p>
          </div>
          <div>
            <h3 className="font-medium">What happens if I exceed my cow limit?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Each plan has a specific cow limit. If you need to manage more cows, you'll need to upgrade to a higher
              plan.
            </p>
          </div>
          <div>
            <h3 className="font-medium">How do I cancel my subscription?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Contact our support team at support.mysmartcow.app@gmail.com to cancel your subscription.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Trial Warning Dialog */}
      <Dialog open={trialWarningOpen} onOpenChange={setTrialWarningOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Free Trial Still Active</DialogTitle>
            <DialogDescription>
              You still have {daysLeftInTrial} days left in your free trial period, which ends on{" "}
              {trialEndsAt?.toLocaleDateString()}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Alert
              variant="warning"
              className="bg-amber-50 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400 border-amber-200 dark:border-amber-800"
            >
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Do you want to continue with payment?</AlertTitle>
              <AlertDescription>
                You can continue using the app for free until your trial ends, or you can subscribe now to ensure
                uninterrupted access.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTrialWarningOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={proceedToPayment}
              className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600"
            >
              Continue to Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Renewal Warning Dialog */}
      <Dialog open={renewalWarningOpen} onOpenChange={setRenewalWarningOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Subscription Still Active</DialogTitle>
            <DialogDescription>
              Your current subscription is still active until{" "}
              {currentSubscription?.endDate ? format(new Date(currentSubscription.endDate), "MMMM dd, yyyy") : ""}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Alert
              variant="warning"
              className="bg-amber-50 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400 border-amber-200 dark:border-amber-800"
            >
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Early Renewal Not Allowed</AlertTitle>
              <AlertDescription>
                You cannot renew your subscription until it expires. If you want to change your plan, please use the
                upgrade or downgrade options.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenewalWarningOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upgrade/Downgrade Confirmation Dialog */}
      <Dialog open={confirmationDialogOpen} onOpenChange={setConfirmationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isUpgrading ? "Upgrade Your Subscription" : "Downgrade Your Subscription"}</DialogTitle>
            <DialogDescription>
              Please select the plan you want to {isUpgrading ? "upgrade to" : "downgrade to"}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="mb-4">
              <Label>Current Plan: {currentSubscription?.planName}</Label>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Expires on:{" "}
                {currentSubscription?.endDate ? format(new Date(currentSubscription.endDate), "MMMM dd, yyyy") : ""}
              </div>
            </div>

            <div className="mb-4">
              <Label>Current Cow Count: {cowCount}</Label>
            </div>

            <div className="space-y-4">
              <Label>Select New Plan:</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {plans
                  .filter((plan) => {
                    if (!currentSubscription) return true
                    const currentPlan = plans.find((p) => p.id === currentSubscription.planId)
                    if (!currentPlan) return true

                    return isUpgrading ? plan.price > currentPlan.price : plan.price < currentPlan.price
                  })
                  .map((plan) => (
                    <Button
                      key={plan.id}
                      variant={selectedPlan?.id === plan.id ? "default" : "outline"}
                      className={`p-4 h-auto flex flex-col items-start text-left ${
                        selectedPlan?.id === plan.id ? plan.color : ""
                      } ${selectedPlan?.id === plan.id ? "text-white" : ""}`}
                      onClick={() => setSelectedPlan(plan)}
                    >
                      <span className="text-lg font-bold">{plan.name}</span>
                      <span className="text-sm opacity-90">
                        {currencySymbol} {plan.price}/month
                      </span>
                    </Button>
                  ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setConfirmationDialogOpen(false)
                setSelectedPlan(null)
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={proceedToPayment}
              className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600"
              disabled={!selectedPlan}
            >
              Continue to Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {paymentSuccess
                ? "Payment Successful!"
                : isUpgrading
                  ? "Upgrade Your Subscription"
                  : isDowngrading
                    ? "Downgrade Your Subscription"
                    : `Subscribe to ${selectedPlan?.name} Plan`}
            </DialogTitle>
            <DialogDescription>
              {paymentSuccess
                ? "Your subscription has been activated successfully."
                : `Pay ${currencySymbol} ${selectedPlan?.price?.toLocaleString()} to ${isUpgrading ? "upgrade to" : isDowngrading ? "downgrade to" : "activate"} your subscription.`}
            </DialogDescription>
          </DialogHeader>
          {paymentSuccess ? (
            <div className="py-6 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                <Check className="h-6 w-6 text-emerald-600" />
              </div>
              <p>Thank you for your payment! Your subscription is now active.</p>
            </div>
          ) : (
            <>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Select Payment Method</Label>
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={setPaymentMethod}
                    className="flex flex-col space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="mpesa" id="mpesa" />
                      <Label htmlFor="mpesa" className="flex items-center gap-2 cursor-pointer">
                        <Phone className="h-4 w-4" /> M-Pesa
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="airtel" id="airtel" />
                      <Label htmlFor="airtel" className="flex items-center gap-2 cursor-pointer">
                        <Smartphone className="h-4 w-4" /> Airtel Money
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="card" id="card" />
                      <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer">
                        <CardIcon className="h-4 w-4" /> Credit/Debit Card
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {(paymentMethod === "mpesa" || paymentMethod === "airtel") && (
                  <div className="space-y-2">
                    <Label htmlFor="paymentNumber">Phone Number</Label>
                    <Input
                      id="paymentNumber"
                      placeholder={paymentMethod === "mpesa" ? "Enter M-Pesa number" : "Enter Airtel Money number"}
                      value={paymentNumber}
                      onChange={(e) => setPaymentNumber(e.target.value)}
                    />
                  </div>
                )}

                {paymentMethod === "card" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="cardExpiry">Expiry Date</Label>
                        <Input
                          id="cardExpiry"
                          placeholder="MM/YY"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cardCvv">CVV</Label>
                        <Input
                          id="cardCvv"
                          placeholder="123"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
                  <h4 className="font-medium mb-2">Payment Instructions:</h4>
                  {paymentMethod === "mpesa" && (
                    <ol className="list-decimal pl-5 space-y-1 text-sm">
                      <li>Enter your M-Pesa phone number</li>
                      <li>Click "Process Payment" to initiate the transaction</li>
                      <li>You will receive an M-Pesa prompt on your phone</li>
                      <li>Enter your M-Pesa PIN to complete the payment</li>
                    </ol>
                  )}
                  {paymentMethod === "airtel" && (
                    <ol className="list-decimal pl-5 space-y-1 text-sm">
                      <li>Enter your Airtel Money phone number</li>
                      <li>Click "Process Payment" to initiate the transaction</li>
                      <li>You will receive an Airtel Money prompt on your phone</li>
                      <li>Enter your Airtel Money PIN to complete the payment</li>
                    </ol>
                  )}
                  {paymentMethod === "card" && (
                    <ol className="list-decimal pl-5 space-y-1 text-sm">
                      <li>Enter your card details securely</li>
                      <li>Click "Process Payment" to complete the transaction</li>
                      <li>Your card will be charged immediately</li>
                      <li>You will receive a confirmation email</li>
                    </ol>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setPaymentDialogOpen(false)
                    setSelectedPlan(null)
                    setIsUpgrading(false)
                    setIsDowngrading(false)
                  }}
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handlePayment}
                  className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600"
                  disabled={
                    isProcessing ||
                    (paymentMethod === "mpesa" && !paymentNumber) ||
                    (paymentMethod === "airtel" && !paymentNumber) ||
                    (paymentMethod === "card" && (!cardNumber || !cardExpiry || !cardCvv))
                  }
                >
                  {isProcessing ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" /> Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      {isUpgrading ? "Process Upgrade" : isDowngrading ? "Process Downgrade" : "Process Payment"}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Simple Payment Dialog */}
      <Dialog open={simplePaymentOpen} onOpenChange={setSimplePaymentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Flutterwave Payment</DialogTitle>
            <DialogDescription>Choose a subscription package to pay for.</DialogDescription>
          </DialogHeader>
          <SimplePaymentForm
            onClose={() => setSimplePaymentOpen(false)}
            plans={plans}
            currencySymbol={currencySymbol}
            handlePaymentSuccess={handlePaymentSuccess}
          />
        </DialogContent>
      </Dialog>

      {/* Pesapal Payment Dialog */}
      <Dialog open={pesapalPaymentOpen} onOpenChange={setPesapalPaymentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pesapal Payment</DialogTitle>
            <DialogDescription>Choose a subscription package to pay for with Pesapal.</DialogDescription>
          </DialogHeader>
          <PesapalPaymentForm
            onClose={() => setPesapalPaymentOpen(false)}
            plans={plans}
            currencySymbol={currencySymbol}
            user={user}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
