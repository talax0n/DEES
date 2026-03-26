import { NextRequest, NextResponse } from "next/server"
import { requireMultimediaAdmin } from "@/lib/auth"

const MONTH_MAP: Record<string, number> = {
  januari: 1, februari: 2, maret: 3, april: 4, mei: 5, juni: 6,
  juli: 7, agustus: 8, september: 9, oktober: 10, november: 11, desember: 12,
}

interface ParsedEvent {
  namaEvent: string
  tanggal: string // ISO date string YYYY-MM-DD
  waktu: string   // e.g. "06.00"
  kategori: string
  isLive: boolean
  requiredRoles: string[]
  keterangan?: string
}

function parseWaktu(raw: string): string[] {
  // Normalize separators: "dan", "&", ","
  const normalized = raw
    .replace(/\bdan\b/gi, ',')
    .replace(/&/g, ',')
    .split(',')
    .map(t => t.trim())
    .filter(t => /\d/.test(t))
    .map(t => {
      // Extract time pattern like 06.00 or 06:00
      const match = t.match(/(\d{1,2})[.:](\d{2})/)
      return match ? `${match[1].padStart(2, '0')}.${match[2]}` : t.trim()
    })
    .filter(Boolean)
  return normalized
}

function parseDate(dateStr: string): string | null {
  // Expected formats: "01 April 2026", "1 April 2026"
  const match = dateStr.trim().match(/(\d{1,2})\s+(\w+)\s+(\d{4})/)
  if (!match) return null
  const day = parseInt(match[1], 10)
  const monthName = match[2].toLowerCase()
  const year = parseInt(match[3], 10)
  const month = MONTH_MAP[monthName]
  if (!month) return null
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function inferKategori(name: string): string {
  const lower = name.toLowerCase()
  if (lower.includes('pelkat')) return 'Ibadah Pelkat'
  if (lower.includes('ibadah raya') || lower.includes('hari minggu')) return 'Ibadah Raya'
  return 'Kegiatan Khusus'
}

function inferRoles(isLive: boolean): string[] {
  const base = ['SLD', 'SND']
  return isLive ? [...base, 'STR', 'CAM'] : base
}

function isLiveTime(waktu: string): boolean {
  return waktu === '09.00' || waktu === '09:00'
}

export async function POST(request: NextRequest) {
  const { response } = await requireMultimediaAdmin()
  if (response) return response

  try {
    const body = await request.json()
    const { text } = body as { text: string }

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ success: false, message: "Field 'text' wajib diisi" }, { status: 400 })
    }

    const warnings: string[] = []
    const events: ParsedEvent[] = []

    // Split by numbered lines: 1. 2. 3. etc.
    const lines = text.split(/\n(?=\d+\.)/).map(l => l.trim()).filter(Boolean)

    for (const line of lines) {
      // Remove leading numbering like "1. " or "1) "
      const stripped = line.replace(/^\d+[.)]\s*/, '').trim()

      // Try to find date after "tanggal" or "tgl"
      const dateKeywordMatch = stripped.match(/\b(?:tanggal|tgl)\s+(.+?)(?=\bjam\b|$)/i)
      let dateStr: string | null = null
      let namaPart = stripped
      let afterDate = stripped

      if (dateKeywordMatch) {
        // name is everything before "tanggal"
        const beforeKeyword = stripped.substring(0, dateKeywordMatch.index).trim()
        namaPart = beforeKeyword.replace(/[,\s]+$/, '').trim()
        dateStr = parseDate(dateKeywordMatch[1].trim())
        afterDate = stripped.substring((dateKeywordMatch.index ?? 0) + dateKeywordMatch[0].length)
      } else {
        // Try pattern match for date directly in string
        const directDate = stripped.match(/(\d{1,2}\s+\w+\s+\d{4})/)
        if (directDate) {
          dateStr = parseDate(directDate[1])
          namaPart = stripped.substring(0, directDate.index).trim().replace(/[,\s]+$/, '')
          afterDate = stripped.substring((directDate.index ?? 0) + directDate[0].length)
        }
      }

      if (!dateStr) {
        warnings.push(`Tidak dapat mengurai tanggal dari: "${stripped}"`)
        continue
      }

      // Extract times after "jam"
      const jamMatch = afterDate.match(/\bjam\s+(.+?)(?:\s+wib|\s+wit|\s+wita|$)/i)
      let waktuList: string[] = []
      if (jamMatch) {
        waktuList = parseWaktu(jamMatch[1])
      }

      if (waktuList.length === 0) {
        warnings.push(`Tidak dapat mengurai jam dari: "${stripped}"`)
        // Still create one event without time
        const kategori = inferKategori(namaPart)
        const live = false
        events.push({
          namaEvent: namaPart,
          tanggal: dateStr,
          waktu: '',
          kategori,
          isLive: live,
          requiredRoles: inferRoles(live),
        })
        continue
      }

      // One event per time slot
      for (const waktu of waktuList) {
        const live = isLiveTime(waktu)
        const kategori = inferKategori(namaPart)
        events.push({
          namaEvent: namaPart,
          tanggal: dateStr,
          waktu,
          kategori,
          isLive: live,
          requiredRoles: inferRoles(live),
        })
      }
    }

    return NextResponse.json({ success: true, events, warnings })
  } catch {
    return NextResponse.json({ success: false, message: "Gagal mengurai teks jadwal" }, { status: 500 })
  }
}
