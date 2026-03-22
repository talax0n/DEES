import type { Metadata } from "next";
import { Activities } from "@/components/landing/Activities";

export const metadata: Metadata = {
  title: "Kegiatan Pelayanan",
  description: "Kegiatan dan aktivitas pelayanan GPIB Damai Sejahtera.",
};

export default function KegiatanPage() {
  return (
    <div className="pt-20">
      <div className="container mx-auto px-4 py-12">
        <h1 className="font-serif text-4xl text-navy mb-8">Kegiatan Pelayanan</h1>
        {/* TODO: Full activity grid with filter, expand to full page */}
        <Activities />
      </div>
    </div>
  );
}
