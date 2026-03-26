"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { 
  Loader2, 
  Users as UsersIcon, 
  Calendar as CalendarIcon, 
  Clock, 
  ChevronRight, 
  Zap, 
  LayoutDashboard,
  CheckCircle2,
  AlertCircle
} from "lucide-react"
import { useAuth } from "@/components/providers/AuthProvider"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type SchedulePeriodStatus = "DRAFT" | "COLLECTING" | "GENERATING" | "REVIEW" | "PUBLISHED"

type SchedulePeriod = {
  id: string
  nama: string
  status: SchedulePeriodStatus
  deadlineAvailability: string | null
  _count?: { events: number }
}

const STATUS_CONFIG: Record<SchedulePeriodStatus, { label: string; class: string; icon: any }> = {
  DRAFT: { label: "Draft", class: "bg-slate-500/10 text-slate-600 border-slate-500/20", icon: Clock },
  COLLECTING: { label: "Mengumpulkan", class: "bg-blue-500/10 text-blue-600 border-blue-500/20", icon: UsersIcon },
  GENERATING: { label: "Proses AI", class: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20", icon: Zap },
  REVIEW: { label: "Tinjauan", class: "bg-orange-500/10 text-orange-600 border-orange-500/20", icon: AlertCircle },
  PUBLISHED: { label: "Diterbitkan", class: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", icon: CheckCircle2 },
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "-"
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
  })
}

