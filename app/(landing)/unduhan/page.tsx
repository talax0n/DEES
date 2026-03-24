import type { Metadata } from "next";
import { db } from "@/lib/db";
import { unduhan as fallbackUnduhan } from "@/lib/data";
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
  } catch {
    return fallbackUnduhan.map((u) => ({
      id: u.id,
      judul: u.judul,
      tipe: u.tipe === "tata-ibadah" ? "TAIB" : "WARTA",
      tanggal: u.tanggal,
      fileUrl: u.url ?? "#",
      fileSize: null,
    }));
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
