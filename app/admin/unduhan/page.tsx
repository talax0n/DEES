import type { Metadata } from "next"
import { unduhan } from "@/lib/data"

export const metadata: Metadata = {
  title: "Unduhan | Admin",
}

export default function AdminUnduhanPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Unduhan</h1>
          <p className="text-muted-foreground">Kelola file TAIB dan Warta Jemaat</p>
        </div>
        {/* TODO: Add upload button → opens file upload dialog */}
        <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          + Upload File
        </button>
      </div>

      <div className="rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-medium">Judul</th>
              <th className="px-4 py-3 text-left font-medium">Tipe</th>
              <th className="px-4 py-3 text-left font-medium">Tanggal</th>
              <th className="px-4 py-3 text-left font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {unduhan.map((item) => (
              <tr key={item.id} className="border-b last:border-0 hover:bg-muted/25">
                <td className="px-4 py-3 font-medium">{item.judul}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      item.tipe === "tata-ibadah"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-purple-100 text-purple-700"
                    }`}
                  >
                    {item.tipe === "tata-ibadah" ? "Tata Ibadah" : "Warta"}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{item.tanggal}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <a
                      href={item.url}
                      className="text-xs text-blue-600 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Download
                    </a>
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
