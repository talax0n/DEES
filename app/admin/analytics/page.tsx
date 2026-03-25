"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { Users, Eye, Clock, TrendingUp, Wifi, Monitor, Smartphone, Tablet, Globe, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"

interface Summary {
  sessions: number
  totalUsers: number
  newUsers: number
  avgSessionDuration: number
  bounceRate: number
  pageViews: number
}

interface TopPage {
  path: string
  views: number
  users: number
}

interface DeviceStat {
  device: string
  sessions: number
}

interface CountryStat {
  country: string
  users: number
}

interface DailyPoint {
  date: string
  sessions: number
  users: number
}

interface AnalyticsData {
  summary: Summary
  topPages: TopPage[]
  devices: DeviceStat[]
  countries: CountryStat[]
  daily: DailyPoint[]
}

interface RealtimeData {
  activeUsers: number
  topActivePages: { page: string; activeUsers: number }[]
}

const DEVICE_COLORS: Record<string, string> = {
  desktop: "hsl(var(--primary))",
  mobile: "hsl(221 83% 53%)",
  tablet: "hsl(142 71% 45%)",
}

const CHART_COLORS = ["hsl(var(--primary))", "hsl(221 83% 53%)", "hsl(142 71% 45%)", "hsl(38 92% 50%)", "hsl(280 70% 60%)"]

