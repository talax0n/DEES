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
import { 
  Loader2, 
  Plus, 
  Calendar as CalendarIcon, 
  Clock, 
  ChevronRight, 
  LayoutDashboard,
  Filter,
  MoreVertical,
  Users as UsersIcon,
  Zap
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/providers/AuthProvider"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type SchedulePeriodStatus = "DRAFT" | "COLLECTING" | "CLOSED" | "REVIEW" | "PUBLISHED"

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
  CLOSED: { label: "Ditutup", class: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20", icon: Filter },
  REVIEW: { label: "Tinjauan", class: "bg-orange-500/10 text-orange-600 border-orange-500/20", icon: LayoutDashboard },
  PUBLISHED: { label: "Diterbitkan", class: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", icon: Zap },
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

export default function MultimediaSchedulesPage() {
  const router = useRouter()
  const { isMultimediaAdmin, isLoading: authLoading } = useAuth()
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

  useEffect(() => {
    if (!authLoading && !isMultimediaAdmin) {
      router.replace("/admin/multimedia")
    }
  }, [authLoading, isMultimediaAdmin, router])

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
    if (authLoading || !isMultimediaAdmin) return
    fetchPeriods()
  }, [authLoading, isMultimediaAdmin])

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

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
      </div>
    )
  }

  if (!isMultimediaAdmin) return null

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text">
            Jadwal Tim Multimedia
          </h1>
          <p className="text-muted-foreground">Kelola periode jadwal pelayanan tim multimedia gereja.</p>
        </div>
        <Button 
          className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 h-11 px-6 font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]" 
          onClick={openDialog}
        >
          <Plus className="mr-2 h-5 w-5" />
          Buat Jadwal Baru
        </Button>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-destructive animate-pulse" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-border/40 bg-background/50 p-6 shadow-sm animate-pulse h-48"
            />
          ))}
        </div>
      ) : periods.length === 0 ? (
        <Card className="border-dashed bg-muted/30">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-16 w-16 rounded-full bg-background flex items-center justify-center mb-6 ring-1 ring-border shadow-sm">
              <CalendarIcon className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <h3 className="text-xl font-bold">Belum ada periode jadwal</h3>
            <p className="text-muted-foreground max-w-sm mt-2 mb-8 text-sm">
              Mulai kelola penugasan multimedia dengan membuat periode jadwal baru untuk bulan mendatang.
            </p>
            <Button onClick={openDialog} className="shadow-lg shadow-primary/10">
              <Plus className="mr-2 h-4 w-4" />
              Buat Jadwal Pertama
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {periods.map((period) => {
            const config = STATUS_CONFIG[period.status]
            const StatusIcon = config.icon

            return (
              <Card 
                key={period.id}
                className="group relative overflow-hidden border-border/50 bg-background/40 hover:bg-background transition-all hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 cursor-pointer"
                onClick={() => router.push(`/admin/multimedia/schedules/${period.id}`)}
              >
                <CardHeader className="p-6 pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <div className={cn("p-1.5 rounded-lg border", config.class)}>
                          <StatusIcon className="h-3.5 w-3.5" />
                        </div>
                        <Badge variant="outline" className={cn("text-[10px] font-bold uppercase tracking-wider px-2 py-0 border-0", config.class)}>
                          {config.label}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors leading-tight pt-1">
                        {period.nama}
                      </CardTitle>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full -mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem onClick={() => router.push(`/admin/multimedia/schedules/${period.id}`)}>
                          Buka Detail
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          Hapus Periode
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                
                <CardContent className="p-6 pt-0 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Total Agenda</p>
                      <p className="text-xl font-bold tabular-nums">
                        {period._count?.events || 0}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Bulan/Tahun</p>
                      <p className="text-xl font-bold tabular-nums">
                        {period.nama.split(" ").slice(-2).join(" ")}
                      </p>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-border/40 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
                      <Clock className="h-3.5 w-3.5" />
                      Deadline: {formatDate(period.deadlineAvailability)}
                    </div>
                    <div className="h-7 w-7 rounded-full bg-accent flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </div>
                </CardContent>
                
                {/* Decorative background element */}
                <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-primary/5 blur-2xl group-hover:bg-primary/10 transition-colors" />
              </Card>
            )
          })}
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
