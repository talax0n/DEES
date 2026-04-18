"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Loader2,
  Calendar as CalendarIcon,
  Clock,
  ChevronRight,
  Zap,
  CheckCircle2,
  AlertCircle,
  Users as UsersIcon,
  Video,
  Download
} from "lucide-react"
import { useAuth } from "@/components/providers/AuthProvider"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

type SchedulePeriodStatus = "DRAFT" | "COLLECTING" | "GENERATING" | "REVIEW" | "PUBLISHED"
type MultimediaRole = "SLD" | "SND" | "STR" | "CAM"

type SchedulePeriod = {
  id: string
  nama: string
  bulan: number
  tahun: number
  status: SchedulePeriodStatus
}

type Assignment = {
  id: string
  role: MultimediaRole
  event: {
    id: string
    namaEvent: string
    tanggal: string
    waktu: string
    kategori: string
    keterangan: string | null
  }
}

type PeriodSchedule = {
  period: SchedulePeriod
  assignments: Assignment[]
}

const ROLE_CLASS: Record<MultimediaRole, string> = {
  SLD: "bg-slate-500/10 text-slate-500 border-slate-500/20",
  SND: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  STR: "bg-rose-500/10 text-rose-500 border-rose-500/20",
  CAM: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
}

const ROLE_LABELS: Record<MultimediaRole, string> = {
  SLD: "Operator Slide",
  SND: "Operator Sound",
  STR: "Streamer",
  CAM: "Cameraman",
}

const BULAN_NAMES = [
  "", "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
]

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })
}

