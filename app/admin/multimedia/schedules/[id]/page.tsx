"use client"

import { useEffect, useState, use, useCallback } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
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
  ChevronLeft,
  Calendar as CalendarIcon,
  Users as UsersIcon,
  LayoutDashboard,
  Zap,
  Check,
  Copy,
  Pencil,
  Radio,
  AlertTriangle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/providers/AuthProvider"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// ── Types ────────────────────────────────────────────────────────────────────

type MultimediaServiceRole = "SLD" | "SND" | "STR" | "CAM"
type ScheduleStatus = "DRAFT" | "COLLECTING" | "CLOSED" | "REVIEW" | "PUBLISHED"

type Member = { id: string; nama: string; serviceRoles: MultimediaServiceRole[] }

type Assignment = {
  id: string
  role: MultimediaServiceRole
  isManual: boolean
  member: { id: string; nama: string }
  event: { id: string; namaEvent: string; tanggal: string; waktu: string; kategori: string }
}

type ScheduleEvent = {
  id: string
  namaEvent: string
  tanggal: string
  waktu: string
  kategori: string
  keterangan?: string | null
  isLive: boolean
  requiredRoles: MultimediaServiceRole[]
  order: number
  assignments: Assignment[]
  _count: { availability: number }
}

type SchedulePeriod = {
  id: string
  nama: string
  bulan: number
  tahun: number
  status: ScheduleStatus
  formToken?: string | null
  formEnabled: boolean
  deadlineAvailability?: string | null
  publishedAt?: string | null
  events: ScheduleEvent[]
}

type AvailabilityRecord = {
  memberId: string
  eventId: string
  status: "AVAILABLE" | "UNAVAILABLE"
}

// ── Constants ────────────────────────────────────────────────────────────────

const STATUS_CLASS: Record<ScheduleStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  COLLECTING: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  CLOSED: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  REVIEW: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  PUBLISHED: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
}

const STATUS_LABEL: Record<ScheduleStatus, string> = {
  DRAFT: "Draft",
  COLLECTING: "Mengumpulkan",
  CLOSED: "Ditutup",
  REVIEW: "Tinjauan",
  PUBLISHED: "Diterbitkan",
}

const KATEGORI_CLASS: Record<string, string> = {
  "Ibadah Raya": "bg-blue-500/10 text-blue-600 border-blue-500/20",
  "Ibadah Pelkat": "bg-purple-500/10 text-purple-600 border-purple-500/20",
  "Kegiatan Khusus": "bg-orange-500/10 text-orange-600 border-orange-500/20",
}

const ROLE_CLASS: Record<MultimediaServiceRole, string> = {
  SLD: "bg-slate-500/10 text-slate-600 border-slate-500/20",
  SND: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  STR: "bg-rose-500/10 text-rose-600 border-rose-500/20",
  CAM: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
}

const ALL_ROLES: MultimediaServiceRole[] = ["SLD", "SND", "STR", "CAM"]
const ROLE_LABELS: Record<MultimediaServiceRole, string> = {
  SLD: "Operator Slide",
  SND: "Operator Sound",
  STR: "Streamer",
  CAM: "Cameraman",
}
const KATEGORI_OPTIONS = ["Ibadah Raya", "Ibadah Pelkat", "Kegiatan Khusus"]

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(isoString: string) {
  const d = new Date(isoString + (isoString.includes("T") ? "" : "T00:00:00"))
  return d.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
}

