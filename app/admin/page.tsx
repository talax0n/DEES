import { jadwalIbadah, unduhan, kegiatan } from "@/lib/data"
import { Clock, FileDown, CalendarDays } from "lucide-react"
import { StatsCard } from "@/components/admin/StatsCard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const kategoriColor: Record<string, string> = {
  Ibadah: "bg-blue-100 text-blue-700",
  Sosial: "bg-green-100 text-green-700",
  Pelkat: "bg-purple-100 text-purple-700",
}

export default function AdminDashboardPage() {
  const recentKegiatan = kegiatan.slice(0, 5)
  const recentUnduhan = unduhan.slice(0, 5)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Selamat datang di panel admin GPIB Damai Sejahtera
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard
          icon={Clock}
          value={jadwalIbadah.length}
          label="Total Jadwal"
          description="Jadwal ibadah aktif"
        />
        <StatsCard
          icon={FileDown}
          value={unduhan.length}
          label="Total Unduhan"
          description="File TAIB & Warta"
        />
        <StatsCard
          icon={CalendarDays}
          value={kegiatan.length}
          label="Total Kegiatan"
          description="Kegiatan pelayanan"
        />
      </div>

      {/* Recent sections */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Kegiatan Terbaru */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Kegiatan Terbaru</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="divide-y">
              {recentKegiatan.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{item.judul}</p>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium mt-1 ${
                        kategoriColor[item.kategori] ?? "bg-muted text-muted-foreground"
                      }`}
                    >
                      {item.kategori}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground ml-4 shrink-0">{item.tanggal}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Unduhan Terbaru */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Unduhan Terbaru</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="divide-y">
              {recentUnduhan.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{item.judul}</p>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium mt-1 ${
                        item.tipe === "tata-ibadah"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-purple-100 text-purple-700"
                      }`}
                    >
                      {item.tipe === "tata-ibadah" ? "Tata Ibadah" : "Warta"}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground ml-4 shrink-0">{item.tanggal}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