export default function MySchedulePage() {
  const router = useRouter()
  const { hasMultimediaAccess, user, isLoading: authLoading } = useAuth()
  const [schedules, setSchedules] = useState<PeriodSchedule[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !hasMultimediaAccess) {
      router.replace("/admin")
    }
  }, [authLoading, hasMultimediaAccess, router])

  useEffect(() => {
    if (authLoading || !hasMultimediaAccess) return
    if (!user?.multimediaMemberId) {
      setLoading(false)
      return
    }

    async function load() {
      setLoading(true)
      try {
        // Fetch all periods, filter to PUBLISHED
        const res = await fetch("/api/scheduler/periods")
        const json = await res.json()
        if (!res.ok) throw new Error(json.message ?? "Gagal memuat data")

        const allPeriods: SchedulePeriod[] = json.data ?? json
        const published = allPeriods.filter(p => p.status === "PUBLISHED")

        // Fetch assignments for each published period
        const results = await Promise.all(
          published.map(async (period) => {
            try {
              const aRes = await fetch(`/api/scheduler/assignments/mine/${period.id}`)
              const aJson = await aRes.json()
              const assignments: Assignment[] = aJson.data ?? []
              return { period, assignments }
            } catch {
              return { period, assignments: [] }
            }
          })
        )

        // Only show periods where user has assignments
        setSchedules(results.filter(r => r.assignments.length > 0))
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Gagal memuat jadwal")
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [authLoading, hasMultimediaAccess, user?.multimediaMemberId])

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
      </div>
    )
  }

  if (!hasMultimediaAccess) return null

  // No member linked
  if (!user?.multimediaMemberId) {
    return (
      <div className="space-y-8 max-w-3xl mx-auto pb-20">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text">
            Jadwal Saya
          </h1>
          <p className="text-muted-foreground">Jadwal pelayanan Anda yang sudah diterbitkan.</p>
        </div>
        
        <Card className="border-yellow-500/20 bg-yellow-500/[0.03] shadow-lg shadow-yellow-500/5">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-16 w-16 rounded-full bg-yellow-500/10 flex items-center justify-center mb-6 ring-1 ring-yellow-500/20 shadow-sm">
              <AlertCircle className="h-8 w-8 text-yellow-600" />
            </div>
            <h3 className="text-xl font-bold text-yellow-800 dark:text-yellow-500">Akun belum terdaftar</h3>
            <p className="text-muted-foreground max-w-sm mt-2 mb-8 text-sm">
              Akun Anda belum terdaftar sebagai anggota tim multimedia. Hubungi admin multimedia untuk menautkan akun Anda agar dapat melihat jadwal pelayanan Anda.
            </p>
            <Button variant="outline" className="border-yellow-500/30 hover:bg-yellow-500/10" onClick={() => router.push("/admin/multimedia")}>
              Kembali ke Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text">
            Jadwal Pelayanan Saya
          </h1>
          <p className="text-muted-foreground">Daftar penugasan Anda untuk periode aktif.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild className="h-11 px-6 font-semibold bg-background/50 backdrop-blur-sm border-border/50">
            <a href={`/api/scheduler/export/mine`} target="_blank" rel="noreferrer">
              <Download className="mr-2 h-4 w-4" />
              Ekspor Kalender
            </a>
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i} className="animate-pulse h-64 border-border/40 bg-background/50" />
          ))}
        </div>
      ) : schedules.length === 0 ? (
        <Card className="border-dashed bg-muted/30">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-16 w-16 rounded-full bg-background flex items-center justify-center mb-6 ring-1 ring-border shadow-sm">
              <CalendarIcon className="h-8 w-8 text-muted-foreground/30" />
            </div>
            <h3 className="text-lg font-bold">Tidak ada penugasan</h3>
            <p className="text-muted-foreground text-sm max-w-xs mt-2">
              Belum ada jadwal pelayanan yang diterbitkan untuk Anda di periode aktif saat ini.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-12">
          {schedules.map(({ period, assignments }) => (
            <div key={period.id} className="space-y-6">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold tracking-tight">{period.nama}</h2>
                <div className="h-[1px] flex-1 bg-border/40" />
                <Badge variant="outline" className="bg-emerald-500/5 text-emerald-600 border-emerald-500/20 font-bold uppercase tracking-widest text-[10px]">
                  Terbit
                </Badge>
              </div>

              <div className="grid gap-6">
                {assignments.map((a) => (
                  <Card key={a.id} className="overflow-hidden border-border/50 bg-background/40 hover:bg-background transition-all hover:shadow-xl hover:shadow-primary/5 group">
                    <CardHeader className="p-0">
                      <div className="flex flex-col md:flex-row">
                        {/* Date badge column */}
                        <div className="w-full md:w-48 bg-muted/30 md:border-r border-border/40 p-6 flex flex-row md:flex-col items-center justify-center gap-4 md:gap-1 text-center shrink-0">
                          <span className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">{formatDate(a.event.tanggal).split(",")[0]}</span>
                          <span className="text-4xl font-black text-foreground tabular-nums leading-none">{new Date(a.event.tanggal).getDate()}</span>
                          <span className="text-xs font-bold text-primary uppercase tracking-widest">{BULAN_NAMES[period.bulan].substring(0, 3)} {period.tahun}</span>
                        </div>
                        
                        {/* Content column */}
                        <div className="flex-1 p-6 space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest bg-primary/5 text-primary border-primary/10">
                                  {a.event.kategori}
                                </Badge>
                                {a.event.kategori === "Ibadah Raya" && (
                                  <Video className="h-3.5 w-3.5 text-rose-500" />
                                )}
                              </div>
                              <h3 className="text-lg font-bold leading-tight group-hover:text-primary transition-colors">{a.event.namaEvent}</h3>
                              <p className="text-sm text-muted-foreground flex items-center gap-1.5 font-medium">
                                <Clock className="h-3.5 w-3.5" />
                                {a.event.waktu}
                              </p>
                            </div>
                            
                            <div className="shrink-0 flex flex-col items-end">
                              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1.5">Penugasan Anda</p>
                              <Badge className={cn("px-3 py-1 text-xs font-bold uppercase tracking-wider shadow-sm", ROLE_CLASS[a.role])}>
                                {ROLE_LABELS[a.role]}
                              </Badge>
                            </div>
                          </div>
                          
                          {a.event.keterangan && (
                            <div className="pt-4 border-t border-border/40">
                              <p className="text-xs text-muted-foreground italic flex items-start gap-2">
                                <Zap className="h-3 w-3 mt-0.5 shrink-0 text-indigo-500" />
                                <span>Catatan: {a.event.keterangan}</span>
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
