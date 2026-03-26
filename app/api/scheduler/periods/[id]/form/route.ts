import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireMultimediaAdmin } from "@/lib/auth"

interface Params {
  params: Promise<{ id: string }>
}

export async function GET(_request: NextRequest, { params }: Params) {
  const { response } = await requireMultimediaAdmin()
  if (response) return response
  const { id } = await params
  try {
    const period = await db.schedulePeriod.findUnique({
      where: { id },
      select: { id: true, formEnabled: true, formToken: true, status: true },
    })
    if (!period) {
      return NextResponse.json({ success: false, message: "Periode tidak ditemukan" }, { status: 404 })
    }
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
    return NextResponse.json({
      success: true,
      data: {
        formEnabled: period.formEnabled,
        status: period.status,
        formToken: period.formToken,
        formUrl: period.formToken ? `${baseUrl}/availability/${period.formToken}` : null,
      },
    })
  } catch {
    return NextResponse.json({ success: false, message: "Gagal memuat status form" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: Params) {
  const { response } = await requireMultimediaAdmin()
  if (response) return response
  const { id } = await params
  try {
    const body = await request.json()
    const { action } = body as { action: 'enable' | 'disable' }

    if (action === 'enable') {
      const token = crypto.randomUUID()
      const period = await db.schedulePeriod.update({
        where: { id },
        data: { formToken: token, formEnabled: true, status: 'COLLECTING' },
      })
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
      return NextResponse.json({
        success: true,
        data: {
          formToken: period.formToken,
          formUrl: `${baseUrl}/availability/${period.formToken}`,
          status: period.status,
          formEnabled: period.formEnabled,
        },
        message: "Form berhasil diaktifkan",
      })
    }

    if (action === 'disable') {
      const period = await db.schedulePeriod.update({
        where: { id },
        data: { formEnabled: false, status: 'CLOSED' },
      })
      return NextResponse.json({
        success: true,
        data: {
          formEnabled: period.formEnabled,
          status: period.status,
          formToken: period.formToken,
        },
        message: "Form berhasil dinonaktifkan",
      })
    }

    return NextResponse.json({ success: false, message: "Action tidak valid. Gunakan 'enable' atau 'disable'" }, { status: 400 })
  } catch {
    return NextResponse.json({ success: false, message: "Gagal memperbarui status form" }, { status: 500 })
  }
}
