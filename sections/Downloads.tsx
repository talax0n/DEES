"use client";

import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FileText, Download, ArrowUpRight } from "lucide-react";
import { unduhan } from "@/lib/data";

export function Downloads() {
  const tataIbadah = unduhan
    .filter((u) => u.tipe === "tata-ibadah")
    .slice(0, 4);
  const wartaJemaat = unduhan.filter((u) => u.tipe === "warta").slice(0, 4);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <section id="downloads" className="w-full py-20 lg:py-32 bg-off-white">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left column */}
          <div className="lg:col-span-4 space-y-6">
            {/* Section pill */}
            <Badge
              variant="default"
              className="bg-navy text-white hover:bg-navy px-4 py-1.5 text-xs font-medium rounded-full"
            >
              <span className="font-mono mr-2">03</span>
              Unduhan
            </Badge>

            {/* Headline */}
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-navy leading-tight">
              Dokumen & <span className="text-gold">Materi</span>
              <br />
              Pelayanan
            </h2>

            {/* Description */}
            <p className="text-gray-text text-base leading-relaxed">
              Akses tata ibadah, warta jemaat, dan dokumen pelayanan lainnya
              untuk mendukung perjalanan iman Anda.
            </p>
          </div>

          {/* Right column - Tabs */}
          <div className="lg:col-span-8">
            <Tabs defaultValue="tata-ibadah" className="w-full">
              <TabsList className="bg-white border border-gray-line rounded-full p-1 mb-6">
                <TabsTrigger
                  value="tata-ibadah"
                  className="rounded-full px-6 py-2 data-[state=active]:bg-navy data-[state=active]:text-white"
                >
                  Tata Ibadah
                </TabsTrigger>
                <TabsTrigger
                  value="warta-jemaat"
                  className="rounded-full px-6 py-2 data-[state=active]:bg-navy data-[state=active]:text-white"
                >
                  Warta Jemaat
                </TabsTrigger>
              </TabsList>

              <TabsContent value="tata-ibadah" className="mt-0">
                <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
                  {tataIbadah.map((item, index) => (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between p-4 lg:p-5 hover:bg-off-white transition-all group ${
                        index !== tataIbadah.length - 1
                          ? "border-b border-gray-line"
                          : ""
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-red-500" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-text mb-0.5">
                            {formatDate(item.tanggal)}
                          </p>
                          <p className="font-medium text-navy text-sm lg:text-base">
                            {item.judul}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-full text-gold hover:text-gold hover:bg-gold/10 flex items-center gap-1"
                      >
                        <Download className="w-4 h-4" />
                        <span className="hidden sm:inline">Unduh</span>
                      </Button>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="warta-jemaat" className="mt-0">
                <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
                  {wartaJemaat.map((item, index) => (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between p-4 lg:p-5 hover:bg-off-white transition-all group ${
                        index !== wartaJemaat.length - 1
                          ? "border-b border-gray-line"
                          : ""
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-text mb-0.5">
                            {formatDate(item.tanggal)}
                          </p>
                          <p className="font-medium text-navy text-sm lg:text-base">
                            {item.judul}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-full text-gold hover:text-gold hover:bg-gold/10 flex items-center gap-1"
                      >
                        <Download className="w-4 h-4" />
                        <span className="hidden sm:inline">Unduh</span>
                      </Button>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>

            {/* View all link */}
            <div className="mt-6 text-right">
              <a
                href="#"
                className="inline-flex items-center gap-2 text-navy font-medium hover:text-gold transition-colors group text-sm"
              >
                Lihat Semua
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
