"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { PageHeader } from "@/components/admin/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  Trash2,
  Plus,
  Download,
  CheckCircle2,
  Circle,
  Clock,
  ChevronRight,
  Calendar as CalendarIcon,
  Users as UsersIcon,
  LayoutDashboard,
  Zap,
  Check
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/providers/AuthProvider"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type MultimediaRole = "SLD" | "SND" | "STR" | "CAM"
type SchedulePeriodStatus = "DRAFT" | "COLLECTING" | "GENERATING" | "REVIEW" | "PUBLISHED"
type AvailabilityStatus = "AVAILABLE" | "UNAVAILABLE" | "MAYBE"

type Member = { id: string; nama: string; roles: MultimediaRole[] }

type Assignment = {
  id: string
  role: MultimediaRole
  member: { id: string; nama: string }
}

type ScheduleEvent = {
  id: string
  namaEvent: string
  tanggal: string
  waktu: string
  kategori: string
  keterangan?: string | null
  isLive: boolean
  requiredRoles: MultimediaRole[]
  assignments: Assignment[]
  _count: { availability: number }
}

type SchedulePeriod = {
  id: string
  nama: string
  bulan: number
  tahun: number
  status: SchedulePeriodStatus
  deadlineAvailability?: string | null
  publishedAt?: string | null
  events: ScheduleEvent[]
}

type AvailabilityRecord = {
  id: string
  memberId: string
  eventId: string
  status: AvailabilityStatus
  note?: string | null
  member: Member
  event: ScheduleEvent
}

const STATUS_STEPS: { status: SchedulePeriodStatus; label: string; description: string }[] = [
  { status: "DRAFT", label: "Draft", description: "Persiapan daftar ibadah" },
  { status: "COLLECTING", label: "Respon", description: "Mengumpulkan ketersediaan tim" },
  { status: "GENERATING", label: "Proses AI", description: "Sistem membuat jadwal otomatis" },
  { status: "REVIEW", label: "Tinjauan", description: "Cek & edit jadwal manual" },
  { status: "PUBLISHED", label: "Selesai", description: "Jadwal sudah dibagikan" },
]

const STATUS_CLASS: Record<SchedulePeriodStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  COLLECTING: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  GENERATING: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  REVIEW: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  PUBLISHED: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
}

const KATEGORI_CLASS: Record<string, string> = {
  "Ibadah Raya": "bg-blue-500/10 text-blue-500 border-blue-500/20",
  "Ibadah Pelkat": "bg-purple-500/10 text-purple-500 border-purple-500/20",
  "Kegiatan Khusus": "bg-orange-500/10 text-orange-500 border-orange-500/20",
  "Katekisasi": "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
}

const ROLE_CLASS: Record<MultimediaRole, string> = {
  SLD: "bg-slate-500/10 text-slate-500 border-slate-500/20",
  SND: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  STR: "bg-rose-500/10 text-rose-500 border-rose-500/20",
  CAM: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
}

const ALL_ROLES: MultimediaRole[] = ["SLD", "SND", "STR", "CAM"]
const ROLE_LABELS: Record<MultimediaRole, string> = {
  SLD: "Operator Slide",
  SND: "Operator Sound",
  STR: "Streamer",
  CAM: "Cameraman",
}
const KATEGORI_OPTIONS = ["Ibadah Raya", "Ibadah Pelkat", "Kegiatan Khusus", "Katekisasi"]

function formatDate(isoString: string) {
  const d = new Date(isoString)
  return d.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" })
}

function groupEventsByDate(events: ScheduleEvent[]): Record<string, ScheduleEvent[]> {
  const groups: Record<string, ScheduleEvent[]> = {}
  for (const ev of events) {
    const key = ev.tanggal.split("T")[0]
    if (!groups[key]) groups[key] = []
    groups[key].push(ev)
  }
  return groups
}

const defaultEventForm = {
  namaEvent: "",
  tanggal: "",
  waktu: "",
  kategori: "Ibadah Raya",
  keterangan: "",
  isLive: false,
  requiredRoles: [] as MultimediaRole[],
}

export default function MultimediaSchedulePeriodPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { isMultimediaAdmin, isLoading: authLoading } = useAuth()

  const [period, setPeriod] = useState<SchedulePeriod | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  // Availability tab state
  const [members, setMembers] = useState<Member[]>([])
  const [availability, setAvailability] = useState<AvailabilityRecord[]>([])
  const [availLoading, setAvailLoading] = useState(false)

  // Add event dialog
  const [addEventOpen, setAddEventOpen] = useState(false)
  const [eventForm, setEventForm] = useState(defaultEventForm)
  const [eventSaving, setEventSaving] = useState(false)

  // Batch import dialog
  const [batchOpen, setBatchOpen] = useState(false)
  const [batchText, setBatchText] = useState("")
  const [batchSaving, setBatchSaving] = useState(false)

  // Assignment dialog
  const [assignDialogEvent, setAssignDialogEvent] = useState<ScheduleEvent | null>(null)
  const [assignMemberId, setAssignMemberId] = useState("")
  const [assignRole, setAssignRole] = useState<MultimediaRole>("SLD")
  const [assignSaving, setAssignSaving] = useState(false)

  useEffect(() => {
    if (!authLoading && !isMultimediaAdmin) {
      router.replace("/admin/multimedia")
    }
  }, [authLoading, isMultimediaAdmin, router])

  async function fetchPeriod() {
    setLoading(true)
    try {
      const res = await fetch(`/api/scheduler/periods/${id}`)
      const json = await res.json()
      if (json.success) setPeriod(json.data)
      else toast.error("Gagal memuat data periode")
    } catch {
      toast.error("Gagal memuat data periode")
    } finally {
      setLoading(false)
    }
  }

  async function fetchAvailabilityData() {
    setAvailLoading(true)
    try {
      const [membersRes, availRes] = await Promise.all([
        fetch("/api/scheduler/members"),
        fetch(`/api/scheduler/availability/${id}`),
      ])
      const [mJson, aJson] = await Promise.all([membersRes.json(), availRes.json()])
      if (mJson.success) setMembers(mJson.data)
      if (aJson.success) setAvailability(aJson.data)
    } catch {
      toast.error("Gagal memuat data ketersediaan")
    } finally {
      setAvailLoading(false)
    }
  }

  useEffect(() => {
    if (authLoading || !isMultimediaAdmin) return
    fetchPeriod()
    // Fetch members on mount so assignment dialog works without visiting Availability tab first
    fetch("/api/scheduler/members")
      .then(r => r.json())
      .then(j => { if (j.success) setMembers(j.data) })
      .catch(() => {})
  }, [id, authLoading, isMultimediaAdmin])

  // Status actions
  async function patchStatus(status: SchedulePeriodStatus, extra?: Record<string, unknown>) {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/scheduler/periods/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, ...extra }),
      })
      const json = await res.json()
      if (json.success) { toast.success("Status berhasil diperbarui"); fetchPeriod() }
      else toast.error(json.message ?? "Gagal memperbarui status")
    } catch {
      toast.error("Gagal memperbarui status")
    } finally {
      setActionLoading(false)
    }
  }

  async function handleGenerate() {
    setActionLoading(true)
    try {
      const res = await fetch("/api/scheduler/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ periodId: id }),
      })
      const json = await res.json()
      if (json.success) { toast.success("Penugasan AI berhasil dibuat"); fetchPeriod() }
      else toast.error(json.message ?? "Gagal membuat penugasan")
    } catch {
      toast.error("Gagal membuat penugasan")
    } finally {
      setActionLoading(false)
    }
  }

  // Add event
  async function handleAddEvent(e: React.FormEvent) {
    e.preventDefault()
    if (eventForm.requiredRoles.length === 0) { toast.error("Pilih minimal 1 role"); return }
    setEventSaving(true)
    try {
      const res = await fetch(`/api/scheduler/periods/${id}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          namaEvent: eventForm.namaEvent,
          tanggal: eventForm.tanggal,
          waktu: eventForm.waktu,
          kategori: eventForm.kategori,
          keterangan: eventForm.keterangan || undefined,
          isLive: eventForm.isLive,
          requiredRoles: eventForm.requiredRoles,
        }),
      })
      const json = await res.json()
      if (json.success) {
        toast.success("Event berhasil ditambahkan")
        setAddEventOpen(false)
        setEventForm(defaultEventForm)
        fetchPeriod()
      } else {
        toast.error(json.message ?? "Gagal menambahkan event")
      }
    } catch {
      toast.error("Gagal menambahkan event")
    } finally {
      setEventSaving(false)
    }
  }

  // Batch import
  function parseBatchText(text: string) {
    return text
      .split("\n")
      .map(line => line.trim())
      .filter(Boolean)
      .map(line => {
        const parts = line.split("|").map(p => p.trim())
        if (parts.length < 4) return null
        const [dateStr, waktu, kategori, rolesStr] = parts
        const roles = rolesStr.toUpperCase().split(/\s+/).filter(r => ALL_ROLES.includes(r as MultimediaRole)) as MultimediaRole[]
        // Parse date like "Minggu, 6 April 2025"
        const dateMatch = dateStr.match(/(\d{1,2})\s+(\w+)\s+(\d{4})/)
        if (!dateMatch || roles.length === 0) return null
        const BULAN: Record<string, string> = {
          Januari: "01", Februari: "02", Maret: "03", April: "04", Mei: "05", Juni: "06",
          Juli: "07", Agustus: "08", September: "09", Oktober: "10", November: "11", Desember: "12",
        }
        const month = BULAN[dateMatch[2]]
        if (!month) return null
        const day = dateMatch[1].padStart(2, "0")
        const year = dateMatch[3]
        return {
          namaEvent: kategori,
          tanggal: `${year}-${month}-${day}`,
          waktu: waktu,
          kategori: kategori,
          isLive: rolesStr.includes("STR"),
          requiredRoles: roles,
        }
      })
      .filter(Boolean)
  }

  async function handleBatchImport() {
    const events = parseBatchText(batchText)
    if (events.length === 0) { toast.error("Tidak ada event valid yang dapat diimpor"); return }
    setBatchSaving(true)
    try {
      const res = await fetch(`/api/scheduler/periods/${id}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(events),
      })
      const json = await res.json()
      if (json.success) {
        toast.success(`${events.length} event berhasil diimpor`)
        setBatchOpen(false)
        setBatchText("")
        fetchPeriod()
      } else {
        toast.error(json.message ?? "Gagal mengimpor event")
      }
    } catch {
      toast.error("Gagal mengimpor event")
    } finally {
      setBatchSaving(false)
    }
  }

  // Delete event
  async function handleDeleteEvent(eventId: string) {
    if (!confirm("Hapus event ini?")) return
    try {
      const res = await fetch(`/api/scheduler/events/${eventId}`, { method: "DELETE" })
      const json = await res.json()
      if (json.success) { toast.success("Event dihapus"); fetchPeriod() }
      else toast.error(json.message ?? "Gagal menghapus event")
    } catch {
      toast.error("Gagal menghapus event")
    }
  }

  // Add assignment
  async function handleAddAssignment() {
    if (!assignDialogEvent || !assignMemberId) return
    setAssignSaving(true)
    try {
      const res = await fetch("/api/scheduler/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignments: [{ eventId: assignDialogEvent.id, memberId: assignMemberId, role: assignRole, isManual: true }],
        }),
      })
      const json = await res.json()
      if (json.success) {
        toast.success("Penugasan berhasil ditambahkan")
        setAssignDialogEvent(null)
        setAssignMemberId("")
        fetchPeriod()
      } else {
        toast.error(json.message ?? "Gagal menambahkan penugasan")
      }
    } catch {
      toast.error("Gagal menambahkan penugasan")
    } finally {
      setAssignSaving(false)
    }
  }

  function toggleRole(role: MultimediaRole) {
    setEventForm(f => ({
      ...f,
      requiredRoles: f.requiredRoles.includes(role)
        ? f.requiredRoles.filter(r => r !== role)
        : [...f.requiredRoles, role],
    }))
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
          <p className="text-sm text-muted-foreground animate-pulse">Menyiapkan data jadwal...</p>
        </div>
      </div>
    )
  }

  if (!isMultimediaAdmin) return null

  if (!period) {
    return (
      <div className="text-center py-24">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
          <CalendarIcon className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground font-medium">Periode tidak ditemukan.</p>
        <Button variant="outline" className="mt-6" onClick={() => router.push("/admin/multimedia/schedules")}>
          <ChevronRight className="mr-2 h-4 w-4 rotate-180" />
          Kembali ke Daftar
        </Button>
      </div>
    )
  }

  const grouped = groupEventsByDate(period.events)
  const sortedDates = Object.keys(grouped).sort()
  const currentStepIndex = STATUS_STEPS.findIndex(s => s.status === period.status)

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20">
      {/* Back & Title Section */}
      <div className="flex flex-col gap-6">
        <div>
          <button
            onClick={() => router.push("/admin/multimedia/schedules")}
            className="group mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full border border-border bg-background transition-colors group-hover:border-foreground/20 group-hover:bg-accent">
              <ChevronRight className="h-3 w-3 rotate-180" />
            </div>
            Kembali ke Daftar Jadwal
          </button>
          
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text">
                  {period.nama}
                </h1>
                <Badge variant="outline" className={cn("px-2.5 py-0.5 rounded-full font-medium border-0", STATUS_CLASS[period.status])}>
                  {period.status === "GENERATING" && <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />}
                  {STATUS_STEPS[currentStepIndex]?.label || period.status}
                </Badge>
              </div>
              <p className="text-muted-foreground max-w-2xl">
                Periode penugasan multimedia untuk bulan {new Date(period.tahun, period.bulan - 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {period.status === "DRAFT" && (
                <Button 
                  onClick={() => patchStatus("COLLECTING")} 
                  disabled={actionLoading}
                  className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                >
                  {actionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UsersIcon className="mr-2 h-4 w-4" />}
                  Buka Ketersediaan
                </Button>
              )}
              {period.status === "COLLECTING" && (
                <Button 
                  onClick={handleGenerate} 
                  disabled={actionLoading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20"
                >
                  {actionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4 fill-current" />}
                  Generate Jadwal AI
                </Button>
              )}
              {period.status === "REVIEW" && (
                <Button 
                  onClick={() => patchStatus("PUBLISHED", { publishedAt: new Date().toISOString() })} 
                  disabled={actionLoading}
                  className="bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/20"
                >
                  {actionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                  Publish Jadwal
                </Button>
              )}
              {period.status === "PUBLISHED" && (
                <Button 
                  variant="outline" 
                  asChild
                  className="bg-background/50 backdrop-blur-sm border-border/50 hover:bg-accent transition-all"
                >
                  <a href={`/api/scheduler/periods/${id}/export`} target="_blank" rel="noreferrer">
                    <Download className="mr-2 h-4 w-4" />
                    Unduh PDF
                  </a>
                </Button>
              )}
              
              <div className="h-8 w-[1px] bg-border/60 mx-1 hidden sm:block" />
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                onClick={() => {
                  if (confirm("Hapus seluruh periode jadwal ini?")) {
                    // Logic to delete period
                  }
                }}
              >
                <Trash2 className="h-4.5 w-4.5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Workflow Stepper */}
        <div className="relative">
          <div className="absolute top-5 left-0 w-full h-0.5 bg-border -z-10 hidden md:block" />
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {STATUS_STEPS.map((step, idx) => {
              const isCompleted = idx < currentStepIndex || period.status === "PUBLISHED"
              const isActive = idx === currentStepIndex
              const isLocked = idx > currentStepIndex && period.status !== "PUBLISHED"

              return (
                <div key={step.status} className="flex flex-col items-center md:items-start text-center md:text-left space-y-2">
                  <div className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 bg-background",
                    isCompleted ? "border-green-500 bg-green-500/10 text-green-500" :
                    isActive ? "border-primary bg-primary/5 text-primary ring-4 ring-primary/10" :
                    "border-muted text-muted-foreground"
                  )}>
                    {isCompleted ? <Check className="h-5 w-5" /> : 
                     isActive ? (step.status === "GENERATING" ? <Loader2 className="h-5 w-5 animate-spin" /> : <Clock className="h-5 w-5" />) : 
                     <span className="text-xs font-bold">{idx + 1}</span>}
                  </div>
                  <div className="space-y-0.5">
                    <p className={cn("text-xs font-bold uppercase tracking-wider", isActive ? "text-primary" : "text-muted-foreground")}>
                      {step.label}
                    </p>
                    <p className="text-[10px] text-muted-foreground leading-tight hidden sm:block max-w-[120px]">
                      {step.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <Tabs defaultValue="events" className="w-full">
        <div className="flex items-center justify-between border-b pb-0 mb-6 overflow-x-auto no-scrollbar">
          <TabsList className="h-auto p-0 bg-transparent gap-6">
            <TabsTrigger 
              value="events" 
              className="relative h-10 rounded-none border-b-2 border-transparent bg-transparent px-2 pb-3 pt-2 font-semibold text-muted-foreground transition-none data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
            >
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Daftar Ibadah
              {period.events.length > 0 && (
                <span className="ml-2 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-bold">
                  {period.events.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="availability" 
              onClick={() => { if (availability.length === 0) fetchAvailabilityData() }}
              className="relative h-10 rounded-none border-b-2 border-transparent bg-transparent px-2 pb-3 pt-2 font-semibold text-muted-foreground transition-none data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
            >
              <UsersIcon className="mr-2 h-4 w-4" />
              Ketersediaan Tim
            </TabsTrigger>
            <TabsTrigger 
              value="assignments" 
              className="relative h-10 rounded-none border-b-2 border-transparent bg-transparent px-2 pb-3 pt-2 font-semibold text-muted-foreground transition-none data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              Matriks Penugasan
            </TabsTrigger>
          </TabsList>
        </div>

        {/* TAB 1: Events */}
        <TabsContent value="events" className="space-y-6 outline-none">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight">Agenda Ibadah</h2>
              <p className="text-sm text-muted-foreground">Kelola daftar ibadah dan peran yang dibutuhkan.</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button size="sm" variant="outline" onClick={() => setBatchOpen(true)} className="h-9">
                Batch Import
              </Button>
              <Button size="sm" onClick={() => setAddEventOpen(true)} className="h-9">
                <Plus className="mr-2 h-4 w-4" />
                Tambah Event
              </Button>
            </div>
          </div>

          {period.events.length === 0 ? (
            <Card className="border-dashed bg-muted/30">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="h-12 w-12 rounded-full bg-background flex items-center justify-center mb-4 ring-1 ring-border">
                  <CalendarIcon className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold">Belum ada agenda</h3>
                <p className="text-sm text-muted-foreground max-w-sm mb-6">
                  Mulai dengan menambahkan event secara manual atau gunakan fitur Batch Import untuk memproses banyak agenda sekaligus.
                </p>
                <div className="flex gap-3">
                  <Button variant="outline" size="sm" onClick={() => setBatchOpen(true)}>Batch Import</Button>
                  <Button size="sm" onClick={() => setAddEventOpen(true)}>Tambah Event</Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Event Timeline */}
              <div className="lg:col-span-8 space-y-8">
                {sortedDates.map(date => (
                  <div key={date} className="relative pl-6 border-l-2 border-muted/50 last:border-0 pb-2">
                    <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full border-4 border-background bg-muted" />
                    <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                      {formatDate(date + "T00:00:00")}
                      <span className="h-[1px] flex-1 bg-border/40" />
                    </h3>
                    
                    <div className="grid gap-3">
                      {grouped[date].map((ev) => (
                        <div
                          key={ev.id}
                          className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-border/50 bg-background/50 p-4 transition-all hover:border-foreground/10 hover:bg-accent/5 hover:shadow-sm"
                        >
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-bold tabular-nums text-foreground/80">{ev.waktu}</span>
                              <div className="h-3 w-[1px] bg-border" />
                              <span className="font-semibold text-sm">{ev.namaEvent}</span>
                              <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 rounded-md border", KATEGORI_CLASS[ev.kategori])}>
                                {ev.kategori}
                              </Badge>
                              {ev.isLive && (
                                <Badge variant="destructive" className="text-[10px] px-1.5 py-0 rounded-md bg-rose-500/10 text-rose-500 border-rose-500/20">
                                  LIVE
                                </Badge>
                              )}
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-2">
                              {ev.requiredRoles.map(r => (
                                <span key={r} className={cn("text-[10px] font-bold uppercase tracking-tighter px-1.5 py-0.5 rounded border leading-none", ROLE_CLASS[r])}>
                                  {r}
                                </span>
                              ))}
                              {ev._count.availability > 0 && (
                                <span className="text-[11px] text-muted-foreground flex items-center gap-1 ml-1">
                                  <UsersIcon className="h-3 w-3" />
                                  {ev._count.availability} Respon
                                </span>
                              )}
                            </div>
                            
                            {ev.keterangan && (
                              <p className="text-xs text-muted-foreground line-clamp-1 italic">{ev.keterangan}</p>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 self-end sm:self-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 rounded-full hover:bg-background shadow-sm ring-1 ring-border/50"
                              onClick={() => {
                                // Edit logic
                              }}
                            >
                              <Plus className="h-3.5 w-3.5 rotate-45" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              onClick={() => handleDeleteEvent(ev.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary Stats / Tips */}
              <div className="lg:col-span-4 space-y-6">
                <Card className="bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border-indigo-500/10">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Zap className="h-4 w-4 text-indigo-500" />
                      Ringkasan Periode
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Total Ibadah</p>
                        <p className="text-2xl font-bold">{period.events.length}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Live Streams</p>
                        <p className="text-2xl font-bold text-rose-500">{period.events.filter(e => e.isLive).length}</p>
                      </div>
                    </div>
                    
                    <div className="pt-2 space-y-2 border-t border-indigo-500/10">
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Tips: Gunakan <strong>Batch Import</strong> untuk mempercepat input agenda bulanan dari Warta Jemaat atau jadwal tahunan.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-accent/50 border-border/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold">Butuh Bantuan?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-xs space-y-2 text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <Check className="h-3 w-3 mt-0.5 text-primary" />
                        Lengkapi semua daftar ibadah sebelum membuka ketersediaan.
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-3 w-3 mt-0.5 text-primary" />
                        Pastikan setiap ibadah memiliki minimal satu role yang dibutuhkan.
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-3 w-3 mt-0.5 text-primary" />
                        AI akan memprioritaskan anggota yang tersedia dan belum sering bertugas.
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </TabsContent>

        {/* TAB 2: Availability */}
        <TabsContent value="availability" className="outline-none">
          <Card className="border-border/50 bg-background/50 overflow-hidden">
            <CardHeader className="border-b bg-muted/30">
              <CardTitle className="text-lg font-bold tracking-tight">Status Respon Tim</CardTitle>
              <CardDescription>Respon ketersediaan anggota multimedia untuk periode ini.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {availLoading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary/20" />
                  <p className="text-xs text-muted-foreground animate-pulse">Memuat data respon...</p>
                </div>
              ) : period.events.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">Belum ada event untuk ditampilkan.</div>
              ) : (
                <>
                  <div className="flex items-center gap-4 text-xs p-4 border-b bg-muted/10">
                    <div className="flex items-center gap-1.5 font-medium text-muted-foreground mr-2">Legenda:</div>
                    <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-green-500" /> Tersedia</div>
                    <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-500" /> Tidak Bisa</div>
                    <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-yellow-500" /> Ragu</div>
                  </div>
                  <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="bg-muted/10">
                        <th className="sticky left-0 z-10 bg-background border-b border-r p-4 font-bold min-w-[200px]">Agenda Ibadah</th>
                        {members.map(m => (
                          <th key={m.id} className="border-b border-r p-3 font-bold text-center min-w-[100px] whitespace-nowrap">
                            {m.nama}
                            <div className="text-[9px] font-normal text-muted-foreground uppercase tracking-wider mt-1">
                              {m.roles.join(", ")}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {period.events.map((ev, i) => {
                        const avMap: Record<string, AvailabilityStatus> = {}
                        availability.filter(a => a.eventId === ev.id).forEach(a => { avMap[a.memberId] = a.status })
                        return (
                          <tr key={ev.id} className="group hover:bg-muted/30 transition-colors">
                            <td className="sticky left-0 z-10 bg-background group-hover:bg-muted/30 border-b border-r p-4 transition-colors">
                              <div className="font-bold text-foreground/90">{ev.namaEvent}</div>
                              <div className="text-[10px] text-muted-foreground mt-0.5">{formatDate(ev.tanggal)} · {ev.waktu}</div>
                            </td>
                            {members.map(m => {
                              const s = avMap[m.id]
                              return (
                                <td key={m.id} className="border-b border-r p-2 text-center align-middle">
                                  <div className="flex justify-center">
                                    {s === "AVAILABLE" && (
                                      <div className="h-6 w-6 rounded-full bg-green-500/10 text-green-600 flex items-center justify-center shadow-sm ring-1 ring-green-500/20">
                                        <Check className="h-3.5 w-3.5" />
                                      </div>
                                    )}
                                    {s === "UNAVAILABLE" && (
                                      <div className="h-6 w-6 rounded-full bg-rose-500/10 text-rose-600 flex items-center justify-center shadow-sm ring-1 ring-rose-500/20">
                                        <Plus className="h-3.5 w-3.5 rotate-45" />
                                      </div>
                                    )}
                                    {s === "MAYBE" && (
                                      <div className="h-6 w-6 rounded-full bg-yellow-500/10 text-yellow-600 flex items-center justify-center shadow-sm ring-1 ring-yellow-500/20 text-xs font-bold">
                                        ~
                                      </div>
                                    )}
                                    {!s && <span className="text-muted-foreground/30">—</span>}
                                  </div>
                                </td>
                              )
                            })}
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                  {members.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 gap-2 border-t">
                      <UsersIcon className="h-8 w-8 text-muted-foreground/30" />
                      <p className="text-sm text-muted-foreground font-medium">Belum ada anggota terdaftar.</p>
                      <Button variant="outline" size="sm" onClick={() => router.push("/admin/multimedia/members")}>Kelola Tim</Button>
                    </div>
                  )}
                </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: Assignments */}
        <TabsContent value="assignments" className="outline-none">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {period.events.length === 0 ? (
              <div className="md:col-span-2 xl:col-span-3 text-center py-16 text-muted-foreground bg-muted/30 rounded-xl border border-dashed">
                Belum ada event.
              </div>
            ) : (
              period.events.map(ev => (
                <Card key={ev.id} className="group overflow-hidden border-border/50 bg-background/50 hover:border-primary/20 transition-all hover:shadow-md">
                  <CardHeader className="p-4 border-b bg-muted/30 group-hover:bg-accent/5 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <CardTitle className="text-sm font-bold line-clamp-1">{ev.namaEvent}</CardTitle>
                        <CardDescription className="text-[10px] flex items-center gap-1 font-medium">
                          <CalendarIcon className="h-3 w-3" />
                          {formatDate(ev.tanggal)} · {ev.waktu}
                        </CardDescription>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 rounded-full border bg-background/50 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => {
                          setAssignDialogEvent(ev)
                          setAssignMemberId("")
                          setAssignRole("SLD")
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    <div className="grid grid-cols-1 gap-2">
                      {ALL_ROLES.filter(role => ev.requiredRoles.includes(role)).map(role => {
                        const assignment = ev.assignments.find(a => a.role === role)
                        return (
                          <div key={role} className="flex items-center justify-between gap-3 text-xs p-2 rounded-lg border border-border/40 bg-muted/20">
                            <div className="flex items-center gap-2">
                              <span className={cn("text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border leading-none shrink-0", ROLE_CLASS[role])}>
                                {role}
                              </span>
                              <span className="font-bold text-muted-foreground/80">{ROLE_LABELS[role]}</span>
                            </div>
                            
                            {assignment ? (
                              <div className="flex items-center gap-2 bg-background border px-2 py-0.5 rounded-full shadow-sm">
                                <span className="font-semibold text-foreground/90">{assignment.member.nama}</span>
                                <button className="text-muted-foreground hover:text-destructive transition-colors">
                                  <Plus className="h-3 w-3 rotate-45" />
                                </button>
                              </div>
                            ) : (
                              <span className="text-[10px] italic text-muted-foreground/60">Belum diisi</span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Event Dialog */}
      <Dialog open={addEventOpen} onOpenChange={setAddEventOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Tambah Event</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddEvent} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="namaEvent">Nama Event</Label>
              <Input
                id="namaEvent"
                value={eventForm.namaEvent}
                onChange={e => setEventForm(f => ({ ...f, namaEvent: e.target.value }))}
                placeholder="Ibadah Raya Minggu"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="tanggal">Tanggal</Label>
                <Input
                  id="tanggal"
                  type="date"
                  value={eventForm.tanggal}
                  onChange={e => setEventForm(f => ({ ...f, tanggal: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="waktu">Waktu</Label>
                <Input
                  id="waktu"
                  value={eventForm.waktu}
                  onChange={e => setEventForm(f => ({ ...f, waktu: e.target.value }))}
                  placeholder="09.00 WIB"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Kategori</Label>
              <Select
                value={eventForm.kategori}
                onValueChange={v => setEventForm(f => ({ ...f, kategori: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {KATEGORI_OPTIONS.map(k => (
                    <SelectItem key={k} value={k}>{k}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="keterangan">Keterangan (opsional)</Label>
              <Input
                id="keterangan"
                value={eventForm.keterangan}
                onChange={e => setEventForm(f => ({ ...f, keterangan: e.target.value }))}
                placeholder="Setup Monitor di Konsistori"
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch
                id="isLive"
                checked={eventForm.isLive}
                onCheckedChange={v => setEventForm(f => ({ ...f, isLive: v }))}
              />
              <Label htmlFor="isLive">Live Streaming</Label>
            </div>
            <div className="space-y-2">
              <Label>Role yang Dibutuhkan</Label>
              <div className="flex gap-3 flex-wrap">
                {ALL_ROLES.map(role => (
                  <label key={role} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={eventForm.requiredRoles.includes(role)}
                      onChange={() => toggleRole(role)}
                      className="rounded"
                    />
                    <span className={cn("text-xs rounded px-1.5 py-0.5 font-mono", ROLE_CLASS[role])}>{role}</span>
                    <span className="text-xs text-muted-foreground">{ROLE_LABELS[role]}</span>
                  </label>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddEventOpen(false)}>Batal</Button>
              <Button type="submit" disabled={eventSaving}>
                {eventSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Tambah
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Batch Import Dialog */}
      <Dialog open={batchOpen} onOpenChange={setBatchOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Batch Import Event</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Satu event per baris. Format: <code className="bg-muted px-1 rounded text-xs">Hari, D Bulan YYYY | HH.MM WIB | Kategori | ROLES</code>
            </p>
            <p className="text-xs text-muted-foreground bg-muted/50 rounded p-2 font-mono">
              Minggu, 6 April 2025 | 06.00 WIB | Ibadah Raya | SLD SND STR{"\n"}
              Minggu, 6 April 2025 | 09.00 WIB | Ibadah Raya | SLD SND STR CAM
            </p>
            <Textarea
              rows={8}
              value={batchText}
              onChange={e => setBatchText(e.target.value)}
              placeholder="Tempel daftar event di sini..."
              className="font-mono text-xs"
            />
            <p className="text-xs text-muted-foreground">
              Terdeteksi: <strong>{parseBatchText(batchText).length}</strong> event valid
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBatchOpen(false)}>Batal</Button>
            <Button onClick={handleBatchImport} disabled={batchSaving || parseBatchText(batchText).length === 0}>
              {batchSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Import {parseBatchText(batchText).length} Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Assignment Dialog */}
      <Dialog open={!!assignDialogEvent} onOpenChange={open => { if (!open) setAssignDialogEvent(null) }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Tambah Penugasan</DialogTitle>
          </DialogHeader>
          {assignDialogEvent && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {assignDialogEvent.namaEvent} · {assignDialogEvent.waktu}
              </p>
              <div className="space-y-2">
                <Label>Anggota</Label>
                <Select value={assignMemberId} onValueChange={setAssignMemberId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih anggota..." />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map(m => (
                      <SelectItem key={m.id} value={m.id}>{m.nama}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={assignRole} onValueChange={v => setAssignRole(v as MultimediaRole)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ALL_ROLES.map(r => (
                      <SelectItem key={r} value={r}>{r} — {ROLE_LABELS[r]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialogEvent(null)}>Batal</Button>
            <Button onClick={handleAddAssignment} disabled={assignSaving || !assignMemberId}>
              {assignSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
