import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireMultimediaAdmin } from "@/lib/auth"

export async function GET() {
  const { response } = await requireMultimediaAdmin()
  if (response) return response

  try {
    const settings = await db.appSettings.findMany()
    return NextResponse.json({ success: true, data: settings })
  } catch (error) {
    console.error('Get settings error:', error)
    return NextResponse.json({ success: false, message: "Gagal mengambil pengaturan" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  const { response } = await requireMultimediaAdmin()
  if (response) return response

  try {
    const body = await request.json()
    const { key, value } = body as { key: string; value: string }

    const setting = await db.appSettings.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    })

    return NextResponse.json({ success: true, data: setting, message: "Pengaturan berhasil disimpan" })
  } catch (error) {
    console.error('Update settings error:', error)
    return NextResponse.json({ success: false, message: "Gagal menyimpan pengaturan" }, { status: 500 })
  }
}
