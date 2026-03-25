"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { PageHeader } from "@/components/admin/PageHeader"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/providers/AuthProvider"

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
  baseClass: string
  activeClass: string
}[] = [
  {
    value: "AVAILABLE",
    label: "Bisa",
    baseClass: "border-green-300 bg-green-50 text-green-700 hover:bg-green-100",
    activeClass: "border-green-500 bg-green-500 text-white",
  },
  {
    value: "MAYBE",
    label: "Mungkin",
    baseClass: "border-yellow-300 bg-yellow-50 text-yellow-700 hover:bg-yellow-100",
    activeClass: "border-yellow-500 bg-yellow-500 text-white",
  },
  {
    value: "UNAVAILABLE",
    label: "Tidak Bisa",
    baseClass: "border-red-300 bg-red-50 text-red-700 hover:bg-red-100",
    activeClass: "border-red-500 bg-red-500 text-white",
  },
]

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
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
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!hasMultimediaAccess) return null

  // No member linked
  if (!user?.multimediaMemberId) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Isi Ketersediaan"
          description="Beritahukan ketersediaan Anda untuk periode jadwal mendatang"
        />
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-8 text-center">
          <p className="text-yellow-800 font-medium mb-2">Akun belum terdaftar sebagai anggota</p>
          <p className="text-sm text-yellow-700">
            Akun Anda belum terdaftar sebagai anggota tim multimedia. Hubungi admin untuk menautkan akun Anda.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Isi Ketersediaan"
        description="Beritahukan ketersediaan Anda untuk periode jadwal mendatang"
      />

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : periodsWithEvents.length === 0 ? (
        <div className="rounded-xl border border-border/40 bg-background p-12 text-center shadow-sm">
          <p className="text-muted-foreground text-sm">
            Tidak ada periode yang sedang mengumpulkan ketersediaan saat ini.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {periodsWithEvents.map(({ period, events }) => (
            <div key={period.id} className="rounded-xl border border-border/40 bg-background shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b bg-muted/30">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-semibold text-lg">{period.nama}</h2>
                    {period.deadlineAvailability && (
                      <p className="text-sm text-muted-foreground mt-0.5">
                        Deadline: {formatDeadline(period.deadlineAvailability)}
                      </p>
                    )}
                  </div>
                  {submitted[period.id] && (
                    <span className="text-xs text-green-600 font-medium bg-green-100 px-3 py-1 rounded-full">
                      Tersimpan
                    </span>
                  )}
                </div>
              </div>

              {events.length === 0 ? (
                <div className="px-6 py-8 text-center text-muted-foreground text-sm">
                  Belum ada event untuk periode ini.
                </div>
              ) : (
                <div className="divide-y">
                  {events.map(ev => {
                    const currentStatus = selections[period.id]?.[ev.id] ?? "AVAILABLE"
                    return (
                      <div key={ev.id} className="px-6 py-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div>
                            <p className="font-medium text-sm">{ev.namaEvent}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {formatDate(ev.tanggal)} · {ev.waktu}
                            </p>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            {STATUS_OPTIONS.map(opt => {
                              const isSelected = currentStatus === opt.value
                              return (
                                <button
                                  key={opt.value}
                                  type="button"
                                  onClick={() => setStatus(period.id, ev.id, opt.value)}
                                  className={cn(
                                    "px-3 py-1.5 text-xs font-medium rounded-full border transition-colors",
                                    isSelected ? opt.activeClass : opt.baseClass
                                  )}
                                >
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

              <div className="px-6 py-4 border-t bg-muted/20 flex justify-end">
                <Button
                  className="bg-navy text-white hover:bg-navy/90"
                  disabled={submitting[period.id] || events.length === 0}
                  onClick={() => handleSubmit(period, events)}
                >
                  {submitting[period.id] && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {submitted[period.id] ? "Perbarui Ketersediaan" : "Simpan Ketersediaan"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
