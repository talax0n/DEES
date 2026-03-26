import { NextRequest, NextResponse } from "next/server"
import { sendDailyReminders } from "@/lib/scheduler/reminder"

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('Authorization')
  const expected = `Bearer ${process.env.CRON_SECRET}`

  if (!process.env.CRON_SECRET || authHeader !== expected) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
  }

  try {
    await sendDailyReminders()
    return NextResponse.json({ success: true, message: "Reminders sent" })
  } catch (error) {
    console.error('Cron reminder error:', error)
    return NextResponse.json({ success: false, message: "Gagal mengirim reminder" }, { status: 500 })
  }
}
