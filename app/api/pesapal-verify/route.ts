import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const orderTrackingId = url.searchParams.get("orderTrackingId")

    if (!orderTrackingId) {
      return NextResponse.json({ error: "Missing orderTrackingId parameter" }, { status: 400 })
    }

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

    // Step 2: Verify payment status
    const verifyRes = await fetch(
      `https://pay.pesapal.com/v3/api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      },
    )

    const data = await verifyRes.json()

    if (data.error) {
      console.error("Pesapal verification error:", data)
      return NextResponse.json({ error: data.error }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Pesapal verification error:", error)
    return NextResponse.json({ error: "Payment verification failed" }, { status: 500 })
  }
}
