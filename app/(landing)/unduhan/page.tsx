import type { Metadata } from "next";
import { Downloads } from "@/components/landing/Downloads";

export const metadata: Metadata = {
  title: "Unduhan",
  description: "Download tata ibadah (TAIB) dan warta jemaat GPIB Damai Sejahtera.",
};

export default function UnduhanPage() {
  return (
    <div className="pt-20">
      <div className="container mx-auto px-4 py-12">
        <h1 className="font-serif text-4xl text-navy mb-8">Unduhan</h1>
        {/* TODO: Add filter (TAIB/Warta/Semua) + pagination */}
        <Downloads />
      </div>
    </div>
  );
}
