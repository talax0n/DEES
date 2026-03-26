// Scaffold for daily reminders via WhatsApp webhook
export async function sendDailyReminders() {
  // 1. Find all assignments for tomorrow
  // 2. Group by member
  // 3. For each member with phone:
  //    - Format reminder message
  //    - POST to webhook with type: 'REMINDER', targets: [member.phone]
  // TODO: Set up cron job to call this daily at 18:00 WIB

  // Implementation scaffold:
  const db = (await import('@/lib/db')).db
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)
  const dayAfter = new Date(tomorrow)
  dayAfter.setDate(dayAfter.getDate() + 1)

  const assignments = await db.scheduleAssignment.findMany({
    where: { event: { tanggal: { gte: tomorrow, lt: dayAfter } } },
    include: { member: true, event: true },
  })

  // Group by member
  const byMember = new Map<string, typeof assignments>()
  for (const a of assignments) {
    const key = a.memberId
    if (!byMember.has(key)) byMember.set(key, [])
    byMember.get(key)!.push(a)
  }

  // TODO: send via webhook
  console.log(`[Reminder] Found ${assignments.length} assignments for tomorrow`)
}
