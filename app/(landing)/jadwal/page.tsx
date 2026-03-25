import type { Metadata } from "next";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Wifi, WifiOff, ExternalLink, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { pelkat } from "@/lib/data/pelkat";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Jadwal Pelayanan | GPIB Damai Sejahtera",
  description: "Jadwal ibadah dan pelayanan kategorial GPIB Damai Sejahtera.",
};

async function getData() {
  try {
    const jadwal = await db.jadwalIbadah.findMany({ where: { isActive: true }, orderBy: { waktu: "asc" } });
    return { jadwal };
  } catch (error) {
    console.error("DB fetch failed:", error);
    return { jadwal: [] };
  }
}

function MetodeBadge({ metode }: { metode: string }) {
  const isOnline = metode === "online" || metode === "Daring" || metode.toLowerCase().includes("daring");
  const isHybrid = metode === "hybrid" || metode.toLowerCase().includes("hybrid") || metode.toLowerCase().includes("luring & live");
  return (
    <Badge
      variant="outline"
      className={
        isHybrid
          ? "border-purple-200 text-purple-700 bg-purple-50"
          : isOnline
          ? "border-blue-200 text-blue-700 bg-blue-50"
          : "border-green-200 text-green-700 bg-green-50"
      }
    >
      {isHybrid ? (
        <><Wifi className="w-3 h-3 mr-1" />Luring & Daring</>
      ) : isOnline ? (
        <><Wifi className="w-3 h-3 mr-1" />Daring</>
      ) : (
        <><WifiOff className="w-3 h-3 mr-1" />Luring</>
      )}
    </Badge>
  );
}

export default async function JadwalPage() {
  const { jadwal } = await getData();

  return (
    <div className="min-h-screen bg-white pt-20">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-12">
        {/* Header */}
        <div className="mb-10">
          <Badge className="bg-navy text-white hover:bg-navy px-4 py-1.5 text-xs font-medium rounded-full mb-4">
            Jadwal Pelayanan
          </Badge>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-navy">
            Jadwal Ibadah & Pelayanan
          </h1>
          <p className="text-gray-text mt-3 text-base max-w-xl">
            Jadwal lengkap ibadah dan pelayanan di GPIB Damai Sejahtera.
          </p>
        </div>

        {/* Jadwal Grid */}
        {jadwal.length === 0 ? (
          <div className="text-center py-20 text-gray-text">
            <Clock className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>Jadwal belum tersedia.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
            {(jadwal as Array<{
              id: string; namaIbadah: string; hari: string; waktu: string;
              lokasi: string; metode: string; linkStreaming?: string | null;
            }>).map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-gray-line bg-white p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3 className="font-semibold text-navy text-base leading-tight">{item.namaIbadah}</h3>
                  <MetodeBadge metode={item.metode} />
                </div>
                <div className="space-y-2 text-sm text-gray-text">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 shrink-0 text-gold" />
                    <span>{item.hari}, {item.waktu}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 shrink-0 text-gold" />
                    <span>{item.lokasi}</span>
                  </div>
                  {item.linkStreaming && (
                    <a
                      href={item.linkStreaming}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-red-500 hover:text-red-600 font-medium mt-1"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Live Streaming
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pelkat section */}
        <div className="border-t border-gray-line pt-12">
          <h2 className="font-serif text-2xl sm:text-3xl font-medium text-navy mb-2">
            Pelayanan Kategorial
          </h2>
          <p className="text-gray-text text-sm mb-8">
            Persekutuan pelayanan berdasarkan usia dan kategori jemaat.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pelkat.map((item) => (
              <Link
                key={item.id}
                href={`/pelkat/${item.singkatan}`}
                className="group rounded-2xl border border-gray-line bg-white p-5 flex gap-4 hover:shadow-md hover:border-navy/20 transition-all"
              >
                {item.icon ? (
                  <div className="relative w-16 h-16 shrink-0">
                    <Image
                      src={item.icon}
                      alt={`Logo ${item.nama}`}
                      fill
                      sizes="64px"
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 shrink-0 rounded-xl bg-navy/10 flex items-center justify-center">
                    <span className="text-navy font-bold text-lg">{item.singkatan ?? item.nama.slice(0, 2)}</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1">
                    <h3 className="font-semibold text-navy text-sm">{item.nama}</h3>
                    <ArrowUpRight className="w-4 h-4 text-gray-text opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5" />
                  </div>
                  {item.deskripsi && (
                    <p className="text-gray-text text-xs mt-1 line-clamp-3">{item.deskripsi}</p>
                  )}
                  {(item as any).jadwal && (
                    <p className="text-gold text-xs mt-2 font-medium">{(item as any).jadwal}</p>
                  )}
                  {(item as any).kontakPerson && (
                    <p className="text-gray-text text-xs mt-1">Kontak: {(item as any).kontakPerson}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
