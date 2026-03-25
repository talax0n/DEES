"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { PageHeader } from "@/components/admin/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2 } from "lucide-react"

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

const BULAN_OPTIONS = [
  { value: 1, label: "Januari" },
  { value: 2, label: "Februari" },
  { value: 3, label: "Maret" },
  { value: 4, label: "April" },
  { value: 5, label: "Mei" },
  { value: 6, label: "Juni" },
  { value: 7, label: "Juli" },
  { value: 8, label: "Agustus" },
  { value: 9, label: "September" },
  { value: 10, label: "Oktober" },
  { value: 11, label: "November" },
  { value: 12, label: "Desember" },
]

const currentYear = new Date().getFullYear()

export default function AdminSchedulerPage() {
  const router = useRouter()
  const [periods, setPeriods] = useState<SchedulePeriod[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  // Form state
  const [bulan, setBulan] = useState<string>("")
  const [tahun, setTahun] = useState<string>(String(currentYear))
  const [deadlineAvailability, setDeadlineAvailability] = useState<string>("")
  const [notes, setNotes] = useState<string>("")

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

  useEffect(() => {
    fetchPeriods()
  }, [])

  function openDialog() {
    setBulan("")
    setTahun(String(currentYear))
    setDeadlineAvailability("")
    setNotes("")
    setDialogOpen(true)
  }

  async function handleCreate() {
    if (!bulan) return
    setSaving(true)
    try {
      const body: Record<string, unknown> = {
        bulan: Number(bulan),
        tahun: Number(tahun),
      }
      if (deadlineAvailability) body.deadlineAvailability = deadlineAvailability
      if (notes) body.notes = notes

      const res = await fetch("/api/scheduler/periods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message ?? "Gagal membuat jadwal")
      setDialogOpen(false)
      fetchPeriods()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal membuat jadwal")
    } finally {
      setSaving(false)
    }
  }

  function formatDate(dateStr: string | null) {
    if (!dateStr) return "-"
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Jadwal Tim Multimedia"
        description="Kelola periode jadwal pelayanan tim multimedia"
        action={
          <Button className="bg-navy text-white hover:bg-navy/90" onClick={openDialog}>
            + Buat Jadwal Baru
          </Button>
        }
      />

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

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
      ) : periods.length === 0 ? (
        <div className="rounded-xl border border-border/40 bg-background p-12 text-center shadow-sm">
          <p className="text-muted-foreground text-sm">Belum ada periode jadwal. Buat jadwal baru untuk memulai.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {periods.map((period) => (
            <button
              key={period.id}
              onClick={() => router.push(`/admin/scheduler/${period.id}`)}
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Buat Jadwal Baru</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="bulan">Bulan</Label>
              <Select value={bulan} onValueChange={setBulan}>
                <SelectTrigger id="bulan">
                  <SelectValue placeholder="Pilih bulan..." />
                </SelectTrigger>
                <SelectContent>
                  {BULAN_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={String(opt.value)}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tahun">Tahun</Label>
              <Input
                id="tahun"
                type="number"
                value={tahun}
                onChange={(e) => setTahun(e.target.value)}
                min={2020}
                max={2100}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deadlineAvailability">
                Deadline Ketersediaan <span className="text-muted-foreground">(opsional)</span>
              </Label>
              <Input
                id="deadlineAvailability"
                type="date"
                value={deadlineAvailability}
                onChange={(e) => setDeadlineAvailability(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">
                Catatan <span className="text-muted-foreground">(opsional)</span>
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Catatan untuk periode ini..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
              Batal
            </Button>
            <Button
              type="button"
              className="bg-navy text-white hover:bg-navy/90"
              disabled={saving || !bulan}
              onClick={handleCreate}
            >
              {saving ? "Menyimpan..." : "Buat Jadwal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
