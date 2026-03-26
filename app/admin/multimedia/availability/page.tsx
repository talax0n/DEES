"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  Loader2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Check,
  X,
  HelpCircle,
  Calendar as CalendarIcon,
  ChevronRight
} from "lucide-react"
import { useAuth } from "@/components/providers/AuthProvider"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type SchedulePeriodStatus = "DRAFT" | "COLLECTING" | "GENERATING" | "REVIEW" | "PUBLISHED"
type AvailabilityStatus = "AVAILABLE" | "UNAVAILABLE" | "MAYBE"

type SchedulePeriod = {
  id: string
  nama: string
  status: SchedulePeriodStatus
  deadlineAvailability: string | null
}

type ScheduleEvent = {
  id: string
  namaEvent: string
  tanggal: string
  waktu: string
  kategori: string
}

type PeriodEvents = {
  period: SchedulePeriod
  events: ScheduleEvent[]
}

type AvailabilityEntry = {
  eventId: string
  status: AvailabilityStatus
}

const STATUS_OPTIONS: {
  value: AvailabilityStatus
  label: string
  icon: any
  activeClass: string
  inactiveClass: string
}[] = [
  {
    value: "AVAILABLE",
    label: "Bisa",
    icon: Check,
    activeClass: "bg-green-500 text-white border-green-600 shadow-green-500/20",
    inactiveClass: "bg-green-500/5 text-green-600 border-green-500/20 hover:bg-green-500/10",
  },
  {
    value: "MAYBE",
    label: "Ragu",
    icon: HelpCircle,
    activeClass: "bg-yellow-500 text-white border-yellow-600 shadow-yellow-500/20",
    inactiveClass: "bg-yellow-500/5 text-yellow-600 border-yellow-500/20 hover:bg-yellow-500/10",
  },
  {
    value: "UNAVAILABLE",
    label: "Tidak Bisa",
    icon: X,
    activeClass: "bg-rose-500 text-white border-rose-600 shadow-rose-500/20",
    inactiveClass: "bg-rose-500/5 text-rose-600 border-rose-500/20 hover:bg-rose-500/10",
  },
]

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })
}

