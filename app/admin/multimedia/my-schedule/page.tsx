"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { PageHeader } from "@/components/admin/PageHeader"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/providers/AuthProvider"
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
  SLD: "bg-slate-100 text-slate-700",
  SND: "bg-blue-100 text-blue-700",
  STR: "bg-red-100 text-red-700",
  CAM: "bg-green-100 text-green-700",
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
    year: "numeric",
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
          title="Jadwal Saya"
          description="Jadwal pelayanan Anda yang sudah diterbitkan"
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
        title="Jadwal Saya"
        description="Jadwal pelayanan Anda yang sudah diterbitkan"
      />

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : schedules.length === 0 ? (
        <div className="rounded-xl border border-border/40 bg-background p-12 text-center shadow-sm">
          <p className="text-muted-foreground text-sm">
            Belum ada jadwal yang diterbitkan untuk Anda.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {schedules.map(({ period, assignments }) => (
            <div key={period.id} className="rounded-xl border border-border/40 bg-background shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b bg-muted/30">
                <h2 className="font-semibold text-lg">{period.nama}</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {BULAN_NAMES[period.bulan]} {period.tahun} · {assignments.length} penugasan
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/20 border-b">
                      <th className="text-left px-4 py-3 font-medium">Tanggal</th>
                      <th className="text-left px-4 py-3 font-medium">Nama Event</th>
                      <th className="text-left px-4 py-3 font-medium">Waktu</th>
                      <th className="text-left px-4 py-3 font-medium">Role</th>
                      <th className="text-left px-4 py-3 font-medium">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignments.map((a, i) => (
                      <tr key={a.id} className={cn("border-b last:border-0", i % 2 === 1 && "bg-muted/10")}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          {formatDate(a.event.tanggal)}
                        </td>
                        <td className="px-4 py-3 font-medium">{a.event.namaEvent}</td>
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{a.event.waktu}</td>
                        <td className="px-4 py-3">
                          <span
                            className={cn("text-xs rounded px-1.5 py-0.5 font-mono", ROLE_CLASS[a.role])}
                            title={ROLE_LABELS[a.role]}
                          >
                            {a.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-sm">
                          {a.event.keterangan ?? "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
