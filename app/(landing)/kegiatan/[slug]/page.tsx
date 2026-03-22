import type { Metadata } from "next";
import { kegiatan } from "@/lib/data";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = kegiatan.find((k) => k.slug === slug);
  return {
    title: item?.judul ?? "Kegiatan",
    description: item?.deskripsi?.substring(0, 160),
  };
}

export default async function KegiatanDetailPage({ params }: Props) {
  const { slug } = await params;
  const item = kegiatan.find((k) => k.slug === slug);

  if (!item) {
    return (
      <div className="pt-20 container mx-auto px-4 py-12">
        <p className="text-gray-text">Kegiatan tidak ditemukan.</p>
      </div>
    );
  }

  return (
    <div className="pt-20 container mx-auto px-4 py-12">
      <h1 className="font-serif text-4xl text-navy mb-4">{item.judul}</h1>
      {/* TODO: Full kegiatan detail — description, date, gallery lightbox */}
      <p className="text-gray-text">{item.deskripsi}</p>
    </div>
  );
}
