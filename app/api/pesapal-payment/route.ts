import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { amount, customerEmail, customerName, customerPhone, invoiceId } = body

    const consumerKey = "3E0oAmog9d5eOHR9/N6JfnKT+fPGBXiZ"
    const consumerSecret = "ap7lBpQ25Mfj4mpsQ51kIOYW7Mg="

    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64")

    // Step 1: Get OAuth Token
    const tokenRes = await fetch("https://pay.pesapal.com/v3/api/Auth/RequestToken", {
      method: "GET",
      headers: {
        Authorization: `Basic ${auth}`,
        Accept: "application/json",
      },
    })

    const tokenData = await tokenRes.json()

    if (!tokenData.token) {
      console.error("Failed to get Pesapal token:", tokenData)
      return NextResponse.json({ error: "Failed to get authentication token" }, { status: 500 })
    }

    const token = tokenData.token

    // Step 2: Submit Order
    const order = {
      id: invoiceId || `INV-${Date.now()}`, // unique invoice number
      currency: "KES",
      amount: amount || 100, // set amount dynamically
      description: "Smart Cow Subscription",
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://smartcow.vercel.app"}/payment-success`,
      cancellation_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://smartcow.vercel.app"}/payment-cancelled`,
      notification_id: "smart-cow-ipn", // register an IPN url on Pesapal dashboard
      billing_address: {
        email_address: customerEmail || "customer@email.com",
        phone_number: customerPhone || "254700000000",
        first_name: customerName?.split(" ")[0] || "John",
        last_name: customerName?.split(" ")[1] || "Doe",
        line_1: "",
        city: "Nairobi",
        state: "",
        postal_code: "00100",
        country_code: "KE",
      },
    }

    const payRes = await fetch("https://pay.pesapal.com/v3/api/Transactions/SubmitOrderRequest", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(order),
    })

    const data = await payRes.json()

    if (data.error) {
      console.error("Pesapal payment error:", data)
      return NextResponse.json({ error: data.error }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Pesapal payment processing error:", error)
    return NextResponse.json({ error: "Payment processing failed" }, { status: 500 })
  }
}
