import type { Metadata } from "next"
import Link from "next/link"
import { kegiatan } from "@/lib/data"

export const metadata: Metadata = {
  title: "Kegiatan | Admin",
}

export default function AdminKegiatanPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Kegiatan Pelayanan</h1>
          <p className="text-muted-foreground">Kelola kegiatan dan acara gereja</p>
        </div>
        <Link
          href="/admin/kegiatan/new"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          + Tambah Kegiatan
        </Link>
      </div>

      <div className="rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-medium">Judul</th>
              <th className="px-4 py-3 text-left font-medium">Tanggal</th>
              <th className="px-4 py-3 text-left font-medium">Kategori</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {kegiatan.map((item) => (
              <tr key={item.id} className="border-b last:border-0 hover:bg-muted/25">
                <td className="px-4 py-3 font-medium">{item.judul}</td>
                <td className="px-4 py-3 text-muted-foreground">{item.tanggal}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                    {item.kategori}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                    Aktif
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Link
                      href={`/admin/kegiatan/${item.id}`}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Edit
                    </Link>
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
