import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { renderToBuffer } from "@react-pdf/renderer"
import { createElement, type ReactElement } from "react"
import type { DocumentProps } from "@react-pdf/renderer"
import { SchedulePDF } from "@/components/scheduler/SchedulePDF"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const period = await db.schedulePeriod.findUnique({
      where: { id },
      include: {
        events: {
          orderBy: [{ tanggal: 'asc' }, { order: 'asc' }],
          include: {
            assignments: {
              include: { member: true },
            },
          },
        },
      },
    })

    if (!period) {
      return NextResponse.json({ success: false, message: "Jadwal tidak ditemukan" }, { status: 404 })
    }

    const buffer = await renderToBuffer(
      createElement(SchedulePDF, { period }) as ReactElement<DocumentProps>
    )

    const filename = `Jadwal_Multimedia_${period.nama.replace(/\s+/g, '_')}.pdf`

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('PDF export error:', error)
    return NextResponse.json({ success: false, message: "Gagal membuat PDF" }, { status: 500 })
  }
}