function DeviceIcon({ device }: { device: string }) {
  if (device === "mobile") return <Smartphone className="h-4 w-4" />
  if (device === "tablet") return <Tablet className="h-4 w-4" />
  return <Monitor className="h-4 w-4" />
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = Math.round(seconds % 60)
  return `${m}m ${s}s`
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString("id-ID", { month: "short", day: "numeric" })
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [realtime, setRealtime] = useState<RealtimeData | null>(null)
  const [loading, setLoading] = useState(true)
  const [realtimeLoading, setRealtimeLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await fetch("/api/analytics")
      const json = await res.json()
      if (!json.success) throw new Error(json.message)
      setData(json.data)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat data analytics")
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchRealtime = useCallback(async () => {
    try {
      const res = await fetch("/api/analytics/realtime")
      const json = await res.json()
      if (!json.success) throw new Error(json.message)
      setRealtime(json.data)
      setLastUpdated(new Date())
    } catch {
      // silent — realtime failures shouldn't break the page
    } finally {
      setRealtimeLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAnalytics()
    fetchRealtime()
  }, [fetchAnalytics, fetchRealtime])

  // Poll realtime every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchRealtime, 30_000)
    return () => clearInterval(interval)
  }, [fetchRealtime])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-56 bg-muted animate-pulse rounded-lg" />
            <div className="h-4 w-72 bg-muted animate-pulse rounded mt-2" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-72 bg-muted animate-pulse rounded-xl" />
          <div className="h-72 bg-muted animate-pulse rounded-xl" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
          <TrendingUp className="h-8 w-8 text-destructive" />
        </div>
        <div className="text-center">
          <h2 className="text-lg font-semibold">Gagal memuat data</h2>
          <p className="text-sm text-muted-foreground mt-1">{error}</p>
        </div>
        <button
          onClick={() => { setLoading(true); setError(null); fetchAnalytics() }}
          className="flex items-center gap-2 text-sm text-primary hover:underline"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Coba lagi
        </button>
      </div>
    )
  }

  const { summary, topPages, devices, countries, daily } = data!

  const totalDeviceSessions = devices.reduce((s, d) => s + d.sessions, 0)

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Analytics</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Statistik pengunjung website GPIB Damai Sejahtera — 30 hari terakhir
          </p>
        </div>
        {/* Realtime badge */}
        <div className="flex items-center gap-3">
          {!realtimeLoading && realtime && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-xs font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              <Wifi className="h-3 w-3" />
              {realtime.activeUsers} aktif sekarang
            </div>
          )}
          {lastUpdated && (
            <p className="text-xs text-muted-foreground">
              Realtime diperbarui {lastUpdated.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </p>
          )}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon={Users}
          label="Total Pengguna"
          value={summary.totalUsers.toLocaleString("id-ID")}
          sub={`${summary.newUsers.toLocaleString("id-ID")} pengguna baru`}
          color="text-primary"
          bg="bg-primary/10"
        />
        <MetricCard
          icon={Eye}
          label="Halaman Dilihat"
          value={summary.pageViews.toLocaleString("id-ID")}
          sub={`${summary.sessions.toLocaleString("id-ID")} sesi`}
          color="text-blue-500"
          bg="bg-blue-500/10"
        />
        <MetricCard
          icon={Clock}
          label="Rata-rata Sesi"
          value={formatDuration(summary.avgSessionDuration)}
          sub="per kunjungan"
          color="text-green-500"
          bg="bg-green-500/10"
        />
        <MetricCard
          icon={TrendingUp}
          label="Bounce Rate"
          value={`${(summary.bounceRate * 100).toFixed(1)}%`}
          sub="pengguna meninggalkan langsung"
          color="text-orange-500"
          bg="bg-orange-500/10"
        />
      </div>

      {/* Daily chart + realtime active pages */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 bg-background/50 backdrop-blur-xl border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Sesi & Pengguna Harian</CardTitle>
            <p className="text-xs text-muted-foreground">14 hari terakhir</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={daily} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(221 83% 53%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(221 83% 53%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                  labelFormatter={formatDate}
                />
                <Area type="monotone" dataKey="sessions" name="Sesi" stroke="hsl(var(--primary))" fill="url(#colorSessions)" strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="users" name="Pengguna" stroke="hsl(221 83% 53%)" fill="url(#colorUsers)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Realtime active pages */}
        <Card className="bg-background/50 backdrop-blur-xl border-border/40">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Aktif Sekarang</CardTitle>
              {!realtimeLoading && realtime && (
                <span className="text-2xl font-bold text-green-500">{realtime.activeUsers}</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Halaman yang sedang dilihat</p>
          </CardHeader>
          <CardContent>
            {realtimeLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-8 bg-muted animate-pulse rounded" />
                ))}
              </div>
            ) : realtime?.topActivePages.length ? (
              <div className="space-y-2">
                {realtime.topActivePages.map((p, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <p className="text-xs text-muted-foreground truncate flex-1 mr-2" title={p.page}>{p.page}</p>
                    <span className="shrink-0 text-xs font-semibold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">{p.activeUsers}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">Tidak ada pengguna aktif</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top pages + device breakdown */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Top pages */}
        <Card className="bg-background/50 backdrop-blur-xl border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Halaman Terpopuler</CardTitle>
            <p className="text-xs text-muted-foreground">10 halaman dengan pageview terbanyak</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topPages.map((p, i) => {
                const maxViews = topPages[0]?.views ?? 1
                const pct = (p.views / maxViews) * 100
                return (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground truncate flex-1 mr-2" title={p.path}>{p.path}</span>
                      <span className="shrink-0 font-medium">{p.views.toLocaleString("id-ID")}</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Device breakdown + countries */}
        <div className="space-y-4">
          <Card className="bg-background/50 backdrop-blur-xl border-border/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Perangkat</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="w-36 h-36 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={devices} dataKey="sessions" nameKey="device" cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={3}>
                        {devices.map((d, i) => (
                          <Cell key={i} fill={DEVICE_COLORS[d.device.toLowerCase()] ?? CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-2">
                  {devices.map((d, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-muted-foreground capitalize">
                        <DeviceIcon device={d.device.toLowerCase()} />
                        {d.device}
                      </div>
                      <div className="text-right">
                        <span className="font-medium">{d.sessions.toLocaleString("id-ID")}</span>
                        <span className="text-muted-foreground ml-1">
                          ({totalDeviceSessions ? Math.round((d.sessions / totalDeviceSessions) * 100) : 0}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-background/50 backdrop-blur-xl border-border/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Negara Teratas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {countries.map((c, i) => {
                  const maxUsers = countries[0]?.users ?? 1
                  const pct = (c.users / maxUsers) * 100
                  return (
                    <div key={i} className="flex items-center gap-3 text-xs">
                      <Globe className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground w-24 truncate">{c.country}</span>
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: CHART_COLORS[i % CHART_COLORS.length] }} />
                      </div>
                      <span className="font-medium w-10 text-right">{c.users.toLocaleString("id-ID")}</span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function MetricCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
  bg,
}: {
  icon: React.ElementType
  label: string
  value: string
  sub: string
  color: string
  bg: string
}) {
  return (
    <Card className="bg-background/50 backdrop-blur-xl border-border/40">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", bg)}>
            <Icon className={cn("h-5 w-5", color)} />
          </div>
        </div>
        <div className="mt-3">
          <p className="text-2xl font-bold tracking-tight">{value}</p>
          <p className="text-xs font-medium text-foreground mt-0.5">{label}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
        </div>
      </CardContent>
    </Card>
  )
}
