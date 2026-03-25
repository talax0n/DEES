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

    const [pageviewsRes, topPagesRes, deviceRes, countryRes] = await Promise.all([
      // Sessions + users for last 30 days
      client.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
        metrics: [
          { name: "sessions" },
          { name: "totalUsers" },
          { name: "newUsers" },
          { name: "averageSessionDuration" },
          { name: "bounceRate" },
          { name: "screenPageViews" },
        ],
      }),
      // Top pages
      client.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
        dimensions: [{ name: "pagePath" }],
        metrics: [{ name: "screenPageViews" }, { name: "totalUsers" }],
        orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
        limit: 10,
      }),
      // Device breakdown
      client.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
        dimensions: [{ name: "deviceCategory" }],
        metrics: [{ name: "sessions" }],
      }),
      // Top countries
      client.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
        dimensions: [{ name: "country" }],
        metrics: [{ name: "totalUsers" }],
        orderBys: [{ metric: { metricName: "totalUsers" }, desc: true }],
        limit: 5,
      }),
    ])

    // Daily sessions for the last 14 days
    const [dailyRes] = await Promise.all([
      client.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate: "13daysAgo", endDate: "today" }],
        dimensions: [{ name: "date" }],
        metrics: [{ name: "sessions" }, { name: "totalUsers" }],
        orderBys: [{ dimension: { dimensionName: "date" } }],
      }),
    ])

    const row0 = pageviewsRes[0]?.rows?.[0]
    const summary = {
      sessions: Number(row0?.metricValues?.[0]?.value ?? 0),
      totalUsers: Number(row0?.metricValues?.[1]?.value ?? 0),
      newUsers: Number(row0?.metricValues?.[2]?.value ?? 0),
      avgSessionDuration: Number(row0?.metricValues?.[3]?.value ?? 0),
      bounceRate: Number(row0?.metricValues?.[4]?.value ?? 0),
      pageViews: Number(row0?.metricValues?.[5]?.value ?? 0),
    }

    const topPages = (topPagesRes[0]?.rows ?? []).map((r) => ({
      path: r.dimensionValues?.[0]?.value ?? "/",
      views: Number(r.metricValues?.[0]?.value ?? 0),
      users: Number(r.metricValues?.[1]?.value ?? 0),
    }))

    const devices = (deviceRes[0]?.rows ?? []).map((r) => ({
      device: r.dimensionValues?.[0]?.value ?? "unknown",
      sessions: Number(r.metricValues?.[0]?.value ?? 0),
    }))

    const countries = (countryRes[0]?.rows ?? []).map((r) => ({
      country: r.dimensionValues?.[0]?.value ?? "unknown",
      users: Number(r.metricValues?.[0]?.value ?? 0),
    }))

    const daily = (dailyRes[0]?.rows ?? []).map((r) => {
      const raw = r.dimensionValues?.[0]?.value ?? ""
      const date = `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`
      return {
        date,
        sessions: Number(r.metricValues?.[0]?.value ?? 0),
        users: Number(r.metricValues?.[1]?.value ?? 0),
      }
    })

    return NextResponse.json({ success: true, data: { summary, topPages, devices, countries, daily } })
  } catch (error) {
    console.error("GA Data API error:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch analytics" }, { status: 500 })
  }
}
