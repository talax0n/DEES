import { Clock, FileDown, Camera, ArrowUpRight } from "lucide-react"
import { StatsCard } from "@/components/admin/StatsCard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { db } from "@/lib/db"

function formatDate(dateStr: string | Date) {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export const revalidate = 60;

export default async function AdminDashboardPage() {
  let totalJadwal = 0
  let totalUnduhan = 0
  let totalEvent = 0
  let recentDokumentasi: any[] = []
  let recentUnduhan: any[] = []

  try {
    const results = await Promise.all([
      db.jadwalIbadah.count({ where: { isActive: true } }),
      db.unduhan.count(),
      db.dokumentasiEvent.count(),
      db.dokumentasiEvent.findMany({
        take: 4,
        orderBy: { tanggal: "desc" },
        include: {
          _count: {
            select: { photos: true }
          }
        }
      }),
      db.unduhan.findMany({
        take: 4,
        orderBy: { tanggal: "desc" }
      })
    ])

    totalJadwal = results[0]
    totalUnduhan = results[1]
    totalEvent = results[2]
    recentDokumentasi = results[3]
    recentUnduhan = results[4]
  } catch (error) {
    console.error("DB fetch failed for admin dashboard:", error)
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard Overview</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Pantau aktivitas dan statistik website GPIB Damai Sejahtera
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="hidden md:flex bg-background/50 backdrop-blur-sm border-border/40 hover:bg-muted/50">
            <FileDown className="w-4 h-4 mr-2" />
            Unduh Laporan
          </Button>
          <Button asChild className="shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30">
            <Link href="/admin/jadwal">
              Kelola Jadwal
              <ArrowUpRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Bento Grid Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          icon={Clock}
          value={totalJadwal}
          label="Total Jadwal"
          description="Jadwal ibadah aktif bulan ini"
          trend="+2"
          trendUp={true}
        />
        <StatsCard
          icon={FileDown}
          value={totalUnduhan}
          label="Total Unduhan"
          description="File TAIB & Warta Jemaat"
          trend="+5"
          trendUp={true}
        />
        <StatsCard
          icon={Camera}
          value={totalEvent}
          label="Total Event"
          description="Album dokumentasi kegiatan"
          trend="+1"
          trendUp={true}
        />
      </div>

      {/* Bento Grid Content */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Dokumentasi Terbaru */}
        <Card className="flex flex-col bg-background/50 backdrop-blur-xl border-border/40 shadow-[0_4px_24px_-12px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_32px_-12px_rgba(0,0,0,0.1)] transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div className="space-y-1">
              <CardTitle className="text-lg font-semibold tracking-tight">Dokumentasi Terbaru</CardTitle>
              <p className="text-sm text-muted-foreground">Album foto yang baru diunggah</p>
            </div>
            <Button variant="ghost" size="sm" className="text-xs text-primary h-8 px-3 rounded-full hover:bg-primary/10" asChild>
              <Link href="/admin/dokumentasi">Lihat Semua</Link>
            </Button>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="space-y-4">
              {recentDokumentasi.map((item) => (
                <div
                  key={item.id}
                  className="group flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors border border-transparent hover:border-border/40"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 border border-primary/10 group-hover:scale-105 transition-transform">
                      <Camera className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate text-foreground">{item.namaAcara}</p>
                      <span className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                        {item._count.photos} foto <span className="w-1 h-1 rounded-full bg-muted-foreground/30" /> {formatDate(item.tanggal)}
                      </span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" asChild>
                    <Link href={`/admin/dokumentasi/${item.id}`}>
                      <ArrowUpRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              ))}
              {recentDokumentasi.length === 0 && (
                <div className="text-center py-4 text-sm text-muted-foreground">Belum ada dokumentasi</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Unduhan Terbaru */}
        <Card className="flex flex-col bg-background/50 backdrop-blur-xl border-border/40 shadow-[0_4px_24px_-12px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_32px_-12px_rgba(0,0,0,0.1)] transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div className="space-y-1">
              <CardTitle className="text-lg font-semibold tracking-tight">Unduhan Terbaru</CardTitle>
              <p className="text-sm text-muted-foreground">File TAIB & Warta yang diunggah</p>
            </div>
            <Button variant="ghost" size="sm" className="text-xs text-primary h-8 px-3 rounded-full hover:bg-primary/10" asChild>
              <Link href="/admin/unduhan">Lihat Semua</Link>
            </Button>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="space-y-4">
              {recentUnduhan.map((item) => (
                <div
                  key={item.id}
                  className="group flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors border border-transparent hover:border-border/40"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 border border-primary/10 group-hover:scale-105 transition-transform">
                      <FileDown className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate text-foreground">{item.judul}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span
                          className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                            item.tipe === "TAIB"
                              ? "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                              : "bg-purple-500/10 text-purple-500 border border-purple-500/20"
                          }`}
                        >
                          {item.tipe === "TAIB" ? "Tata Ibadah" : "Warta"}
                        </span>
                        <span className="text-[10px] text-muted-foreground">{formatDate(item.tanggal)}</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" asChild>
                    <Link href={item.fileUrl} target="_blank" rel="noopener noreferrer">
                      <ArrowUpRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              ))}
              {recentUnduhan.length === 0 && (
                <div className="text-center py-4 text-sm text-muted-foreground">Belum ada unduhan</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
