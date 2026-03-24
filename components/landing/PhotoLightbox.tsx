"use client";

import { useEffect, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Camera } from "lucide-react";

interface Photo {
  id: string;
  imageUrl: string;
  caption?: string | null;
}

interface PhotoLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  eventName: string;
  photos: Photo[];
  initialIndex: number;
  currentIndex: number;
  onIndexChange: (index: number) => void;
}

export function PhotoLightbox({
  isOpen,
  onClose,
  eventName,
  photos,
  currentIndex,
  onIndexChange,
}: PhotoLightboxProps) {
  const shouldReduceMotion = useReducedMotion();

  const prev = useCallback(() => {
    onIndexChange((currentIndex - 1 + photos.length) % photos.length);
  }, [currentIndex, photos.length, onIndexChange]);

  const next = useCallback(() => {
    onIndexChange((currentIndex + 1) % photos.length);
  }, [currentIndex, photos.length, onIndexChange]);

  useEffect(() => {
    if (!isOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose, prev, next]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const current = photos[currentIndex];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Content */}
          <div className="relative z-10 flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 text-white shrink-0">
              <div className="min-w-0">
                <h2 className="font-semibold text-sm sm:text-base truncate">{eventName}</h2>
                {photos.length > 0 && (
                  <p className="text-white/60 text-xs mt-0.5">
                    {currentIndex + 1} / {photos.length}
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                className="ml-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors shrink-0"
                aria-label="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main image */}
            <div className="flex-1 flex items-center justify-center px-4 py-2 relative min-h-0">
              {photos.length === 0 ? (
                <div className="text-center text-white/50">
                  <Camera className="w-12 h-12 mx-auto mb-3 opacity-40" />
                  <p>Foto belum tersedia</p>
                </div>
              ) : (
                <>
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={current.id}
                      src={current.imageUrl}
                      alt={current.caption ?? eventName}
                      className="max-h-full max-w-full object-contain rounded-lg select-none"
                      initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.96 }}
                      transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
                      draggable={false}
                    />
                  </AnimatePresence>

                  {/* Prev button */}
                  {photos.length > 1 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); prev(); }}
                      className="absolute left-2 sm:left-6 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors"
                      aria-label="Sebelumnya"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                  )}

                  {/* Next button */}
                  {photos.length > 1 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); next(); }}
                      className="absolute right-2 sm:right-6 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors"
                      aria-label="Berikutnya"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Caption */}
            {current?.caption && (
              <div className="shrink-0 px-4 pb-2 text-center">
                <p className="text-white/70 text-sm">{current.caption}</p>
              </div>
            )}

            {/* Thumbnail strip */}
            {photos.length > 1 && (
              <div className="shrink-0 px-4 pb-4 pt-2">
                <div className="flex gap-2 overflow-x-auto pb-1 justify-center">
                  {photos.map((photo, i) => (
                    <button
                      key={photo.id}
                      onClick={() => onIndexChange(i)}
                      className={`w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden shrink-0 transition-all ${
                        i === currentIndex
                          ? "ring-2 ring-gold ring-offset-2 ring-offset-black/80 opacity-100"
                          : "opacity-50 hover:opacity-80"
                      }`}
                      aria-label={`Foto ${i + 1}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo.imageUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
