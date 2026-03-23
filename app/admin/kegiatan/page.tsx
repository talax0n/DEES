"use client"

import { useState } from "react"
import Link from "next/link"
import { kegiatan } from "@/lib/data"
import { PageHeader } from "@/components/admin/PageHeader"
import { DeleteDialog } from "@/components/admin/DeleteDialog"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type Kegiatan = {
  id: string
  judul: string
  tanggal: string
  kategori: string
  featured: boolean
  slug: string
}

const kategoriColor: Record<string, string> = {
  Ibadah: "bg-blue-100 text-blue-700",
  Sosial: "bg-green-100 text-green-700",
  Pelkat: "bg-purple-100 text-purple-700",
}

export default function AdminKegiatanPage() {
  const [data, setData] = useState<Kegiatan[]>(kegiatan)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  function openDelete(id: string) {
    setDeleteId(id)
    setDeleteOpen(true)
  }

  function handleDelete() {
    if (!deleteId) return
    // TODO: Call DELETE /api/kegiatan/:id
    setData((prev) => prev.filter((k) => k.id !== deleteId))
    setDeleteId(null)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kegiatan Pelayanan"
        description="Kelola kegiatan dan acara gereja"
        action={
          <Button asChild className="bg-navy text-white hover:bg-navy/90">
            <Link href="/admin/kegiatan/new">+ Buat Kegiatan</Link>
          </Button>
        }
      />

      <div className="rounded-lg border bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead>Judul</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-24">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.judul}</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      kategoriColor[item.kategori] ?? "bg-muted text-muted-foreground"
                    }`}
                  >
                    {item.kategori}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground">{item.tanggal}</TableCell>
                <TableCell>
                  {item.featured ? (
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                      Published
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                      Draft
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Link
                      href={`/admin/kegiatan/${item.id}`}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Edit
                    </Link>
                    <button
                      className="text-xs text-red-600 hover:underline"
                      onClick={() => openDelete(item.id)}
                    >
                      Hapus
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  Belum ada kegiatan.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDelete}
        title="Hapus Kegiatan?"
        description="Kegiatan ini akan dihapus permanen beserta semua datanya. Tindakan ini tidak dapat dibatalkan."
      />
    </div>
  )
}
