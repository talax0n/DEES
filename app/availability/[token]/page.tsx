"use client"

import { use, useEffect, useState } from "react"
import { toast } from "sonner"

// Types
type Member = { id: string; nama: string }
type Event = {
  id: string
  namaEvent: string
  tanggal: string
  waktu: string
  kategori: string
  isLive: boolean
  requiredRoles: string[]
}
type Period = {
  id: string
  nama: string
  bulan: number
  tahun: number
  deadlineAvailability?: string | null
  formEnabled: boolean
}
type AvailStatus = "AVAILABLE" | "UNAVAILABLE"

// Helper functions
const INDONESIAN_MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
]
const INDONESIAN_DAYS = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"]

function formatDateFull(dateStr: string) {
  const d = new Date(dateStr)
  return `${INDONESIAN_DAYS[d.getDay()]}, ${d.getDate()} ${INDONESIAN_MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

function formatDeadline(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getDate()} ${INDONESIAN_MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

export default function AvailabilityPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params)

  const [status, setStatus] = useState<"loading" | "invalid" | "closed" | "form" | "success">("loading")
  const [period, setPeriod] = useState<Period | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [selectedMemberId, setSelectedMemberId] = useState("")
  const [availability, setAvailability] = useState<Record<string, AvailStatus>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submittedSummary, setSubmittedSummary] = useState<{ available: number; total: number } | null>(null)

  // Load initial data
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`/api/scheduler/public/${token}`)
        if (res.status === 404) {
          setStatus("invalid")
          return
        }
        const data = await res.json()
        if (data.closed) {
          setStatus("closed")
          return
        }
        setPeriod(data.period)
        setEvents(data.events)
        setMembers(data.members)
        setStatus("form")
      } catch {
        setStatus("invalid")
      }
    }
    loadData()
  }, [token])

  // Initialize availability — all AVAILABLE by default
  useEffect(() => {
    if (events.length > 0) {
      const defaults: Record<string, AvailStatus> = {}
      events.forEach((e) => {
        defaults[e.id] = "AVAILABLE"
      })
      setAvailability(defaults)
    }
  }, [events])

  // When member selected, load existing
  async function handleMemberSelect(memberId: string) {
    setSelectedMemberId(memberId)
    if (!memberId) return
    try {
      const res = await fetch(`/api/scheduler/public/${token}/check?memberId=${memberId}`)
      const data = await res.json()
      if (data.availability?.length > 0) {
        const loaded: Record<string, AvailStatus> = {}
        events.forEach((e) => {
          loaded[e.id] = "AVAILABLE"
        }) // defaults first
        data.availability.forEach((a: { eventId: string; status: AvailStatus }) => {
          loaded[a.eventId] = a.status
        })
        setAvailability(loaded)
        toast.success("Data sebelumnya dimuat, Anda dapat mengubahnya")
      }
    } catch {
      // silently ignore
    }
  }

  function toggleEvent(eventId: string) {
    setAvailability((prev) => ({
      ...prev,
      [eventId]: prev[eventId] === "AVAILABLE" ? "UNAVAILABLE" : "AVAILABLE",
    }))
  }

  async function handleSubmit() {
    if (!selectedMemberId) {
      toast.error("Pilih nama Anda terlebih dahulu")
      return
    }
    setSubmitting(true)
    try {
      const payload = {
        memberId: selectedMemberId,
        availability: events.map((e) => ({ eventId: e.id, status: availability[e.id] ?? "AVAILABLE" })),
      }
      const res = await fetch(`/api/scheduler/public/${token}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (data.success) {
        const available = Object.values(availability).filter((s) => s === "AVAILABLE").length
        setSubmittedSummary({ available, total: events.length })
        setStatus("success")
      } else {
        toast.error(data.message ?? "Gagal menyimpan ketersediaan")
      }
    } catch {
      toast.error("Terjadi kesalahan. Coba lagi.")
    } finally {
      setSubmitting(false)
    }
  }

  // Group events by date
  const eventsByDate = events.reduce(
    (acc, e) => {
      const dateKey = e.tanggal.split("T")[0]
      if (!acc[dateKey]) acc[dateKey] = []
      acc[dateKey].push(e)
      return acc
    },
    {} as Record<string, Event[]>,
  )
  const sortedDates = Object.keys(eventsByDate).sort()

  const availableCount = Object.values(availability).filter((s) => s === "AVAILABLE").length

  // --- Render states ---

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <div className="text-center text-gray-500">
          <div className="w-8 h-8 border-4 border-[#1a2744] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm">Memuat...</p>
        </div>
      </div>
    )
  }

  if (status === "invalid") {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-md p-8 max-w-sm w-full text-center">
          <div className="text-4xl mb-4">🔗</div>
          <h2 className="text-lg font-bold text-[#1a2744] mb-2">Link Tidak Valid</h2>
          <p className="text-sm text-gray-500">
            Link tidak valid. Hubungi admin untuk mendapatkan link yang benar.
          </p>
        </div>
      </div>
    )
  }

  if (status === "closed") {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-md p-8 max-w-sm w-full text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-[#1a2744] mb-2">Form Sudah Ditutup</h2>
          <p className="text-sm text-gray-500">
            Pengumpulan ketersediaan sudah ditutup. Terima kasih atas partisipasinya!
          </p>
        </div>
      </div>
    )
  }

  if (status === "success" && submittedSummary) {
    const member = members.find((m) => m.id === selectedMemberId)
    return (
      <div className="min-h-screen bg-[#f5f5f5]">
        {/* Header */}
        <div className="bg-[#1a2744] text-white py-6 px-4 text-center">
          <p className="text-xs uppercase tracking-widest text-[#c9a227] font-semibold mb-1">
            GPIB &apos;Damai Sejahtera&apos; Cileungsi
          </p>
          <h1 className="text-lg font-bold">Ketersediaan Pelayanan Multimedia</h1>
          {period && <p className="text-sm text-white/70 mt-1">{period.nama}</p>}
        </div>

        <div className="max-w-lg mx-auto px-4 py-8 text-center">
          <div className="bg-white rounded-2xl shadow-md p-8">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-[#1a2744] mb-1">Terima Kasih!</h2>
            {member && <p className="text-sm text-gray-500 mb-4">{member.nama}</p>}
            <div className="bg-[#f5f5f5] rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-600">Ketersediaan Anda telah disimpan</p>
              <p className="text-2xl font-bold text-[#1a2744] mt-1">
                {submittedSummary.available}{" "}
                <span className="text-base font-normal text-gray-500">
                  dari {submittedSummary.total} ibadah
                </span>
              </p>
            </div>
            <button
              onClick={() => setStatus("form")}
              className="w-full py-3 px-4 rounded-xl border-2 border-[#1a2744] text-[#1a2744] font-semibold text-sm hover:bg-[#1a2744] hover:text-white transition-colors"
            >
              Ubah Jawaban
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Main form
  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* Header */}
      <div className="bg-[#1a2744] text-white py-6 px-4 text-center">
        <p className="text-xs uppercase tracking-widest text-[#c9a227] font-semibold mb-1">
          GPIB &apos;Damai Sejahtera&apos; Cileungsi
        </p>
        <h1 className="text-lg font-bold">Ketersediaan Pelayanan Multimedia</h1>
        {period && <p className="text-sm text-white/70 mt-1">{period.nama}</p>}
        {period?.deadlineAvailability && (
          <p className="text-xs text-[#c9a227] mt-2">
            ⏰ Batas pengisian: {formatDeadline(period.deadlineAvailability)}
          </p>
        )}
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Name selector */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <label className="block text-sm font-semibold text-[#1a2744] mb-2">
            Nama Anda
          </label>
          <select
            value={selectedMemberId}
            onChange={(e) => handleMemberSelect(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#1a2744] focus:border-transparent"
          >
            <option value="">Pilih nama Anda</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nama}
              </option>
            ))}
          </select>
        </div>

        {/* Events by date */}
        {selectedMemberId && sortedDates.length > 0 && (
          <div className="space-y-4">
            {sortedDates.map((dateKey) => (
              <div key={dateKey} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {/* Date header */}
                <div className="bg-[#1a2744] px-5 py-3">
                  <p className="text-sm font-semibold text-white">{formatDateFull(dateKey)}</p>
                </div>

                {/* Events on this date */}
                <div className="divide-y divide-gray-100">
                  {eventsByDate[dateKey].map((event) => {
                    const isAvailable = (availability[event.id] ?? "AVAILABLE") === "AVAILABLE"
                    return (
                      <div key={event.id} className="px-5 py-4 flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-medium text-gray-900">{event.namaEvent}</p>
                            {event.isLive && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white uppercase tracking-wide">
                                LIVE
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">{event.waktu}</p>
                        </div>
                        <button
                          onClick={() => toggleEvent(event.id)}
                          className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                            isAvailable
                              ? "bg-green-100 text-green-700 hover:bg-green-200"
                              : "bg-red-100 text-red-700 hover:bg-red-200"
                          }`}
                        >
                          {isAvailable ? (
                            <>
                              <span>✓</span>
                              <span>Bisa</span>
                            </>
                          ) : (
                            <>
                              <span>✗</span>
                              <span>Tidak Bisa</span>
                            </>
                          )}
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}

            {/* Summary */}
            <div className="bg-[#1a2744]/5 border border-[#1a2744]/10 rounded-2xl px-5 py-4 text-center">
              <p className="text-sm text-gray-600">
                Anda tersedia untuk{" "}
                <span className="font-bold text-[#1a2744]">{availableCount}</span> dari{" "}
                <span className="font-bold text-[#1a2744]">{events.length}</span> ibadah
              </p>
            </div>

            {/* Submit button */}
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full bg-[#1a2744] text-white py-4 px-6 rounded-2xl text-base font-bold shadow-md hover:bg-[#243460] active:bg-[#111c33] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Menyimpan...
                </span>
              ) : (
                "Kirim Ketersediaan"
              )}
            </button>
          </div>
        )}

        {/* Placeholder when no member selected */}
        {!selectedMemberId && events.length > 0 && (
          <div className="text-center py-8 text-gray-400">
            <p className="text-sm">Pilih nama Anda untuk mengisi ketersediaan</p>
          </div>
        )}
      </div>
    </div>
  )
}
