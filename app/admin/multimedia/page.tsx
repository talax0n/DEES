"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/components/providers/AuthProvider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, CalendarClock, Clock, Plus, ArrowRight } from "lucide-react"

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft", COLLECTING: "Mengumpulkan", CLOSED: "Ditutup",
  REVIEW: "Tinjauan", PUBLISHED: "Diterbitkan"
}
const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  COLLECTING: "bg-blue-100 text-blue-700",
  CLOSED: "bg-yellow-100 text-yellow-700",
  REVIEW: "bg-orange-100 text-orange-700",
  PUBLISHED: "bg-green-100 text-green-700",
}
const INDONESIAN_MONTHS = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']

export default function MultimediaDashboard() {
  const { isMultimediaAdmin, isLoading } = useAuth()
  const router = useRouter()
  const [members, setMembers] = useState<any[]>([])
  const [periods, setPeriods] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && !isMultimediaAdmin) router.push('/admin')
  }, [isLoading, isMultimediaAdmin])

  useEffect(() => {
    Promise.all([
      fetch('/api/scheduler/members').then(r => r.json()),
      fetch('/api/scheduler/periods').then(r => r.json()),
    ]).then(([m, p]) => {
      setMembers(m.data ?? [])
      setPeriods(p.data ?? [])
      setLoading(false)
    })
  }, [])

  const activeStatuses = ['COLLECTING', 'REVIEW', 'PUBLISHED']
  const activePeriods = periods.filter(p => activeStatuses.includes(p.status))
  const collectingPeriods = periods.filter(p => p.status === 'COLLECTING')
  const currentPeriod = periods.find(p => p.status !== 'DRAFT') ?? periods[0]

  if (loading) return <div className="flex items-center justify-center h-48"><div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Multimedia Dashboard</h2>
          <p className="text-muted-foreground">Kelola jadwal tim multimedia</p>
        </div>
        <Button asChild>
          <Link href="/admin/multimedia/schedules"><Plus className="h-4 w-4 mr-2" />Buat Jadwal Baru</Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2"><Users className="h-4 w-4" />Total Anggota</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{members.length}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2"><CalendarClock className="h-4 w-4" />Jadwal Aktif</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{activePeriods.length}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2"><Clock className="h-4 w-4" />Menunggu Ketersediaan</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{collectingPeriods.length}</p></CardContent>
        </Card>
      </div>

      {/* Current period */}
      {currentPeriod && (
        <Card>
          <CardHeader>
            <CardTitle>Jadwal Saat Ini</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{currentPeriod.nama}</p>
                <p className="text-sm text-muted-foreground">{INDONESIAN_MONTHS[currentPeriod.bulan-1]} {currentPeriod.tahun}</p>
                <Badge className={`mt-1 ${STATUS_COLORS[currentPeriod.status]}`}>{STATUS_LABELS[currentPeriod.status]}</Badge>
              </div>
              <Button variant="outline" asChild>
                <Link href={`/admin/multimedia/schedules/${currentPeriod.id}`}>Kelola <ArrowRight className="h-4 w-4 ml-1" /></Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent periods */}
      <Card>
        <CardHeader><CardTitle>Semua Jadwal</CardTitle></CardHeader>
        <CardContent>
          {periods.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-4">Belum ada jadwal. <Link href="/admin/multimedia/schedules" className="text-primary underline">Buat jadwal pertama</Link>.</p>
          ) : (
            <div className="space-y-2">
              {periods.slice(0, 5).map(p => (
                <Link key={p.id} href={`/admin/multimedia/schedules/${p.id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors border border-border/40">
                  <div>
                    <p className="font-medium text-sm">{p.nama}</p>
                    <p className="text-xs text-muted-foreground">{p._count?.events ?? 0} event</p>
                  </div>
                  <Badge className={`text-xs ${STATUS_COLORS[p.status]}`}>{STATUS_LABELS[p.status]}</Badge>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
