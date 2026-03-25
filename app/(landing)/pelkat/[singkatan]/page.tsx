import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { pelkat } from "@/lib/data/pelkat";
import { AnimatedSection } from "@/components/landing/AnimatedSection";

type Props = {
  params: Promise<{ singkatan: string }>;
};

export async function generateStaticParams() {
  return pelkat.map(({ singkatan }) => ({ singkatan }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { singkatan } = await params;
  const item = pelkat.find(
    (p) => p.singkatan.toUpperCase() === singkatan.toUpperCase()
  );
  if (!item) {
    return { title: "Pelkat | GPIB Damai Sejahtera" };
  }
  return {
    title: `${item.nama} (${item.singkatan}) | GPIB Damai Sejahtera`,
    description: item.deskripsi,
  };
}

export default async function PelkatDetailPage({ params }: Props) {
  const { singkatan } = await params;
  const item = pelkat.find(
    (p) => p.singkatan.toUpperCase() === singkatan.toUpperCase()
  );

  if (!item) {
    notFound();
  }

  const roles = ["Ketua", "Wakil Ketua", "Sekretaris"];

  return (
    <div className="min-h-screen bg-white pt-20">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-12">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
          {/* Sidebar navigation */}
          <AnimatedSection>
            <aside className="lg:w-56 shrink-0">
              <p className="text-xs font-semibold text-gray-text uppercase tracking-widest mb-4">
                Pelayanan Kategorial
              </p>
              <nav className="flex flex-row flex-wrap gap-2 lg:flex-col lg:gap-1">
                {pelkat.map((p) => {
                  const isActive =
                    p.singkatan.toUpperCase() === singkatan.toUpperCase();
                  return (
                    <Link
                      key={p.id}
                      href={`/pelkat/${p.singkatan}`}
                      className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors ${
                        isActive
                          ? "bg-navy text-white font-semibold"
                          : "text-navy hover:bg-off-white"
                      }`}
                    >
                      {p.icon && (
                        <span className="relative w-5 h-5 shrink-0">
                          <Image
                            src={p.icon}
                            alt=""
                            fill
                            sizes="20px"
                            className="object-contain"
                          />
                        </span>
                      )}
                      <span>{p.singkatan}</span>
                      {!isActive && <span className="hidden lg:inline text-gray-text text-xs">— {p.nama}</span>}
                      {isActive && <span className="hidden lg:inline text-xs opacity-80">— {p.nama}</span>}
                    </Link>
                  );
                })}
              </nav>
            </aside>
          </AnimatedSection>

          {/* Main content */}
          <main className="flex-1 min-w-0 space-y-16">
            {/* Header section */}
            <AnimatedSection>
              <section>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-6">
                  {item.icon && (
                    <div className="relative w-36 h-36 shrink-0">
                      <Image
                        src={item.icon}
                        alt={`Logo ${item.nama}`}
                        fill
                        sizes="144px"
                        className="object-contain"
                      />
                    </div>
                  )}
                  <div>
                    <Badge className="bg-navy text-white hover:bg-navy px-4 py-1.5 text-xs font-medium rounded-full mb-3">
                      {item.singkatan}
                    </Badge>
                    <h1 className="font-serif text-3xl sm:text-4xl font-medium text-navy leading-tight mb-2">
                      {item.nama}
                    </h1>
                    <p className="text-gray-text text-base leading-relaxed max-w-xl">
                      {item.deskripsi}
                    </p>
                    <div className="mt-3">
                      <Badge
                        variant="outline"
                        className="border-gold/40 text-gold bg-gold/5 text-xs px-3 py-1"
                      >
                        {item.targetGroup}
                      </Badge>
                    </div>
                  </div>
                </div>
              </section>
            </AnimatedSection>

            {/* Jadwal / Ibadah section */}
            <AnimatedSection delay={0.1}>
              <section>
                <h2 className="font-serif text-2xl font-medium text-navy mb-4">
                  {item.jadwal
                    ? item.jadwal
                    : `Ibadah Hari Minggu ${item.nama}`}
                </h2>
                <div className="rounded-2xl border border-gray-line bg-off-white p-6 max-w-lg">
                  <p className="text-gray-text text-sm leading-relaxed">
                    {item.jadwal ? (
                      item.jadwal
                    ) : (
                      <>
                        Ibadah Hari Minggu{" "}
                        <span className="font-semibold text-navy">
                          {item.nama}
                        </span>{" "}
                        diselenggarakan bersama ibadah umum setiap hari Minggu.
                        Silakan lihat jadwal lengkap di halaman{" "}
                        <Link
                          href="/jadwal"
                          className="text-gold hover:underline font-medium"
                        >
                          Jadwal Pelayanan
                        </Link>
                        .
                      </>
                    )}
                  </p>
                </div>
              </section>
            </AnimatedSection>

            {/* Arti Logo section */}
            <AnimatedSection delay={0.15}>
              <section>
                <h2 className="font-serif text-2xl font-medium text-navy mb-4">
                  Arti Logo
                </h2>
                <div className="flex flex-col sm:flex-row gap-6 items-start">
                  {item.icon && (
                    <div className="relative w-24 h-24 shrink-0">
                      <Image
                        src={item.icon}
                        alt={`Logo ${item.nama}`}
                        fill
                        sizes="96px"
                        className="object-contain"
                      />
                    </div>
                  )}
                  <div className="rounded-2xl border border-gray-line bg-off-white p-6 flex-1">
                    <p className="text-gray-text text-sm italic">
                      Informasi mengenai arti logo {item.nama} akan ditambahkan.
                    </p>
                  </div>
                </div>
              </section>
            </AnimatedSection>

            {/* Pengurus & Pelayan section */}
            <AnimatedSection delay={0.2}>
              <section>
                <h2 className="font-serif text-2xl font-medium text-navy mb-1">
                  Pengurus &amp; Pelayan
                </h2>
                <p className="text-gray-text text-sm mb-6">Masa Bakti 2022–2027</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl">
                  {roles.map((role) => (
                    <div
                      key={role}
                      className="rounded-2xl border border-gray-line bg-white p-5 flex flex-col items-center text-center gap-3"
                    >
                      <div className="w-14 h-14 rounded-full bg-navy/10 flex items-center justify-center">
                        <span className="text-navy font-bold text-lg">
                          {role.slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-text font-medium uppercase tracking-wide mb-1">
                          {role}
                        </p>
                        <p className="text-navy font-semibold text-sm">—</p>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-gray-text text-xs mt-4 italic">
                  Data pengurus akan ditambahkan segera.
                </p>
              </section>
            </AnimatedSection>

            {/* About / Bottom section */}
            <AnimatedSection delay={0.25}>
              <section className="border-t border-gray-line pt-12">
                <h2 className="font-serif text-2xl font-medium text-navy mb-4">
                  Tentang {item.nama}
                </h2>
                <p className="text-gray-text text-base leading-relaxed max-w-2xl">
                  {item.deskripsi}
                </p>
                {item.kontakPerson && (
                  <p className="text-gray-text text-sm mt-4">
                    Kontak:{" "}
                    <span className="font-medium text-navy">
                      {item.kontakPerson}
                    </span>
                  </p>
                )}
              </section>
            </AnimatedSection>
          </main>
        </div>
      </div>
    </div>
  );
}
