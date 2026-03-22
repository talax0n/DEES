import type { Metadata } from "next";
import { Programs } from "@/components/landing/Programs";

export const metadata: Metadata = {
  title: "Jadwal Pelayanan",
  description: "Jadwal ibadah dan pelayanan kategorial GPIB Damai Sejahtera.",
};

export default function JadwalPage() {
  return (
    <div className="pt-20">
      <div className="container mx-auto px-4 py-12">
        <h1 className="font-serif text-4xl text-navy mb-8">Jadwal Pelayanan</h1>
        {/* TODO: Expand into full jadwal table + pelkat section */}
        <Programs />
      </div>
    </div>
  );
}