export default function MultimediaDashboardPage() {
  const router = useRouter()
  const { hasMultimediaAccess, isMultimediaAdmin, isLoading: authLoading } = useAuth()
  const [periods, setPeriods] = useState<SchedulePeriod[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !hasMultimediaAccess) {
      router.replace("/admin")
    }
  }, [authLoading, hasMultimediaAccess, router])

  useEffect(() => {
    if (authLoading || !hasMultimediaAccess) return
    async function fetchPeriods() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch("/api/scheduler/periods")
        const json = await res.json()
        if (!res.ok) throw new Error(json.message ?? "Gagal memuat data")
        setPeriods(json.data ?? json)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal memuat data")
      } finally {
        setLoading(false)
      }
    }
    fetchPeriods()
  }, [authLoading, hasMultimediaAccess])

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
      </div>
    )
  }

  if (!hasMultimediaAccess) return null

  // Admin view
  if (isMultimediaAdmin) {
    const recentPeriods = periods.slice(0, 3)

    return (
      <div className="space-y-8 max-w-7xl mx-auto pb-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text">
              Dashboard Multimedia
            </h1>
            <p className="text-muted-foreground">Kelola jadwal dan tim multimedia gereja.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" asChild className="h-11 px-6 font-semibold bg-background/50 backdrop-blur-sm border-border/50">
              <Link href="/admin/multimedia/members">Kelola Tim</Link>
            </Button>
            <Button className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 h-11 px-6 font-semibold" asChild>
              <Link href="/admin/multimedia/schedules">Buat Jadwal Baru</Link>
            </Button>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-destructive animate-pulse" />
            {error}
          </div>
        )}

        {/* Stats row */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="bg-gradient-to-br from-indigo-500/5 to-blue-500/5 border-indigo-500/10">
            <CardHeader className="pb-2">
              <CardDescription className="text-[10px] font-bold uppercase tracking-widest">Total Periode</CardDescription>
              <CardTitle className="text-3xl font-bold">{loading ? "—" : periods.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <Link href="/admin/multimedia/schedules" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                Lihat semua periode <ChevronRight className="h-3 w-3" />
              </Link>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border-emerald-500/10">
            <CardHeader className="pb-2">
              <CardDescription className="text-[10px] font-bold uppercase tracking-widest">Status Aktif</CardDescription>
              <CardTitle className="text-3xl font-bold">
                {periods.filter(p => p.status !== "PUBLISHED").length}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Periode dalam proses pengerjaan</p>
            </CardContent>
          </Card>

          <Card className="bg-accent/50 border-border/50 hidden lg:block">
            <CardHeader className="pb-2">
              <CardDescription className="text-[10px] font-bold uppercase tracking-widest">Quick Tips</CardDescription>
              <CardTitle className="text-sm font-bold">Otomasi Jadwal</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Gunakan fitur <strong>Generate Jadwal AI</strong> setelah mengumpulkan respon ketersediaan tim.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent periods */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight">Jadwal Terkini</h2>
            <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
              <Link href="/admin/multimedia/schedules" className="flex items-center gap-1">
                Lihat semua <ChevronRight className="h-3 w-3" />
              </Link>
            </Button>
          </div>

          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-border/40 bg-background/50 p-6 shadow-sm animate-pulse h-40"
                />
              ))}
            </div>
          ) : recentPeriods.length === 0 ? (
            <Card className="border-dashed bg-muted/30">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <CalendarIcon className="h-10 w-10 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground text-sm font-medium">Belum ada periode jadwal.</p>
                <Button className="mt-6" asChild>
                  <Link href="/admin/multimedia/schedules">Buat Jadwal Baru</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {recentPeriods.map((period) => {
                const config = STATUS_CONFIG[period.status]
                const StatusIcon = config.icon

                return (
                  <Card 
                    key={period.id}
                    className="group relative overflow-hidden border-border/50 bg-background/40 hover:bg-background transition-all hover:shadow-lg cursor-pointer"
                    onClick={() => router.push(`/admin/multimedia/schedules/${period.id}`)}
                  >
                    <CardHeader className="p-5 pb-3">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <Badge variant="outline" className={cn("text-[9px] font-bold uppercase tracking-wider px-2 py-0 border-0", config.class)}>
                          {period.status === "GENERATING" && <Loader2 className="mr-1 h-2 w-2 animate-spin" />}
                          {config.label}
                        </Badge>
                        <StatusIcon className={cn("h-4 w-4 opacity-40", config.class.split(' ')[1])} />
                      </div>
                      <CardTitle className="text-base font-bold group-hover:text-primary transition-colors leading-tight">
                        {period.nama}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-5 pt-0 space-y-3">
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        Deadline: {formatDate(period.deadlineAvailability)}
                      </div>
                      <div className="pt-3 border-t border-border/40 flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                          {period._count?.events || 0} Agenda
                        </span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Member view
  const collectingPeriods = periods.filter(p => p.status === "COLLECTING")
  const publishedPeriods = periods.filter(p => p.status === "PUBLISHED")

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text">
          Dashboard Multimedia
        </h1>
        <p className="text-muted-foreground">Jadwal pelayanan dan ketersediaan Anda.</p>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
        </div>
      ) : (
        <div className="grid gap-8">
          {/* Availability request cards */}
          {collectingPeriods.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-[0.2em] px-1">
                Butuh Respon Anda
              </h2>
              <div className="grid gap-6 sm:grid-cols-2">
                {collectingPeriods.map(period => (
                  <Card key={period.id} className="relative overflow-hidden border-blue-500/20 bg-blue-500/[0.03] shadow-lg shadow-blue-500/5">
                    <CardHeader>
                      <CardTitle className="text-lg font-bold text-blue-600 dark:text-blue-400">{period.nama}</CardTitle>
                      <CardDescription className="flex items-center gap-1.5 font-medium">
                        <Clock className="h-3.5 w-3.5 text-blue-500" />
                        Deadline: {formatDate(period.deadlineAvailability)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 w-full sm:w-auto" asChild>
                        <Link href="/admin/multimedia/availability">Isi Ketersediaan</Link>
                      </Button>
                    </CardContent>
                    <div className="absolute -right-8 -bottom-8 h-32 w-32 rounded-full bg-blue-500/5 blur-3xl" />
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Published schedule */}
          {publishedPeriods.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-[0.2em] px-1">
                Jadwal Terbit
              </h2>
              <Card className="relative overflow-hidden border-emerald-500/20 bg-emerald-500/[0.03] shadow-lg shadow-emerald-500/5">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-emerald-600 dark:text-emerald-400">Jadwal Pelayanan Tersedia</CardTitle>
                  <CardDescription className="font-medium">
                    Jadwal untuk {publishedPeriods.map(p => p.nama).join(", ")} sudah diterbitkan.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-600 transition-all" asChild>
                    <Link href="/admin/multimedia/my-schedule">Lihat Jadwal Saya</Link>
                  </Button>
                </CardContent>
                <div className="absolute -right-8 -bottom-8 h-32 w-32 rounded-full bg-emerald-500/5 blur-3xl" />
              </Card>
            </div>
          )}

          {collectingPeriods.length === 0 && publishedPeriods.length === 0 && (
            <Card className="border-dashed bg-muted/30">
              <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                <LayoutDashboard className="h-12 w-12 text-muted-foreground/20 mb-4" />
                <p className="text-muted-foreground text-sm font-medium">
                  Belum ada jadwal aktif saat ini. Tunggu informasi selanjutnya dari admin multimedia.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
