"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { PageHeader } from "@/components/admin/PageHeader"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/components/providers/AuthProvider"

type SchedulePeriodStatus = "DRAFT" | "COLLECTING" | "GENERATING" | "REVIEW" | "PUBLISHED"

type SchedulePeriod = {
  id: string
  nama: string
  status: SchedulePeriodStatus
  deadlineAvailability: string | null
  _count?: { events: number }
}

const STATUS_LABEL: Record<SchedulePeriodStatus, string> = {
  DRAFT: "Draft",
  COLLECTING: "Mengumpulkan",
  GENERATING: "Membuat Jadwal",
  REVIEW: "Tinjauan",
  PUBLISHED: "Diterbitkan",
}

const STATUS_CLASS: Record<SchedulePeriodStatus, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  COLLECTING: "bg-blue-100 text-blue-700",
  GENERATING: "bg-yellow-100 text-yellow-700",
  REVIEW: "bg-orange-100 text-orange-700",
  PUBLISHED: "bg-green-100 text-green-700",
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "-"
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export default function MultimediaDashboardPage() {
  const router = useRouter()
  const { hasMultimediaAccess, isMultimediaAdmin, isLoading: authLoading } = useAuth()
  const [periods, setPeriods] = useState<SchedulePeriod[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log("authLoading", authLoading, "hasMultimediaAccess", hasMultimediaAccess)
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
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!hasMultimediaAccess) return null

  // Admin view
  if (isMultimediaAdmin) {
    const recentPeriods = periods.slice(0, 5)

    return (
      <div className="space-y-6">
        <PageHeader
          title="Dashboard Multimedia"
          description="Kelola jadwal dan tim multimedia gereja"
          action={
            <div className="flex gap-2">
              <Button asChild variant="outline">
                <Link href="/admin/multimedia/members">Kelola Anggota</Link>
              </Button>
              <Button className="bg-navy text-white hover:bg-navy/90" asChild>
                <Link href="/admin/multimedia/schedules">Buat Jadwal Baru</Link>
              </Button>
            </div>
          }
        />

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Stats row */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-border/40 bg-background p-5 shadow-sm">
            <p className="text-sm text-muted-foreground mb-1">Total Periode Jadwal</p>
            <p className="text-3xl font-bold">{loading ? "—" : periods.length}</p>
            <Link href="/admin/multimedia/schedules" className="text-xs text-primary hover:underline mt-1 inline-block">
              Lihat semua →
            </Link>
          </div>
          <div className="rounded-xl border border-border/40 bg-background p-5 shadow-sm">
            <p className="text-sm text-muted-foreground mb-1">Anggota Tim</p>
            <p className="text-3xl font-bold">—</p>
            <Link href="/admin/multimedia/members" className="text-xs text-primary hover:underline mt-1 inline-block">
              Kelola anggota →
            </Link>
          </div>
        </div>

        {/* Recent periods */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold">Periode Jadwal Terkini</h2>
            <Link href="/admin/multimedia/schedules" className="text-xs text-primary hover:underline">
              Lihat semua
            </Link>
          </div>

          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-border/40 bg-background p-5 shadow-sm animate-pulse"
                >
                  <div className="h-5 w-1/2 rounded bg-muted mb-3" />
                  <div className="h-4 w-1/4 rounded bg-muted mb-4" />
                  <div className="h-3 w-3/4 rounded bg-muted" />
                </div>
              ))}
            </div>
          ) : recentPeriods.length === 0 ? (
            <div className="rounded-xl border border-border/40 bg-background p-12 text-center shadow-sm">
              <p className="text-muted-foreground text-sm">Belum ada periode jadwal.</p>
              <Button className="mt-4 bg-navy text-white hover:bg-navy/90" asChild>
                <Link href="/admin/multimedia/schedules">Buat Jadwal Baru</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recentPeriods.map((period) => (
                <button
                  key={period.id}
                  onClick={() => router.push(`/admin/multimedia/schedules/${period.id}`)}
                  className="group rounded-xl border border-border/40 bg-background p-5 shadow-sm text-left transition-all hover:shadow-md hover:border-primary/30 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h3 className="font-semibold text-foreground text-base leading-tight group-hover:text-primary transition-colors">
                      {period.nama}
                    </h3>
                    <span
                      className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_CLASS[period.status]}`}
                    >
                      {period.status === "GENERATING" && (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      )}
                      {STATUS_LABEL[period.status]}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Deadline ketersediaan: {formatDate(period.deadlineAvailability)}
                  </p>
                  {period._count !== undefined && (
                    <p className="text-xs text-muted-foreground">
                      {period._count.events} event
                    </p>
                  )}
                </button>
              ))}
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
    <div className="space-y-6">
      <PageHeader
        title="Dashboard Multimedia"
        description="Jadwal pelayanan dan ketersediaan Anda"
      />

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Availability request cards */}
          {collectingPeriods.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Permintaan Ketersediaan
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {collectingPeriods.map(period => (
                  <div
                    key={period.id}
                    className="rounded-xl border border-blue-200 bg-blue-50 p-5"
                  >
                    <h3 className="font-semibold text-base mb-1">{period.nama}</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Deadline: {formatDate(period.deadlineAvailability)}
                    </p>
                    <Button className="bg-navy text-white hover:bg-navy/90 w-full sm:w-auto" asChild>
                      <Link href="/admin/multimedia/availability">Isi Sekarang</Link>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Published schedule */}
          {publishedPeriods.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Jadwal Anda
              </h2>
              <div className="rounded-xl border border-green-200 bg-green-50 p-5">
                <p className="text-sm mb-4">
                  Jadwal untuk{" "}
                  <strong>{publishedPeriods.map(p => p.nama).join(", ")}</strong>{" "}
                  sudah tersedia.
                </p>
                <Button variant="outline" asChild>
                  <Link href="/admin/multimedia/my-schedule">Lihat Jadwal Saya</Link>
                </Button>
              </div>
            </div>
          )}

          {collectingPeriods.length === 0 && publishedPeriods.length === 0 && (
            <div className="rounded-xl border border-border/40 bg-background p-12 text-center shadow-sm">
              <p className="text-muted-foreground text-sm">
                Belum ada jadwal aktif saat ini. Tunggu informasi dari admin.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