function formatDeadline(dateStr: string | null) {
  if (!dateStr) return null
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export default function AvailabilityPage() {
  const router = useRouter()
  const { hasMultimediaAccess, user, isLoading: authLoading } = useAuth()
  const [periodsWithEvents, setPeriodsWithEvents] = useState<PeriodEvents[]>([])
  const [loading, setLoading] = useState(true)
  // Map of periodId -> { eventId -> status }
  const [selections, setSelections] = useState<Record<string, Record<string, AvailabilityStatus>>>({})
  const [submitting, setSubmitting] = useState<Record<string, boolean>>({})
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (!authLoading && !hasMultimediaAccess) {
      router.replace("/admin")
    }
  }, [authLoading, hasMultimediaAccess, router])

  useEffect(() => {
    if (authLoading || !hasMultimediaAccess) return

    async function load() {
      setLoading(true)
      try {
        const res = await fetch("/api/scheduler/periods")
        const json = await res.json()
        if (!res.ok) throw new Error(json.message ?? "Gagal memuat data")

        const allPeriods: SchedulePeriod[] = json.data ?? json
        const collecting = allPeriods.filter(p => p.status === "COLLECTING")

        // Fetch events for each collecting period
        const results = await Promise.all(
          collecting.map(async (period) => {
            try {
              const evRes = await fetch(`/api/scheduler/periods/${period.id}/events`)
              const evJson = await evRes.json()
              const events: ScheduleEvent[] = evJson.success ? evJson.data : (evJson.data ?? [])
              return { period, events }
            } catch {
              return { period, events: [] }
            }
          })
        )
        setPeriodsWithEvents(results)

        // Init selections
        const initSelections: Record<string, Record<string, AvailabilityStatus>> = {}
        for (const { period, events } of results) {
          initSelections[period.id] = {}
          for (const ev of events) {
            initSelections[period.id][ev.id] = "AVAILABLE"
          }
        }
        setSelections(initSelections)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Gagal memuat data")
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [authLoading, hasMultimediaAccess])

  function setStatus(periodId: string, eventId: string, status: AvailabilityStatus) {
    setSelections(prev => ({
      ...prev,
      [periodId]: {
        ...prev[periodId],
        [eventId]: status,
      },
    }))
  }

  async function handleSubmit(period: SchedulePeriod, events: ScheduleEvent[]) {
    const memberId = user?.multimediaMemberId
    if (!memberId) {
      toast.error("Akun Anda belum terdaftar sebagai anggota tim multimedia.")
      return
    }

    const periodSelections = selections[period.id] ?? {}
    const submissions: AvailabilityEntry[] = events.map(ev => ({
      eventId: ev.id,
      status: periodSelections[ev.id] ?? "AVAILABLE",
    }))

    setSubmitting(prev => ({ ...prev, [period.id]: true }))
    try {
      const res = await fetch("/api/scheduler/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId, submissions }),
      })
      const json = await res.json()
      if (json.success) {
        toast.success("Ketersediaan berhasil disimpan")
        setSubmitted(prev => ({ ...prev, [period.id]: true }))
      } else {
        toast.error(json.message ?? "Gagal menyimpan ketersediaan")
      }
    } catch {
      toast.error("Gagal menyimpan ketersediaan")
    } finally {
      setSubmitting(prev => ({ ...prev, [period.id]: false }))
    }
  }

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
            Isi Ketersediaan
          </h1>
          <p className="text-muted-foreground">Beritahukan ketersediaan Anda untuk jadwal mendatang.</p>
        </div>
        
        <Card className="border-yellow-500/20 bg-yellow-500/[0.03] shadow-lg shadow-yellow-500/5">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-16 w-16 rounded-full bg-yellow-500/10 flex items-center justify-center mb-6 ring-1 ring-yellow-500/20 shadow-sm">
              <AlertCircle className="h-8 w-8 text-yellow-600" />
            </div>
            <h3 className="text-xl font-bold text-yellow-800 dark:text-yellow-500">Akun belum terdaftar</h3>
            <p className="text-muted-foreground max-w-sm mt-2 mb-8 text-sm">
              Akun Anda belum terdaftar sebagai anggota tim multimedia. Hubungi admin multimedia untuk menautkan akun Anda agar dapat mengisi ketersediaan.
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
    <div className="space-y-8 max-w-4xl mx-auto pb-20">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text">
          Isi Ketersediaan
        </h1>
        <p className="text-muted-foreground">Beritahukan ketersediaan Anda untuk periode jadwal mendatang.</p>
      </div>

      {loading ? (
        <div className="space-y-6">
          <Card className="animate-pulse h-64 border-border/40 bg-background/50" />
        </div>
      ) : periodsWithEvents.length === 0 ? (
        <Card className="border-dashed bg-muted/30">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-16 w-16 rounded-full bg-background flex items-center justify-center mb-6 ring-1 ring-border shadow-sm">
              <CalendarIcon className="h-8 w-8 text-muted-foreground/30" />
            </div>
            <p className="text-muted-foreground text-sm font-medium">
              Tidak ada periode yang sedang mengumpulkan ketersediaan saat ini.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-10">
          {periodsWithEvents.map(({ period, events }) => (
            <Card key={period.id} className="overflow-hidden border-border/50 bg-background/40 shadow-xl shadow-primary/5">
              <CardHeader className="border-b bg-muted/30 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <CardTitle className="text-xl font-bold">{period.nama}</CardTitle>
                    {period.deadlineAvailability && (
                      <CardDescription className="flex items-center gap-1.5 font-medium">
                        <Clock className="h-3.5 w-3.5 text-primary/60" />
                        Batas Akhir: {formatDeadline(period.deadlineAvailability)}
                      </CardDescription>
                    )}
                  </div>
                  {submitted[period.id] && (
                    <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 px-3 py-1 rounded-full font-bold uppercase tracking-widest text-[10px]">
                      <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                      Tersimpan
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="p-0">
                {events.length === 0 ? (
                  <div className="py-16 text-center text-muted-foreground text-sm italic">
                    Belum ada event yang didaftarkan untuk periode ini.
                  </div>
                ) : (
                  <div className="divide-y divide-border/40">
                    {events.map((ev) => {
                      const currentStatus = selections[period.id]?.[ev.id] ?? "AVAILABLE"
                      return (
                        <div key={ev.id} className="group p-6 transition-colors hover:bg-muted/20">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-start gap-4">
                              <div className="h-10 w-10 rounded-xl bg-primary/5 border border-primary/10 flex flex-col items-center justify-center shrink-0">
                                <span className="text-[10px] font-bold text-primary/60 uppercase leading-none">{formatDate(ev.tanggal).split(" ")[0].substring(0, 3)}</span>
                                <span className="text-sm font-bold text-primary leading-none mt-0.5">{new Date(ev.tanggal).getDate()}</span>
                              </div>
                              <div className="space-y-1">
                                <p className="font-bold text-sm leading-none">{ev.namaEvent}</p>
                                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                                  <Clock className="h-3 w-3" />
                                  {ev.waktu}
                                </p>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-2 w-full md:w-auto">
                              {STATUS_OPTIONS.map(opt => {
                                const isSelected = currentStatus === opt.value
                                const Icon = opt.icon
                                return (
                                  <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => setStatus(period.id, ev.id, opt.value)}
                                    className={cn(
                                      "flex flex-col md:flex-row items-center justify-center gap-1.5 px-3 py-2.5 md:py-2 text-[10px] md:text-xs font-bold uppercase tracking-wider rounded-xl border transition-all duration-300",
                                      isSelected 
                                        ? cn("scale-[1.02] shadow-lg", opt.activeClass) 
                                        : opt.inactiveClass
                                    )}
                                  >
                                    <Icon className={cn("h-3.5 w-3.5", isSelected ? "animate-in zoom-in-50 duration-300" : "opacity-60")} />
                                    {opt.label}
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>

              <CardFooter className="bg-muted/20 p-6 border-t flex items-center justify-between gap-4">
                <p className="text-xs text-muted-foreground hidden sm:block">
                  Pastikan semua jadwal sudah sesuai sebelum menekan tombol simpan.
                </p>
                <Button
                  className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 h-11 px-8 font-bold w-full sm:w-auto"
                  disabled={submitting[period.id] || events.length === 0}
                  onClick={() => handleSubmit(period, events)}
                >
                  {submitting[period.id] ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                  {submitted[period.id] ? "Perbarui Ketersediaan" : "Kirim Respon"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
