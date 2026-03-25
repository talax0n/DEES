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
import { Loader2, Trash2, Plus, Download } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/providers/AuthProvider"

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

const STATUS_LABEL: Record<SchedulePeriodStatus, string> = {
  DRAFT: "Draft",
  COLLECTING: "Mengumpulkan",
  GENERATING: "Membuat Jadwal",
  REVIEW: "Tinjauan",
  PUBLISHED: "Diterbitkan",
}

const STATUS_CLASS: Record<SchedulePeriodStatus, string> = {
  DRAFT: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  COLLECTING: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  GENERATING: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  REVIEW: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  PUBLISHED: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
}

const KATEGORI_CLASS: Record<string, string> = {
  "Ibadah Raya": "bg-blue-100 text-blue-700",
  "Ibadah Pelkat": "bg-purple-100 text-purple-700",
  "Kegiatan Khusus": "bg-orange-100 text-orange-700",
  "Katekisasi": "bg-teal-100 text-teal-700",
}

const ROLE_CLASS: Record<MultimediaRole, string> = {
  SLD: "bg-slate-100 text-slate-700",
  SND: "bg-blue-100 text-blue-700",
  STR: "bg-red-100 text-red-700",
  CAM: "bg-green-100 text-green-700",
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
  return d.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
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
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!isMultimediaAdmin) return null

  if (!period) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Periode tidak ditemukan.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/admin/multimedia/schedules")}>
          Kembali
        </Button>
      </div>
    )
  }

  const grouped = groupEventsByDate(period.events)
  const sortedDates = Object.keys(grouped).sort()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <button
            onClick={() => router.push("/admin/multimedia/schedules")}
            className="text-xs text-muted-foreground hover:text-foreground mb-1 inline-flex items-center gap-1"
          >
            ← Kembali ke Jadwal
          </button>
          <PageHeader
            title={period.nama}
            description={`Kelola jadwal dan penugasan tim multimedia`}
          />
          <div className="flex items-center gap-2 ml-0">
            {period.status === "GENERATING" ? (
              <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium", STATUS_CLASS[period.status])}>
                <Loader2 className="h-3 w-3 animate-spin" />
                {STATUS_LABEL[period.status]}
              </span>
            ) : (
              <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", STATUS_CLASS[period.status])}>
                {STATUS_LABEL[period.status]}
              </span>
            )}
          </div>
        </div>

        {/* Status actions */}
        <div className="flex items-center gap-2 shrink-0">
          {period.status === "DRAFT" && (
            <Button onClick={() => patchStatus("COLLECTING")} disabled={actionLoading}>
              {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Buka Ketersediaan
            </Button>
          )}
          {period.status === "COLLECTING" && (
            <Button onClick={handleGenerate} disabled={actionLoading}>
              {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Generate Jadwal AI
            </Button>
          )}
          {period.status === "REVIEW" && (
            <Button onClick={() => patchStatus("PUBLISHED", { publishedAt: new Date().toISOString() })} disabled={actionLoading}>
              {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Publish Jadwal
            </Button>
          )}
          {period.status === "PUBLISHED" && (
            <Button variant="outline" asChild>
              <a href={`/api/scheduler/periods/${id}/export`} target="_blank" rel="noreferrer">
                <Download className="mr-2 h-4 w-4" />
                Unduh PDF
              </a>
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="events">
        <TabsList>
          <TabsTrigger value="events">Daftar Ibadah ({period.events.length})</TabsTrigger>
          <TabsTrigger value="availability" onClick={() => { if (availability.length === 0) fetchAvailabilityData() }}>
            Ketersediaan
          </TabsTrigger>
          <TabsTrigger value="assignments">Penugasan</TabsTrigger>
        </TabsList>

        {/* TAB 1: Events */}
        <TabsContent value="events" className="space-y-4 mt-4">
          <div className="flex gap-2">
            <Button size="sm" onClick={() => setAddEventOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Event
            </Button>
            <Button size="sm" variant="outline" onClick={() => setBatchOpen(true)}>
              Batch Import
            </Button>
          </div>

          {period.events.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border rounded-lg">
              Belum ada event. Tambah event atau gunakan Batch Import.
            </div>
          ) : (
            <div className="space-y-6">
              {sortedDates.map(date => (
                <div key={date}>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                    {formatDate(date + "T00:00:00")}
                  </h3>
                  <div className="border rounded-lg overflow-hidden">
                    {grouped[date].map((ev, i) => (
                      <div
                        key={ev.id}
                        className={cn(
                          "flex items-start justify-between gap-4 px-4 py-3",
                          i > 0 && "border-t"
                        )}
                      >
                        <div className="flex-1 space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-sm">{ev.namaEvent}</span>
                            <span className="text-xs text-muted-foreground">{ev.waktu}</span>
                            <span className={cn("text-xs rounded-full px-2 py-0.5", KATEGORI_CLASS[ev.kategori] ?? "bg-gray-100 text-gray-700")}>
                              {ev.kategori}
                            </span>
                            {ev.isLive && (
                              <span className="text-xs rounded-full px-2 py-0.5 bg-red-100 text-red-700">LIVE</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 flex-wrap">
                            {ev.requiredRoles.map(r => (
                              <span key={r} className={cn("text-xs rounded px-1.5 py-0.5 font-mono", ROLE_CLASS[r])}>
                                {r}
                              </span>
                            ))}
                            {ev._count.availability > 0 && (
                              <span className="text-xs text-muted-foreground ml-1">
                                {ev._count.availability} respon ketersediaan
                              </span>
                            )}
                          </div>
                          {ev.keterangan && (
                            <p className="text-xs text-muted-foreground">{ev.keterangan}</p>
                          )}
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                          onClick={() => handleDeleteEvent(ev.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* TAB 2: Availability */}
        <TabsContent value="availability" className="mt-4">
          {availLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : period.events.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">Belum ada event untuk ditampilkan.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="text-xs w-full border rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left px-3 py-2 font-medium border-b border-r min-w-[160px]">Event</th>
                    {members.map(m => (
                      <th key={m.id} className="px-2 py-2 font-medium border-b border-r text-center min-w-[80px]">{m.nama}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {period.events.map((ev, i) => {
                    const avMap: Record<string, AvailabilityStatus> = {}
                    availability.filter(a => a.eventId === ev.id).forEach(a => { avMap[a.memberId] = a.status })
                    return (
                      <tr key={ev.id} className={i % 2 === 0 ? "" : "bg-muted/20"}>
                        <td className="px-3 py-2 border-b border-r font-medium">
                          <div>{ev.namaEvent}</div>
                          <div className="text-muted-foreground">{ev.waktu}</div>
                        </td>
                        {members.map(m => {
                          const s = avMap[m.id]
                          return (
                            <td key={m.id} className="px-2 py-2 border-b border-r text-center">
                              {s === "AVAILABLE" && <span className="text-green-600 font-bold">✓</span>}
                              {s === "UNAVAILABLE" && <span className="text-red-500 font-bold">✗</span>}
                              {s === "MAYBE" && <span className="text-yellow-600 font-bold">~</span>}
                              {!s && <span className="text-muted-foreground">—</span>}
                            </td>
                          )
                        })}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {members.length === 0 && (
                <p className="text-center text-muted-foreground py-6">Belum ada anggota terdaftar.</p>
              )}
            </div>
          )}
        </TabsContent>

        {/* TAB 3: Assignments */}
        <TabsContent value="assignments" className="mt-4 space-y-4">
          {period.events.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">Belum ada event.</div>
          ) : (
            <div className="space-y-4">
              {period.events.map(ev => (
                <div key={ev.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-sm">{ev.namaEvent}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(ev.tanggal)} · {ev.waktu}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      onClick={() => {
                        setAssignDialogEvent(ev)
                        setAssignMemberId("")
                        setAssignRole("SLD")
                      }}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Tambah
                    </Button>
                  </div>
                  {ev.assignments.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">Belum ada penugasan</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {ev.assignments.map(a => (
                        <div key={a.id} className="flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs">
                          <span className={cn("rounded px-1.5 py-0.5 font-mono text-[10px]", ROLE_CLASS[a.role as MultimediaRole])}>
                            {a.role}
                          </span>
                          <span>{a.member.nama}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
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
