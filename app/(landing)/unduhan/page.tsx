import type { Metadata } from "next";
import { db } from "@/lib/db";
import { UnduhanClient } from "./UnduhanClient";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Unduhan Tata Ibadah & Warta | GPIB Damai Sejahtera",
  description: "Download tata ibadah (TAIB) dan warta jemaat GPIB Damai Sejahtera.",
};

async function getData() {
  try {
    const data = await db.unduhan.findMany({ orderBy: { tanggal: "desc" } });
    return data.map((u) => ({
      id: u.id,
      judul: u.judul,
      tipe: u.tipe,
      tanggal: u.tanggal.toISOString(),
      fileUrl: u.fileUrl,
      fileSize: u.fileSize,
    }));
  } catch (error) {
    console.error("DB fetch failed:", error);
    return [];
  }
}

export default async function UnduhanPage() {
  const unduhan = await getData();
  return (
    <div className="min-h-screen bg-white pt-20">
      <UnduhanClient unduhan={unduhan} />
    </div>
  );
}
