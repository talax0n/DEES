import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Calendar, Download } from "lucide-react";
import { AnimatedSection } from "@/components/landing/AnimatedSection";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Jadwal Tim Multimedia | GPIB Damai Sejahtera",
  description: "Jadwal pelayanan tim multimedia GPIB Damai Sejahtera.",
};

const ROLE_LABELS: Record<string, string> = {
  SLD: "Slide",
  SND: "Sound",
  STR: "Streaming",
  CAM: "Kamera",
};

function formatTanggal(date: Date | string) {
  return new Date(date).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

async function getData() {
  try {
    const period = await db.schedulePeriod.findFirst({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      include: {
        events: {
          orderBy: [{ tanggal: "asc" }, { order: "asc" }],
          include: {
            assignments: {
              include: {
                member: { select: { nama: true } },
              },
            },
          },
        },
      },
    });
    return period;
  } catch (error) {
    console.error("DB fetch failed:", error);
    return null;
  }
}

export default async function JadwalMultimediaPage() {
  const period = await getData();

  type PeriodEvent = NonNullable<typeof period>["events"][number];

  // Group events by kategori
  const grouped: Record<string, PeriodEvent[]> = {};

  if (period) {
    for (const event of period.events) {
      if (!grouped[event.kategori]) {
        grouped[event.kategori] = [];
      }
      grouped[event.kategori].push(event);
    }
  }

  const kategoriList = Object.keys(grouped).sort();

  return (
    <div className="min-h-screen bg-white pt-20">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-12">
        {/* Header */}
        <AnimatedSection>
          <div className="mb-10">
            <Badge className="bg-navy text-white hover:bg-navy px-4 py-1.5 text-xs font-medium rounded-full mb-4">
              Tim Multimedia
            </Badge>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-navy">
              Jadwal Tim Multimedia
            </h1>
            {period ? (
              <p className="text-gray-text mt-3 text-base max-w-xl">
                {period.nama}
              </p>
            ) : (
              <p className="text-gray-text mt-3 text-base max-w-xl">
                Jadwal pelayanan tim multimedia GPIB Damai Sejahtera.
              </p>
            )}
          </div>
        </AnimatedSection>

        {/* No published schedule */}
        {!period && (
          <AnimatedSection delay={0.1}>
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 rounded-full bg-navy/5 flex items-center justify-center mb-4">
                <Calendar className="w-8 h-8 text-navy/30" />
              </div>
              <p className="text-gray-text text-lg font-medium">
                Jadwal pelayanan multimedia belum tersedia.
              </p>
              <p className="text-gray-text/70 text-sm mt-1">
                Jadwal akan ditampilkan setelah dipublikasikan oleh admin.
              </p>
            </div>
          </AnimatedSection>
        )}

        {/* Schedule tables grouped by kategori */}
        {period && (
          <>
            {kategoriList.map((kategori, idx) => (
              <AnimatedSection key={kategori} delay={idx * 0.1}>
                <div className="mb-12">
                  <h2 className="font-serif text-xl sm:text-2xl font-medium text-navy mb-1">
                    {kategori}
                  </h2>
                  <div className="w-12 h-0.5 bg-gold mb-5" />
                  <div className="overflow-x-auto rounded-2xl border border-gray-line">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-navy/5 text-navy">
                          <th className="text-left px-4 py-3 font-medium whitespace-nowrap">
                            Tanggal
                          </th>
                          <th className="text-left px-4 py-3 font-medium whitespace-nowrap">
                            Waktu
                          </th>
                          <th className="text-left px-4 py-3 font-medium">
                            Pelayan
                          </th>
                          <th className="text-left px-4 py-3 font-medium whitespace-nowrap">
                            Role
                          </th>
                          <th className="text-left px-4 py-3 font-medium">
                            Keterangan
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-line">
                        {grouped[kategori].flatMap((event) => {
                          if (event.assignments.length === 0) {
                            return [
                              <tr
                                key={event.id}
                                className="hover:bg-navy/[0.02] transition-colors"
                              >
                                <td className="px-4 py-3 text-gray-text whitespace-nowrap">
                                  {formatTanggal(event.tanggal)}
                                </td>
                                <td className="px-4 py-3 text-gray-text whitespace-nowrap">
                                  {event.waktu}
                                </td>
                                <td className="px-4 py-3 text-gray-text italic opacity-50" colSpan={2}>
                                  Belum ditentukan
                                </td>
                                <td className="px-4 py-3 text-gray-text">
                                  {event.keterangan || "—"}
                                </td>
                              </tr>,
                            ];
                          }

                          return event.assignments.map((assignment, aIdx) => (
                            <tr
                              key={`${event.id}-${assignment.id}`}
                              className="hover:bg-navy/[0.02] transition-colors"
                            >
                              {aIdx === 0 && (
                                <>
                                  <td
                                    className="px-4 py-3 text-gray-text whitespace-nowrap align-top"
                                    rowSpan={event.assignments.length}
                                  >
                                    {formatTanggal(event.tanggal)}
                                  </td>
                                  <td
                                    className="px-4 py-3 text-gray-text whitespace-nowrap align-top"
                                    rowSpan={event.assignments.length}
                                  >
                                    {event.waktu}
                                  </td>
                                </>
                              )}
                              <td className="px-4 py-3 text-navy font-medium">
                                {assignment.member.nama}
                              </td>
                              <td className="px-4 py-3 text-gray-text whitespace-nowrap">
                                {ROLE_LABELS[assignment.role] ?? assignment.role}
                              </td>
                              {aIdx === 0 && (
                                <td
                                  className="px-4 py-3 text-gray-text align-top"
                                  rowSpan={event.assignments.length}
                                >
                                  {event.keterangan || "—"}
                                </td>
                              )}
                            </tr>
                          ));
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </AnimatedSection>
            ))}

            {/* Download PDF button */}
            <AnimatedSection delay={kategoriList.length * 0.1}>
              <div className="flex justify-end pt-4">
                <Link
                  href={`/api/scheduler/periods/${period.id}/export`}
                  className="inline-flex items-center gap-2 rounded-full bg-navy px-6 py-2.5 text-sm font-medium text-white hover:bg-navy/90 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                </Link>
              </div>
            </AnimatedSection>
          </>
        )}
      </div>
    </div>
  );
}
