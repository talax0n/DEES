"use client";

import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, FileText, BookOpen, Newspaper, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

interface UnduhanItem {
  id: string;
  judul: string;
  tipe: string;
  tanggal: string;
  fileUrl: string;
  fileSize?: number | null;
}

type FilterType = "Semua" | "TAIB" | "WARTA";

const ITEMS_PER_PAGE = 10;

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatFileSize(bytes?: number | null) {
  if (!bytes) return null;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function UnduhanClient({ unduhan }: { unduhan: UnduhanItem[] }) {
  const [filter, setFilter] = useState<FilterType>("Semua");
  const [page, setPage] = useState(1);
  const shouldReduce = useReducedMotion();

  const filtered = useMemo(() => {
    if (filter === "Semua") return unduhan;
    return unduhan.filter((u) => u.tipe === filter);
  }, [unduhan, filter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  function handleFilter(f: FilterType) {
    setFilter(f);
    setPage(1);
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: shouldReduce ? 0 : 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: shouldReduce ? 0 : 0.5 }}
        className="mb-8"
      >
        <Badge className="bg-navy text-white hover:bg-navy px-4 py-1.5 text-xs font-medium rounded-full mb-4">
          Unduhan
        </Badge>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-navy">
          Dokumen & <span className="text-gold">Materi</span> Pelayanan
        </h1>
        <p className="text-gray-text mt-3 text-base max-w-xl">
          Akses tata ibadah, warta jemaat, dan dokumen pelayanan lainnya.
        </p>
      </motion.div>

      {/* Filter tabs */}
      <motion.div
        initial={{ opacity: 0, y: shouldReduce ? 0 : 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: shouldReduce ? 0 : 0.4, delay: shouldReduce ? 0 : 0.1 }}
        className="flex items-center gap-2 mb-6"
      >
        {(["Semua", "TAIB", "WARTA"] as FilterType[]).map((f) => (
          <button
            key={f}
            onClick={() => handleFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === f
                ? "bg-navy text-white"
                : "bg-off-white text-gray-text hover:bg-gray-line"
            }`}
          >
            {f === "TAIB" ? "Tata Ibadah" : f === "WARTA" ? "Warta Jemaat" : "Semua"}
          </button>
        ))}
        <span className="ml-auto text-sm text-gray-text">{filtered.length} dokumen</span>
      </motion.div>

      {/* Table with AnimatePresence for tab switching */}
      <AnimatePresence mode="wait">
        <motion.div
          key={filter}
          initial={{ opacity: 0, y: shouldReduce ? 0 : 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: shouldReduce ? 0 : -8 }}
          transition={{ duration: shouldReduce ? 0 : 0.25 }}
        >
          {paginated.length === 0 ? (
            <div className="text-center py-20 text-gray-text">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>Tidak ada dokumen ditemukan.</p>
            </div>
          ) : (
            <div className="rounded-2xl border border-gray-line overflow-hidden">
              {paginated.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: shouldReduce ? 0 : 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: shouldReduce ? 0 : 0.3, delay: shouldReduce ? 0 : i * 0.04 }}
                  className={`flex items-center gap-4 px-5 py-4 ${
                    i < paginated.length - 1 ? "border-b border-gray-line" : ""
                  } hover:bg-off-white transition-colors`}
                >
                  {/* Icon */}
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      item.tipe === "TAIB" ? "bg-red-50" : "bg-blue-50"
                    }`}
                  >
                    {item.tipe === "TAIB" ? (
                      <BookOpen className="w-5 h-5 text-red-500" />
                    ) : (
                      <Newspaper className="w-5 h-5 text-blue-500" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-navy text-sm truncate">{item.judul}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-text">{formatDate(item.tanggal)}</span>
                      {formatFileSize(item.fileSize) && (
                        <>
                          <span className="text-gray-line">·</span>
                          <span className="text-xs text-gray-text">{formatFileSize(item.fileSize)}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Badge */}
                  <Badge
                    variant="outline"
                    className={
                      item.tipe === "TAIB"
                        ? "border-red-200 text-red-600 bg-red-50 shrink-0 hidden sm:inline-flex"
                        : "border-blue-200 text-blue-600 bg-blue-50 shrink-0 hidden sm:inline-flex"
                    }
                  >
                    {item.tipe === "TAIB" ? "Tata Ibadah" : "Warta Jemaat"}
                  </Badge>

                  {/* Download button */}
                  <a
                    href={item.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                  >
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full border-gray-line hover:border-navy hover:bg-navy hover:text-white transition-colors shrink-0"
                    >
                      <Download className="w-4 h-4 sm:mr-2" />
                      <span className="hidden sm:inline">Unduh</span>
                    </Button>
                  </a>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-gray-text">
            Halaman {page} dari {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                  p === page
                    ? "bg-navy text-white"
                    : "text-gray-text hover:bg-off-white"
                }`}
              >
                {p}
              </button>
            ))}
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
