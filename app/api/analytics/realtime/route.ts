import { NextResponse } from "next/server"
import { BetaAnalyticsDataClient } from "@google-analytics/data"
import { requireAuth } from "@/lib/auth"

function getClient() {
  return new BetaAnalyticsDataClient({
    credentials: {
      client_email: process.env.GA_CLIENT_EMAIL,
      private_key: process.env.GA_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
  })
}

export async function GET() {
  const { response } = await requireAuth()
  if (response) return response

  const propertyId = process.env.GA_PROPERTY_ID
  if (!propertyId || !process.env.GA_CLIENT_EMAIL || !process.env.GA_PRIVATE_KEY) {
    return NextResponse.json({ success: false, message: "Google Analytics not configured" }, { status: 503 })
  }

  try {
    const client = getClient()

    const [realtimeRes] = await client.runRealtimeReport({
      property: `properties/${propertyId}`,
      dimensions: [{ name: "unifiedScreenName" }],
      metrics: [{ name: "activeUsers" }],
    })

    const activeUsers = realtimeRes.rows?.reduce(
      (sum, row) => sum + Number(row.metricValues?.[0]?.value ?? 0),
      0
    ) ?? 0

    const topActivePages = (realtimeRes.rows ?? [])
      .map((r) => ({
        page: r.dimensionValues?.[0]?.value ?? "/",
        activeUsers: Number(r.metricValues?.[0]?.value ?? 0),
      }))
      .sort((a, b) => b.activeUsers - a.activeUsers)
      .slice(0, 5)

    return NextResponse.json({ success: true, data: { activeUsers, topActivePages } })
  } catch (error) {
    console.error("GA Realtime API error:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch realtime data" }, { status: 500 })
  }
}
