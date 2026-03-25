"use client"

import { useEffect } from "react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { X, Download } from "lucide-react"

interface PdfPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  fileUrl: string
  title: string
}

export function PdfPreviewModal({ isOpen, onClose, fileUrl, title }: PdfPreviewModalProps) {
  const shouldReduce = useReducedMotion()

  // ESC key handler
  useEffect(() => {
    if (!isOpen) return
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [isOpen, onClose])

  // Prevent body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: shouldReduce ? 0 : 0.2 }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

          {/* Modal */}
          <motion.div
            className="relative z-10 flex flex-col w-full sm:max-w-[900px] h-full sm:h-[85vh] bg-white sm:rounded-2xl overflow-hidden shadow-2xl"
            initial={{ opacity: 0, y: shouldReduce ? 0 : 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: shouldReduce ? 0 : 20 }}
            transition={{ duration: shouldReduce ? 0 : 0.25 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-gray-line bg-white shrink-0">
              <h2 className="font-medium text-navy text-sm truncate flex-1">{title}</h2>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={fileUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-navy text-white text-xs font-medium hover:bg-navy/90 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Unduh
                </a>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                  aria-label="Tutup"
                >
                  <X className="w-4 h-4 text-navy" />
                </button>
              </div>
            </div>

            {/* PDF iframe */}
            <div className="flex-1 min-h-0">
              <iframe
                src={fileUrl}
                className="w-full h-full border-0"
                title={title}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
