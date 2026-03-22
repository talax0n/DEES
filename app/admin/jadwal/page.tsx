import type { Metadata } from "next"
import { jadwalIbadah } from "@/lib/data"

export const metadata: Metadata = {
  title: "Jadwal Ibadah | Admin",
}

export default function AdminJadwalPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Jadwal Ibadah</h1>
          <p className="text-muted-foreground">Kelola jadwal ibadah jemaat</p>
        </div>
        {/* TODO: Add button → opens JadwalForm dialog */}
        <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          + Tambah Jadwal
        </button>
      </div>

      <div className="rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-medium">Nama Ibadah</th>
              <th className="px-4 py-3 text-left font-medium">Waktu</th>
              <th className="px-4 py-3 text-left font-medium">Metode</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {jadwalIbadah.map((jadwal) => (
              <tr key={jadwal.id} className="border-b last:border-0 hover:bg-muted/25">
                <td className="px-4 py-3 font-medium">{jadwal.jenis}</td>
                <td className="px-4 py-3">{jadwal.waktu}</td>
                <td className="px-4 py-3">{jadwal.metode}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                    Aktif
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {/* TODO: Connect to JadwalForm dialog */}
                    <button className="text-xs text-blue-600 hover:underline">Edit</button>
                    <button className="text-xs text-red-600 hover:underline">Hapus</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