function formatDateShort(isoString: string) {
  const d = new Date(isoString + (isoString.includes("T") ? "" : "T00:00:00"))
  return d.toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short" })
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

const STATUS_ORDER: ScheduleStatus[] = ["DRAFT", "COLLECTING", "CLOSED", "REVIEW", "PUBLISHED"]

function statusGte(a: ScheduleStatus, b: ScheduleStatus) {
  return STATUS_ORDER.indexOf(a) >= STATUS_ORDER.indexOf(b)
}

const defaultEventForm = {
  namaEvent: "",
  tanggal: "",
  waktu: "",
  kategori: "Ibadah Raya",
  keterangan: "",
  isLive: false,
  requiredRoles: [] as MultimediaServiceRole[],
}

// ── BULAN lookup for WhatsApp import ─────────────────────────────────────────
const BULAN_MAP: Record<string, string> = {
  Januari: "01", Februari: "02", Maret: "03", April: "04", Mei: "05", Juni: "06",
  Juli: "07", Agustus: "08", September: "09", Oktober: "10", November: "11", Desember: "12",
}

function parseWhatsAppText(text: string) {
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean)
  const parsed: Array<{ namaEvent: string; tanggal: string; waktu: string; kategori: string; isLive: boolean; requiredRoles: MultimediaServiceRole[] }> = []
  const warnings: string[] = []

  for (const line of lines) {
    const parts = line.split("|").map(p => p.trim())
    if (parts.length < 4) {
      warnings.push(`Baris tidak valid (kurang dari 4 bagian): "${line}"`)
      continue
    }
    const [dateStr, waktu, kategori, rolesStr] = parts
    const dateMatch = dateStr.match(/(\d{1,2})\s+(\w+)\s+(\d{4})/)
    if (!dateMatch) {
      warnings.push(`Format tanggal tidak dikenali: "${dateStr}"`)
      continue
    }
    const month = BULAN_MAP[dateMatch[2]]
    if (!month) {
      warnings.push(`Nama bulan tidak dikenali: "${dateMatch[2]}"`)
      continue
    }
    const roles = rolesStr.toUpperCase().split(/[\s,]+/).filter(r => ALL_ROLES.includes(r as MultimediaServiceRole)) as MultimediaServiceRole[]
    if (roles.length === 0) {
      warnings.push(`Tidak ada role valid ditemukan: "${rolesStr}"`)
      continue
    }
    const day = dateMatch[1].padStart(2, "0")
    const year = dateMatch[3]
    parsed.push({
      namaEvent: kategori,
      tanggal: `${year}-${month}-${day}`,
      waktu,
      kategori: KATEGORI_OPTIONS.includes(kategori) ? kategori : "Ibadah Raya",
      isLive: roles.includes("STR"),
      requiredRoles: roles,
    })
  }
  return { parsed, warnings }
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function MultimediaSchedulePeriodPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { isMultimediaAdmin, isLoading: authLoading } = useAuth()

  const [period, setPeriod] = useState<SchedulePeriod | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  // Tab state
  const [activeTab, setActiveTab] = useState("events")

  // Availability tab
  const [members, setMembers] = useState<Member[]>([])
  const [availability, setAvailability] = useState<AvailabilityRecord[]>([])
  const [availLoading, setAvailLoading] = useState(false)
  const [availLoaded, setAvailLoaded] = useState(false)

  // Assignments tab
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [assignmentsLoading, setAssignmentsLoading] = useState(false)
  const [assignmentsLoaded, setAssignmentsLoaded] = useState(false)

  // Add event dialog
  const [addEventOpen, setAddEventOpen] = useState(false)
  const [eventForm, setEventForm] = useState(defaultEventForm)
  const [eventSaving, setEventSaving] = useState(false)

  // Edit event dialog
  const [editEventOpen, setEditEventOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<ScheduleEvent | null>(null)
  const [editEventForm, setEditEventForm] = useState(defaultEventForm)
  const [editEventSaving, setEditEventSaving] = useState(false)

  // WhatsApp import dialog
  const [waImportOpen, setWaImportOpen] = useState(false)
  const [waText, setWaText] = useState("")
  const [waParsed, setWaParsed] = useState<ReturnType<typeof parseWhatsAppText> | null>(null)
  const [waImporting, setWaImporting] = useState(false)

  // Edit assignment dialog
  const [editAssignOpen, setEditAssignOpen] = useState(false)
  const [editingAssign, setEditingAssign] = useState<{ eventId: string; role: MultimediaServiceRole; currentMemberId: string } | null>(null)
  const [editAssignMemberId, setEditAssignMemberId] = useState("")
  const [editAssignSaving, setEditAssignSaving] = useState(false)

  // Auth guard
  useEffect(() => {
    if (!authLoading && !isMultimediaAdmin) {
      router.replace("/admin/multimedia")
    }
  }, [authLoading, isMultimediaAdmin, router])

  const fetchPeriod = useCallback(async () => {
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
  }, [id])

  const fetchAvailabilityData = useCallback(async () => {
    if (availLoaded) return
    setAvailLoading(true)
    try {
      const [membersRes, availRes] = await Promise.all([
        fetch("/api/scheduler/members"),
        fetch(`/api/scheduler/availability/${id}`),
      ])
      const [mJson, aJson] = await Promise.all([membersRes.json(), availRes.json()])
      if (mJson.success) setMembers(mJson.data)
      if (aJson.success) setAvailability(aJson.data)
      setAvailLoaded(true)
    } catch {
      toast.error("Gagal memuat data ketersediaan")
    } finally {
      setAvailLoading(false)
    }
  }, [id, availLoaded])

  const fetchAssignments = useCallback(async () => {
    if (assignmentsLoaded) return
    setAssignmentsLoading(true)
    try {
      const [assignRes, membersRes] = await Promise.all([
        fetch(`/api/scheduler/assignments/${id}`),
        members.length === 0 ? fetch("/api/scheduler/members") : Promise.resolve(null),
      ])
      const aJson = await assignRes.json()
      if (aJson.success) setAssignments(aJson.data)
      if (membersRes) {
        const mJson = await membersRes.json()
        if (mJson.success) setMembers(mJson.data)
      }
      setAssignmentsLoaded(true)
    } catch {
      toast.error("Gagal memuat data penugasan")
    } finally {
      setAssignmentsLoading(false)
    }
  }, [id, assignmentsLoaded, members.length])

  useEffect(() => {
    if (authLoading || !isMultimediaAdmin) return
    fetchPeriod()
    // Preload members for assignment editing
    fetch("/api/scheduler/members")
      .then(r => r.json())
      .then(j => { if (j.success) setMembers(j.data) })
      .catch(() => {})
  }, [id, authLoading, isMultimediaAdmin]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleTabChange(tab: string) {
    setActiveTab(tab)
    if (tab === "availability" && period && statusGte(period.status, "COLLECTING")) {
      fetchAvailabilityData()
    }
    if (tab === "final" && period && statusGte(period.status, "REVIEW")) {
      fetchAssignments()
    }
  }

  // ── Action bar handlers ───────────────────────────────────────────────────

  async function handleFormAction(action: "enable" | "disable") {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/scheduler/periods/${id}/form`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })
      const json = await res.json()
      if (json.success) {
        toast.success(action === "enable" ? "Form ketersediaan dibuka" : "Form ditutup")
        fetchPeriod()
      } else {
        toast.error(json.message ?? "Gagal memperbarui form")
      }
    } catch {
      toast.error("Gagal memperbarui form")
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
      if (json.success) {
        toast.success("Jadwal AI berhasil dibuat")
        setAssignmentsLoaded(false)
        fetchPeriod()
      } else {
        toast.error(json.message ?? "Gagal membuat jadwal")
      }
    } catch {
      toast.error("Gagal membuat jadwal")
    } finally {
      setActionLoading(false)
    }
  }

  async function handleCloseFormAndGenerate() {
    if (!confirm("Tutup form ketersediaan dan generate jadwal AI sekarang?")) return
    setActionLoading(true)
    try {
      const formRes = await fetch(`/api/scheduler/periods/${id}/form`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "disable" }),
      })
      const formJson = await formRes.json()
      if (!formJson.success) {
        toast.error(formJson.message ?? "Gagal menutup form")
        return
      }
      const genRes = await fetch("/api/scheduler/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ periodId: id }),
      })
      const genJson = await genRes.json()
      if (genJson.success) {
        toast.success("Jadwal AI berhasil dibuat")
        setAssignmentsLoaded(false)
        fetchPeriod()
      } else {
        toast.error(genJson.message ?? "Gagal membuat jadwal")
      }
    } catch {
      toast.error("Gagal memproses permintaan")
    } finally {
      setActionLoading(false)
    }
  }

  async function handlePublish() {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/scheduler/periods/${id}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })
      const json = await res.json()
      if (json.success) {
        toast.success("Jadwal berhasil diterbitkan")
        fetchPeriod()
      } else {
        toast.error(json.message ?? "Gagal menerbitkan jadwal")
      }
    } catch {
      toast.error("Gagal menerbitkan jadwal")
    } finally {
      setActionLoading(false)
    }
  }

  async function handleUnpublish() {
    if (!confirm("Batalkan penerbitan jadwal ini?")) return
    setActionLoading(true)
    try {
      const res = await fetch(`/api/scheduler/periods/${id}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "unpublish" }),
      })
      const json = await res.json()
      if (json.success) {
        toast.success("Jadwal berhasil dibatalkan penerbitannya")
        fetchPeriod()
      } else {
        toast.error(json.message ?? "Gagal membatalkan penerbitan")
      }
    } catch {
      toast.error("Gagal membatalkan penerbitan")
    } finally {
      setActionLoading(false)
    }
  }

  async function handleBroadcast(type: string) {
    setActionLoading(true)
    try {
      const res = await fetch("/api/scheduler/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ periodId: id, type }),
      })
      const json = await res.json()
      if (json.success) toast.success("Pesan berhasil dikirim via WhatsApp")
      else toast.error(json.message ?? "Gagal mengirim pesan")
    } catch {
      toast.error("Gagal mengirim pesan")
    } finally {
      setActionLoading(false)
    }
  }

  // ── Event handlers ────────────────────────────────────────────────────────

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

  function openEditEvent(ev: ScheduleEvent) {
    setEditingEvent(ev)
    setEditEventForm({
      namaEvent: ev.namaEvent,
      tanggal: ev.tanggal.split("T")[0],
      waktu: ev.waktu,
      kategori: ev.kategori,
      keterangan: ev.keterangan ?? "",
      isLive: ev.isLive,
      requiredRoles: ev.requiredRoles,
    })
    setEditEventOpen(true)
  }

  async function handleEditEvent(e: React.FormEvent) {
    e.preventDefault()
    if (!editingEvent) return
    if (editEventForm.requiredRoles.length === 0) { toast.error("Pilih minimal 1 role"); return }
    setEditEventSaving(true)
    try {
      const res = await fetch(`/api/scheduler/events/${editingEvent.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          namaEvent: editEventForm.namaEvent,
          tanggal: editEventForm.tanggal,
          waktu: editEventForm.waktu,
          kategori: editEventForm.kategori,
          keterangan: editEventForm.keterangan || undefined,
          isLive: editEventForm.isLive,
          requiredRoles: editEventForm.requiredRoles,
        }),
      })
      const json = await res.json()
      if (json.success) {
        toast.success("Event berhasil diperbarui")
        setEditEventOpen(false)
        setEditingEvent(null)
        fetchPeriod()
      } else {
        toast.error(json.message ?? "Gagal memperbarui event")
      }
    } catch {
      toast.error("Gagal memperbarui event")
    } finally {
      setEditEventSaving(false)
    }
  }

  async function handleDeleteEvent(eventId: string) {
    if (!confirm("Hapus event ini? Semua data ketersediaan dan penugasan terkait juga akan dihapus.")) return
    try {
      const res = await fetch(`/api/scheduler/events/${eventId}`, { method: "DELETE" })
      const json = await res.json()
      if (json.success) { toast.success("Event dihapus"); fetchPeriod() }
      else toast.error(json.message ?? "Gagal menghapus event")
    } catch {
      toast.error("Gagal menghapus event")
    }
  }

  function toggleRole(role: MultimediaServiceRole, formSetter: React.Dispatch<React.SetStateAction<typeof defaultEventForm>>) {
    formSetter(f => ({
      ...f,
      requiredRoles: f.requiredRoles.includes(role)
        ? f.requiredRoles.filter(r => r !== role)
        : [...f.requiredRoles, role],
    }))
  }

  // ── WhatsApp import ───────────────────────────────────────────────────────

  function handleWaParse() {
    const result = parseWhatsAppText(waText)
    setWaParsed(result)
  }

  async function handleWaImport() {
    if (!waParsed || waParsed.parsed.length === 0) return
    setWaImporting(true)
    try {
      const res = await fetch(`/api/scheduler/periods/${id}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(waParsed.parsed),
      })
      const json = await res.json()
      if (json.success) {
        toast.success(`${waParsed.parsed.length} event berhasil diimpor`)
        setWaImportOpen(false)
        setWaText("")
        setWaParsed(null)
        fetchPeriod()
      } else {
        toast.error(json.message ?? "Gagal mengimpor event")
      }
    } catch {
      toast.error("Gagal mengimpor event")
    } finally {
      setWaImporting(false)
    }
  }

  // ── Assignment editing ────────────────────────────────────────────────────

  function openEditAssign(eventId: string, role: MultimediaServiceRole, currentMemberId: string) {
    setEditingAssign({ eventId, role, currentMemberId })
    setEditAssignMemberId(currentMemberId)
    setEditAssignOpen(true)
  }

  async function handleEditAssignSave() {
    if (!editingAssign || !editAssignMemberId) return
    setEditAssignSaving(true)
    try {
      // Build updated assignments for the period: replace this slot
      const currentAssignments = assignments.map(a => ({
        eventId: a.event.id,
        memberId: a.member.id,
        role: a.role,
        isManual: a.isManual,
      }))
      // Find and replace the specific assignment
      const idx = currentAssignments.findIndex(
        a => a.eventId === editingAssign.eventId && a.role === editingAssign.role
      )
      if (idx >= 0) {
        currentAssignments[idx] = { ...currentAssignments[idx], memberId: editAssignMemberId, isManual: true }
      } else {
        currentAssignments.push({ eventId: editingAssign.eventId, memberId: editAssignMemberId, role: editingAssign.role, isManual: true })
      }
      const res = await fetch(`/api/scheduler/assignments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignments: currentAssignments }),
      })
      const json = await res.json()
      if (json.success) {
        toast.success("Penugasan berhasil diperbarui")
        setEditAssignOpen(false)
        setEditingAssign(null)
        setAssignmentsLoaded(false)
        fetchAssignments()
      } else {
        toast.error(json.message ?? "Gagal memperbarui penugasan")
      }
    } catch {
      toast.error("Gagal memperbarui penugasan")
    } finally {
      setEditAssignSaving(false)
    }
  }

  // ── Early returns ─────────────────────────────────────────────────────────

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
        <CalendarIcon className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground font-medium">Periode tidak ditemukan.</p>
        <Button variant="outline" className="mt-6" onClick={() => router.push("/admin/multimedia/schedules")}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Kembali
        </Button>
      </div>
    )
  }

  const grouped = groupEventsByDate(period.events)
  const sortedDates = Object.keys(grouped).sort()
  const canEdit = period.status === "DRAFT" || period.status === "COLLECTING"
  const showAvailability = statusGte(period.status, "COLLECTING")
  const showFinal = statusGte(period.status, "REVIEW")
  const formUrl = period.formToken
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/availability/${period.formToken}`
    : ""

  // Group assignments by event for final tab
  const assignmentsByEvent: Record<string, Assignment[]> = {}
  for (const a of assignments) {
    const eid = a.event.id
    if (!assignmentsByEvent[eid]) assignmentsByEvent[eid] = []
    assignmentsByEvent[eid].push(a)
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-24">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <button
          onClick={() => router.push("/admin/multimedia/schedules")}
          className="group inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-full border border-border bg-background group-hover:border-foreground/20 group-hover:bg-accent transition-colors">
            <ChevronLeft className="h-3 w-3" />
          </div>
          Kembali ke Daftar Jadwal
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight">{period.nama}</h1>
            <Badge variant="outline" className={cn("rounded-full font-medium border-0 px-2.5 py-0.5", STATUS_CLASS[period.status])}>
              {STATUS_LABEL[period.status]}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {new Date(period.tahun, period.bulan - 1).toLocaleDateString("id-ID", { month: "long", year: "numeric" })}
          </p>
        </div>
      </div>

      {/* ── Sticky Action Bar ──────────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 -mx-4 px-4 py-3 bg-background/95 backdrop-blur border-b border-border/60 flex flex-wrap items-center gap-3">
        {period.status === "DRAFT" && (
          <Button
            onClick={() => handleFormAction("enable")}
            disabled={actionLoading}
            className="bg-primary hover:bg-primary/90"
          >
            {actionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UsersIcon className="mr-2 h-4 w-4" />}
            Buka Form Ketersediaan
          </Button>
        )}

        {period.status === "COLLECTING" && (
          <>
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Input
                readOnly
                value={formUrl}
                className="h-8 text-xs font-mono bg-muted/50 border-border/50"
              />
              <Button
                size="sm"
                variant="outline"
                className="shrink-0"
                onClick={() => {
                  navigator.clipboard.writeText(formUrl)
                  toast.success("Link disalin!")
                }}
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBroadcast("FORM_LINK")}
              disabled={actionLoading}
            >
              <Radio className="mr-2 h-3.5 w-3.5" />
              Broadcast ke WA
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleCloseFormAndGenerate}
              disabled={actionLoading}
            >
              {actionLoading ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Zap className="mr-2 h-3.5 w-3.5" />}
              Tutup Form & Generate Jadwal
            </Button>
          </>
        )}

        {period.status === "CLOSED" && (
          <Button
            onClick={handleGenerate}
            disabled={actionLoading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {actionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
            Generate Jadwal AI
          </Button>
        )}

        {period.status === "REVIEW" && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (confirm("Regenerate jadwal AI? Semua penugasan saat ini akan ditimpa.")) {
                  handleGenerate()
                }
              }}
              disabled={actionLoading}
            >
              {actionLoading ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Zap className="mr-2 h-3.5 w-3.5" />}
              Regenerate AI
            </Button>
            <Button
              onClick={handlePublish}
              disabled={actionLoading}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {actionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Publish Jadwal
            </Button>
          </>
        )}

        {period.status === "PUBLISHED" && (
          <>
            <Button variant="outline" size="sm" asChild>
              <a href={`/api/scheduler/periods/${id}/export`} target="_blank" rel="noreferrer">
                <Download className="mr-2 h-3.5 w-3.5" />
                Download PDF
              </a>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBroadcast("SCHEDULE_PUBLISHED")}
              disabled={actionLoading}
            >
              <Radio className="mr-2 h-3.5 w-3.5" />
              Broadcast ke WA
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleUnpublish}
              disabled={actionLoading}
              className="text-muted-foreground"
            >
              Unpublish
            </Button>
          </>
        )}
      </div>

      {/* ── Tabs ───────────────────────────────────────────────────────────── */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="h-auto p-0 bg-transparent border-b border-border/50 w-full justify-start gap-0 rounded-none">
          <TabsTrigger
            value="events"
            className="relative h-10 rounded-none border-b-2 border-transparent bg-transparent px-4 font-semibold text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
          >
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Daftar Ibadah
            {period.events.length > 0 && (
              <span className="ml-2 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-bold">
                {period.events.length}
              </span>
            )}
          </TabsTrigger>
          {showAvailability && (
            <TabsTrigger
              value="availability"
              className="relative h-10 rounded-none border-b-2 border-transparent bg-transparent px-4 font-semibold text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
            >
              <UsersIcon className="mr-2 h-4 w-4" />
              Ketersediaan
            </TabsTrigger>
          )}
          {showFinal && (
            <TabsTrigger
              value="final"
              className="relative h-10 rounded-none border-b-2 border-transparent bg-transparent px-4 font-semibold text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              Jadwal Final
            </TabsTrigger>
          )}
        </TabsList>

        {/* ── TAB 1: Daftar Ibadah ─────────────────────────────────────────── */}
        <TabsContent value="events" className="mt-6 outline-none space-y-6">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">Agenda Ibadah</h2>
              <p className="text-sm text-muted-foreground">{period.events.length} event terdaftar.</p>
            </div>
            {canEdit && (
              <div className="flex gap-2 shrink-0">
                <Button size="sm" variant="outline" onClick={() => setWaImportOpen(true)}>
                  Import dari WhatsApp
                </Button>
                <Button size="sm" onClick={() => setAddEventOpen(true)}>
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  Tambah Event
                </Button>
              </div>
            )}
          </div>

          {period.events.length === 0 ? (
            <Card className="border-dashed bg-muted/20">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center gap-4">
                <CalendarIcon className="h-10 w-10 text-muted-foreground/40" />
                <div>
                  <p className="font-semibold">Belum ada agenda</p>
                  <p className="text-sm text-muted-foreground mt-1">Tambahkan event secara manual atau impor dari WhatsApp.</p>
                </div>
                {canEdit && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setWaImportOpen(true)}>Import dari WhatsApp</Button>
                    <Button size="sm" onClick={() => setAddEventOpen(true)}>Tambah Event</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-8">
              {sortedDates.map(date => (
                <div key={date}>
                  <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-3">
                    <span>{formatDate(date)}</span>
                    <span className="flex-1 h-px bg-border" />
                  </h3>
                  <div className="grid gap-3">
                    {grouped[date].map(ev => (
                      <div
                        key={ev.id}
                        className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-border/50 bg-background p-4 hover:border-foreground/10 hover:shadow-sm transition-all"
                      >
                        <div className="space-y-2 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold tabular-nums text-foreground/70">{ev.waktu}</span>
                            <span className="text-foreground/30">·</span>
                            <span className="font-semibold text-sm">{ev.namaEvent}</span>
                            <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 rounded border", KATEGORI_CLASS[ev.kategori] ?? "bg-muted text-muted-foreground border-border")}>
                              {ev.kategori}
                            </Badge>
                            {ev.isLive && (
                              <span className="text-[10px] font-bold text-rose-500 flex items-center gap-1">
                                🔴 LIVE
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5">
                            {ev.requiredRoles.map(r => (
                              <span key={r} className={cn("text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded border leading-none", ROLE_CLASS[r])}>
                                {r}
                              </span>
                            ))}
                            {ev._count.availability > 0 && (
                              <span className="text-[11px] text-muted-foreground flex items-center gap-1 ml-1">
                                <UsersIcon className="h-3 w-3" />
                                {ev._count.availability} respon
                              </span>
                            )}
                          </div>
                          {ev.keterangan && (
                            <p className="text-xs text-muted-foreground italic">{ev.keterangan}</p>
                          )}
                        </div>
                        {canEdit && (
                          <div className="flex items-center gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 rounded-full hover:bg-accent"
                              onClick={() => openEditEvent(ev)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
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
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── TAB 2: Ketersediaan ───────────────────────────────────────────── */}
        {showAvailability && (
          <TabsContent value="availability" className="mt-6 outline-none space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold">Ketersediaan Tim</h2>
                {!availLoading && members.length > 0 && (
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {availability.reduce((acc, a) => {
                      const set = new Set(availability.filter(x => x.status === "AVAILABLE").map(x => x.memberId))
                      return set
                    }, new Set<string>()).size} dari {members.length} anggota sudah mengisi ketersediaan
                  </p>
                )}
              </div>
              {period.status === "COLLECTING" && period.deadlineAvailability && (
                <div className="text-sm text-muted-foreground bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg px-3 py-2">
                  Deadline:{" "}
                  <strong>
                    {new Date(period.deadlineAvailability).toLocaleDateString("id-ID", {
                      weekday: "long", day: "numeric", month: "long", year: "numeric"
                    })}
                  </strong>
                </div>
              )}
            </div>

            {availLoading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary/30" />
                <p className="text-sm text-muted-foreground">Memuat data ketersediaan...</p>
              </div>
            ) : members.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
                  <UsersIcon className="h-10 w-10 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">Belum ada anggota aktif.</p>
                  <Button variant="outline" size="sm" onClick={() => router.push("/admin/multimedia/members")}>
                    Kelola Tim
                  </Button>
                </CardContent>
              </Card>
            ) : period.events.length === 0 ? (
              <p className="text-sm text-muted-foreground">Belum ada event untuk ditampilkan.</p>
            ) : (
              <>
                {/* Summary */}
                <AvailabilitySummary members={members} events={period.events} availability={availability} />

                {/* Matrix */}
                <Card className="overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-xs">
                      <thead>
                        <tr className="bg-muted/30 border-b">
                          <th className="sticky left-0 z-10 bg-muted/30 border-r p-3 font-bold text-left min-w-[180px] whitespace-nowrap">
                            Anggota
                          </th>
                          {period.events.map(ev => (
                            <th key={ev.id} className="border-r p-2 font-medium text-center min-w-[80px] whitespace-nowrap">
                              <div className="font-bold truncate max-w-[80px]">{ev.namaEvent}</div>
                              <div className="text-[9px] font-normal text-muted-foreground mt-0.5">
                                {formatDateShort(ev.tanggal)} {ev.waktu}
                              </div>
                            </th>
                          ))}
                          <th className="p-2 font-bold text-center whitespace-nowrap">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {members.map(m => {
                          const avMap: Record<string, "AVAILABLE" | "UNAVAILABLE" | undefined> = {}
                          availability.filter(a => a.memberId === m.id).forEach(a => { avMap[a.eventId] = a.status })
                          const availCount = period.events.filter(ev => avMap[ev.id] === "AVAILABLE").length
                          return (
                            <tr key={m.id} className="group hover:bg-muted/20 border-b transition-colors">
                              <td className="sticky left-0 z-10 bg-background group-hover:bg-muted/20 border-r p-3 transition-colors">
                                <div className="font-semibold">{m.nama}</div>
                                <div className="text-[9px] text-muted-foreground uppercase tracking-wide mt-0.5">
                                  {m.serviceRoles.join(", ")}
                                </div>
                              </td>
                              {period.events.map(ev => {
                                const s = avMap[ev.id]
                                return (
                                  <td key={ev.id} className={cn("border-r p-2 text-center", s === "AVAILABLE" ? "bg-green-50 dark:bg-green-900/20" : s === "UNAVAILABLE" ? "bg-red-50 dark:bg-red-900/20" : "bg-muted/10")}>
                                    {s === "AVAILABLE" && <span className="text-green-600 font-bold">✓</span>}
                                    {s === "UNAVAILABLE" && <span className="text-red-500 font-bold">✗</span>}
                                    {!s && <span className="text-muted-foreground/40">—</span>}
                                  </td>
                                )
                              })}
                              <td className="p-2 text-center font-bold tabular-nums">
                                {availCount}/{period.events.length}
                              </td>
                            </tr>
                          )
                        })}
                        {/* Column totals row */}
                        <tr className="bg-muted/20 border-t font-semibold">
                          <td className="sticky left-0 z-10 bg-muted/20 border-r p-3 text-[10px] uppercase tracking-wider text-muted-foreground">
                            Tersedia
                          </td>
                          {period.events.map(ev => {
                            const count = availability.filter(a => a.eventId === ev.id && a.status === "AVAILABLE").length
                            const needed = ev.requiredRoles.length
                            return (
                              <td key={ev.id} className={cn("border-r p-2 text-center tabular-nums", count < needed ? "text-red-500 font-bold" : "text-green-600")}>
                                {count}
                              </td>
                            )
                          })}
                          <td className="p-2" />
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </Card>
              </>
            )}
          </TabsContent>
        )}

        {/* ── TAB 3: Jadwal Final ───────────────────────────────────────────── */}
        {showFinal && (
          <TabsContent value="final" className="mt-6 outline-none space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold">Jadwal Final</h2>
                <p className="text-sm text-muted-foreground">Penugasan multimedia per event.</p>
              </div>
              {period.status === "REVIEW" && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (confirm("Regenerate jadwal AI? Semua penugasan saat ini akan ditimpa.")) {
                        handleGenerate()
                      }
                    }}
                    disabled={actionLoading}
                  >
                    {actionLoading ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Zap className="mr-1.5 h-3.5 w-3.5" />}
                    Regenerate AI
                  </Button>
                  <Button
                    size="sm"
                    onClick={handlePublish}
                    disabled={actionLoading}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Publish
                  </Button>
                </div>
              )}
              {period.status === "PUBLISHED" && (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" asChild>
                    <a href={`/api/scheduler/periods/${id}/export`} target="_blank" rel="noreferrer">
                      <Download className="mr-1.5 h-3.5 w-3.5" />
                      Download PDF
                    </a>
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleBroadcast("SCHEDULE_PUBLISHED")} disabled={actionLoading}>
                    <Radio className="mr-1.5 h-3.5 w-3.5" />
                    Broadcast WA
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleUnpublish} disabled={actionLoading} className="text-muted-foreground">
                    Unpublish
                  </Button>
                </div>
              )}
            </div>

            {assignmentsLoading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary/30" />
                <p className="text-sm text-muted-foreground">Memuat jadwal final...</p>
              </div>
            ) : period.events.length === 0 ? (
              <p className="text-sm text-muted-foreground">Belum ada event.</p>
            ) : (
              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-muted/30 border-b">
                        <th className="p-3 text-left font-bold text-xs uppercase tracking-wider text-muted-foreground">Tanggal</th>
                        <th className="p-3 text-left font-bold text-xs uppercase tracking-wider text-muted-foreground">Waktu</th>
                        <th className="p-3 text-left font-bold text-xs uppercase tracking-wider text-muted-foreground">Event</th>
                        <th className="p-3 text-left font-bold text-xs uppercase tracking-wider text-muted-foreground">Role</th>
                        <th className="p-3 text-left font-bold text-xs uppercase tracking-wider text-muted-foreground">Pelayan</th>
                        {period.status === "REVIEW" && (
                          <th className="p-3 text-center font-bold text-xs uppercase tracking-wider text-muted-foreground">Aksi</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {sortedDates.map(date => (
                        grouped[date].map((ev, evIdx) => {
                          const evAssignments = assignmentsByEvent[ev.id] ?? []
                          const roles = ev.requiredRoles.length > 0 ? ev.requiredRoles : ALL_ROLES
                          return roles.map((role, roleIdx) => {
                            const assigned = evAssignments.find(a => a.role === role)
                            return (
                              <tr
                                key={`${ev.id}-${role}`}
                                className={cn(
                                  "border-b transition-colors hover:bg-muted/20",
                                  roleIdx === 0 && evIdx > 0 ? "border-t-2 border-t-border/50" : ""
                                )}
                              >
                                {roleIdx === 0 ? (
                                  <td className="p-3 font-medium text-foreground/80 align-top whitespace-nowrap" rowSpan={roles.length}>
                                    {formatDateShort(date)}
                                  </td>
                                ) : null}
                                {roleIdx === 0 ? (
                                  <td className="p-3 text-muted-foreground align-top whitespace-nowrap tabular-nums" rowSpan={roles.length}>
                                    {ev.waktu}
                                  </td>
                                ) : null}
                                {roleIdx === 0 ? (
                                  <td className="p-3 align-top" rowSpan={roles.length}>
                                    <div className="font-semibold">{ev.namaEvent}</div>
                                    <div className="flex items-center gap-1.5 mt-1">
                                      <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 border", KATEGORI_CLASS[ev.kategori] ?? "")}>
                                        {ev.kategori}
                                      </Badge>
                                      {ev.isLive && <span className="text-[10px] text-rose-500 font-bold">🔴 LIVE</span>}
                                    </div>
                                    {ev.keterangan && <p className="text-xs text-muted-foreground mt-1 italic">{ev.keterangan}</p>}
                                  </td>
                                ) : null}
                                <td className="p-3">
                                  <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded border leading-none", ROLE_CLASS[role])}>
                                    {role}
                                  </span>
                                  <div className="text-[10px] text-muted-foreground mt-0.5">{ROLE_LABELS[role]}</div>
                                </td>
                                <td className="p-3">
                                  {assigned ? (
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-medium">{assigned.member.nama}</span>
                                      {assigned.isManual && (
                                        <span className="text-[9px] bg-muted px-1 rounded text-muted-foreground">manual</span>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400 text-xs font-medium">
                                      <AlertTriangle className="h-3.5 w-3.5" />
                                      Belum terisi
                                    </span>
                                  )}
                                </td>
                                {period.status === "REVIEW" && (
                                  <td className="p-3 text-center">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-7 px-2"
                                      onClick={() => openEditAssign(ev.id, role, assigned?.member.id ?? "")}
                                    >
                                      <Pencil className="h-3 w-3" />
                                    </Button>
                                  </td>
                                )}
                              </tr>
                            )
                          })
                        })
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </TabsContent>
        )}
      </Tabs>

      {/* ── Add Event Dialog ──────────────────────────────────────────────── */}
      <Dialog open={addEventOpen} onOpenChange={setAddEventOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Tambah Event</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddEvent} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ae-nama">Nama Event</Label>
              <Input
                id="ae-nama"
                value={eventForm.namaEvent}
                onChange={e => setEventForm(f => ({ ...f, namaEvent: e.target.value }))}
                placeholder="Ibadah Raya Minggu"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="ae-tanggal">Tanggal</Label>
                <Input
                  id="ae-tanggal"
                  type="date"
                  value={eventForm.tanggal}
                  onChange={e => setEventForm(f => ({ ...f, tanggal: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ae-waktu">Waktu</Label>
                <Input
                  id="ae-waktu"
                  value={eventForm.waktu}
                  onChange={e => setEventForm(f => ({ ...f, waktu: e.target.value }))}
                  placeholder="09.00 WIB"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Kategori</Label>
              <Select value={eventForm.kategori} onValueChange={v => setEventForm(f => ({ ...f, kategori: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {KATEGORI_OPTIONS.map(k => <SelectItem key={k} value={k}>{k}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                id="ae-live"
                checked={eventForm.isLive}
                onCheckedChange={v => setEventForm(f => ({ ...f, isLive: v }))}
              />
              <Label htmlFor="ae-live">Live Streaming</Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ae-ket">Keterangan (opsional)</Label>
              <Input
                id="ae-ket"
                value={eventForm.keterangan}
                onChange={e => setEventForm(f => ({ ...f, keterangan: e.target.value }))}
                placeholder="Catatan tambahan..."
              />
            </div>
            <div className="space-y-2">
              <Label>Role yang Dibutuhkan</Label>
              <div className="flex gap-4 flex-wrap">
                {ALL_ROLES.map(role => (
                  <label key={role} className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={eventForm.requiredRoles.includes(role)}
                      onChange={() => toggleRole(role, setEventForm)}
                      className="rounded"
                    />
                    <span className={cn("text-xs font-bold px-1.5 py-0.5 rounded border", ROLE_CLASS[role])}>{role}</span>
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

      {/* ── Edit Event Dialog ─────────────────────────────────────────────── */}
      <Dialog open={editEventOpen} onOpenChange={v => { if (!v) { setEditEventOpen(false); setEditingEvent(null) } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditEvent} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ee-nama">Nama Event</Label>
              <Input
                id="ee-nama"
                value={editEventForm.namaEvent}
                onChange={e => setEditEventForm(f => ({ ...f, namaEvent: e.target.value }))}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="ee-tanggal">Tanggal</Label>
                <Input
                  id="ee-tanggal"
                  type="date"
                  value={editEventForm.tanggal}
                  onChange={e => setEditEventForm(f => ({ ...f, tanggal: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ee-waktu">Waktu</Label>
                <Input
                  id="ee-waktu"
                  value={editEventForm.waktu}
                  onChange={e => setEditEventForm(f => ({ ...f, waktu: e.target.value }))}
                  placeholder="09.00 WIB"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Kategori</Label>
              <Select value={editEventForm.kategori} onValueChange={v => setEditEventForm(f => ({ ...f, kategori: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {KATEGORI_OPTIONS.map(k => <SelectItem key={k} value={k}>{k}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                id="ee-live"
                checked={editEventForm.isLive}
                onCheckedChange={v => setEditEventForm(f => ({ ...f, isLive: v }))}
              />
              <Label htmlFor="ee-live">Live Streaming</Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ee-ket">Keterangan (opsional)</Label>
              <Input
                id="ee-ket"
                value={editEventForm.keterangan}
                onChange={e => setEditEventForm(f => ({ ...f, keterangan: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Role yang Dibutuhkan</Label>
              <div className="flex gap-4 flex-wrap">
                {ALL_ROLES.map(role => (
                  <label key={role} className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={editEventForm.requiredRoles.includes(role)}
                      onChange={() => toggleRole(role, setEditEventForm)}
                      className="rounded"
                    />
                    <span className={cn("text-xs font-bold px-1.5 py-0.5 rounded border", ROLE_CLASS[role])}>{role}</span>
                    <span className="text-xs text-muted-foreground">{ROLE_LABELS[role]}</span>
                  </label>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setEditEventOpen(false); setEditingEvent(null) }}>Batal</Button>
              <Button type="submit" disabled={editEventSaving}>
                {editEventSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── WhatsApp Import Dialog ────────────────────────────────────────── */}
      <Dialog open={waImportOpen} onOpenChange={v => { if (!v) { setWaImportOpen(false); setWaText(""); setWaParsed(null) } }}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Import dari WhatsApp</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Satu event per baris. Format:{" "}
              <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">
                Hari, D Bulan YYYY | HH.MM WIB | Kategori | ROLES
              </code>
            </p>
            <div className="bg-muted/50 rounded-lg p-3 font-mono text-xs text-muted-foreground whitespace-pre-wrap">
              {`Minggu, 6 April 2025 | 06.00 WIB | Ibadah Raya | SLD SND STR\nMinggu, 6 April 2025 | 09.00 WIB | Ibadah Raya | SLD SND STR CAM`}
            </div>
            <Textarea
              rows={8}
              value={waText}
              onChange={e => {
                setWaText(e.target.value)
                if (e.target.value.trim()) {
                  setWaParsed(parseWhatsAppText(e.target.value))
                } else {
                  setWaParsed(null)
                }
              }}
              placeholder="Tempel teks dari WhatsApp di sini..."
              className="font-mono text-xs"
            />

            {waParsed && (
              <div className="space-y-3">
                {waParsed.warnings.length > 0 && (
                  <div className="rounded-lg border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 p-3 space-y-1">
                    <p className="text-xs font-semibold text-yellow-700 dark:text-yellow-400 flex items-center gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      {waParsed.warnings.length} peringatan
                    </p>
                    {waParsed.warnings.map((w, i) => (
                      <p key={i} className="text-xs text-yellow-700 dark:text-yellow-400">{w}</p>
                    ))}
                  </div>
                )}
                {waParsed.parsed.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-green-700 dark:text-green-400">
                      {waParsed.parsed.length} event siap diimpor:
                    </p>
                    <div className="max-h-40 overflow-y-auto space-y-1">
                      {waParsed.parsed.map((ev, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs bg-muted/30 rounded px-2 py-1">
                          <Check className="h-3 w-3 text-green-500 shrink-0" />
                          <span className="font-medium">{ev.namaEvent}</span>
                          <span className="text-muted-foreground">{ev.tanggal} {ev.waktu}</span>
                          <div className="flex gap-1 ml-auto">
                            {ev.requiredRoles.map(r => (
                              <span key={r} className={cn("text-[9px] font-bold px-1 py-0.5 rounded border", ROLE_CLASS[r])}>{r}</span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setWaImportOpen(false); setWaText(""); setWaParsed(null) }}>Batal</Button>
            <Button
              onClick={handleWaImport}
              disabled={waImporting || !waParsed || waParsed.parsed.length === 0}
            >
              {waImporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Import {waParsed?.parsed.length ?? 0} Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit Assignment Dialog ────────────────────────────────────────── */}
      <Dialog open={editAssignOpen} onOpenChange={v => { if (!v) { setEditAssignOpen(false); setEditingAssign(null) } }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Ubah Penugasan</DialogTitle>
          </DialogHeader>
          {editingAssign && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className={cn("text-xs font-bold px-2 py-1 rounded border", ROLE_CLASS[editingAssign.role])}>
                  {editingAssign.role}
                </span>
                <span className="text-sm text-muted-foreground">{ROLE_LABELS[editingAssign.role]}</span>
              </div>
              <div className="space-y-2">
                <Label>Anggota</Label>
                <Select value={editAssignMemberId} onValueChange={setEditAssignMemberId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih anggota..." />
                  </SelectTrigger>
                  <SelectContent>
                    {members
                      .filter(m => m.serviceRoles.includes(editingAssign.role))
                      .map(m => (
                        <SelectItem key={m.id} value={m.id}>{m.nama}</SelectItem>
                      ))
                    }
                    {members.filter(m => !m.serviceRoles.includes(editingAssign.role)).length > 0 && (
                      <>
                        <div className="px-2 py-1 text-[10px] text-muted-foreground uppercase tracking-wider font-semibold border-t mt-1 pt-2">
                          Semua anggota
                        </div>
                        {members
                          .filter(m => !m.serviceRoles.includes(editingAssign.role))
                          .map(m => (
                            <SelectItem key={m.id} value={m.id}>{m.nama}</SelectItem>
                          ))
                        }
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditAssignOpen(false); setEditingAssign(null) }}>Batal</Button>
            <Button onClick={handleEditAssignSave} disabled={editAssignSaving || !editAssignMemberId}>
              {editAssignSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function AvailabilitySummary({
  members,
  events,
  availability,
}: {
  members: Member[]
  events: ScheduleEvent[]
  availability: AvailabilityRecord[]
}) {
  const memberIdsWithAny = new Set(availability.map(a => a.memberId))
  const filledCount = memberIdsWithAny.size
  const total = members.length

  return (
    <div className="flex items-center gap-3 text-sm bg-muted/30 rounded-lg px-4 py-3">
      <UsersIcon className="h-4 w-4 text-muted-foreground shrink-0" />
      <span>
        <strong>{filledCount}</strong> dari <strong>{total}</strong> anggota sudah mengisi ketersediaan
      </span>
      <div className="ml-auto flex items-center gap-3 text-xs">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
          Tersedia
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
          Tidak bisa
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
          Belum isi
        </span>
      </div>
    </div>
  )
}
