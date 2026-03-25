import type { Metadata } from "next";
import { db } from "@/lib/db";
import { DokumentasiClient } from "./DokumentasiClient";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Dokumentasi Kegiatan | GPIB Damai Sejahtera",
  description:
    "Dokumentasi foto kegiatan dan acara GPIB Damai Sejahtera. Temukan kenangan dari berbagai momen pelayanan kami.",
};

async function getData() {
  try {
    const events = await db.dokumentasiEvent.findMany({
      orderBy: { tanggal: "desc" },
      include: {
        photos: { orderBy: { order: "asc" } },
        _count: { select: { photos: true } },
      },
    });
    return events.map((e) => ({
      id: e.id,
      namaAcara: e.namaAcara,
      tanggal: e.tanggal.toISOString(),
      coverPhoto: e.coverPhoto ?? (e.photos[0]?.imageUrl ?? null),
      totalFoto: e._count.photos,
      photos: e.photos.map((p) => ({
        id: p.id,
        imageUrl: p.imageUrl,
        caption: p.caption ?? null,
      })),
    }));
  } catch (error) {
    console.error("DB fetch failed:", error);
    return [];
  }
}

export default async function DokumentasiPage() {
  const events = await getData();
  return (
    <div className="min-h-screen bg-white pt-20">
      <DokumentasiClient events={events} />
    </div>
  );
}
