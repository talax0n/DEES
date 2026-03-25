import { Hero } from "@/components/landing/Hero";
import { About } from "@/components/landing/About";
import { Programs } from "@/components/landing/Programs";
import { Downloads } from "@/components/landing/Downloads";
import { Dokumentasi } from "@/components/landing/Dokumentasi";
import { Contact } from "@/components/landing/Contact";
import { db } from "@/lib/db";

export const revalidate = 60;

async function getData() {
  try {
    const [jadwal, pelkatData, unduhanData, dokuData] = await Promise.all([
      db.jadwalIbadah.findMany({ where: { isActive: true }, orderBy: { waktu: "asc" } }),
      db.pelayananKategorial.findMany({ orderBy: { order: "asc" } }),
      db.unduhan.findMany({ orderBy: { tanggal: "desc" }, take: 8 }),
      db.dokumentasiEvent.findMany({
        orderBy: { tanggal: "desc" },
        take: 6,
        include: {
          _count: { select: { photos: true } },
          photos: { take: 1, orderBy: { order: "asc" } },
        },
      }),
    ]);
    return { jadwal, pelkat: pelkatData, unduhan: unduhanData, dokumentasi: dokuData };
  } catch (error) {
    console.error("DB fetch failed:", error);
    return { jadwal: [], pelkat: [], unduhan: [], dokumentasi: [] };
  }
}

export default async function HomePage() {
  const data = await getData();
  
  return (
    <div className="min-h-screen bg-white">
      <main>
        <Hero />
        <About />
        <Programs jadwal={data.jadwal as Parameters<typeof Programs>[0]["jadwal"]} pelkat={data.pelkat as Parameters<typeof Programs>[0]["pelkat"]} />
        <Downloads unduhan={data.unduhan as Parameters<typeof Downloads>[0]["unduhan"]} />
        <Dokumentasi events={data.dokumentasi as Parameters<typeof Dokumentasi>[0]["events"]} />
        <Contact />
      </main>
    </div>
  );
}
