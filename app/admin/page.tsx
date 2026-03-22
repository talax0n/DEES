import type { Metadata } from "next"
import { jadwalIbadah } from "@/lib/data"
import { unduhan } from "@/lib/data"
import { kegiatan } from "@/lib/data"

export const metadata: Metadata = {
  title: "Dashboard | Admin GPIB Damai Sejahtera",
}

export default function AdminDashboardPage() {
  const stats = [
    { label: "Total Jadwal", value: jadwalIbadah.length, description: "Jadwal ibadah aktif" },
    { label: "Total Unduhan", value: unduhan.length, description: "File TAIB & Warta" },
    { label: "Total Kegiatan", value: kegiatan.length, description: "Kegiatan pelayanan" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Selamat datang di panel admin GPIB Damai Sejahtera</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-lg border bg-card p-6">
            <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
            <p className="mt-2 text-3xl font-bold">{stat.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{stat.description}</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-lg font-semibold mb-4">Aktivitas Terbaru</h2>
        {/* TODO: Real-time activity log from database */}
        <p className="text-sm text-muted-foreground">Tidak ada aktivitas terbaru.</p>
      </div>
    </div>
  )
}
