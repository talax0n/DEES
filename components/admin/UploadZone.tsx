"use client"

import { useRef, useState } from "react"
import { Camera, Upload } from "lucide-react"
import { cn } from "@/lib/utils"

interface UploadZoneProps {
  accept?: string
  maxSizeMB?: number
  multiple?: boolean
  onFilesSelected: (files: File[]) => void
}

export function UploadZone({
  accept = "image/jpeg,image/png,image/webp",
  maxSizeMB = 5,
  multiple = true,
  onFilesSelected,
}: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  function handleFiles(files: FileList | null) {
    if (!files) return
    const filtered = Array.from(files).filter(
      (f) => f.size <= maxSizeMB * 1024 * 1024
    )
    if (filtered.length > 0) onFilesSelected(filtered)
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 text-center transition-colors cursor-pointer",
        isDragging
          ? "border-navy bg-navy/5"
          : "border-gray-line hover:border-navy/40 hover:bg-gray-50"
      )}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault()
        setIsDragging(true)
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault()
        setIsDragging(false)
        handleFiles(e.dataTransfer.files)
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <div className="flex flex-col items-center gap-3">
        <div className="rounded-full bg-navy/10 p-4">
          <Upload className="w-6 h-6 text-navy" />
        </div>
        <div>
          <p className="text-sm font-medium text-navy">
            Seret foto ke sini atau klik untuk upload
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            JPG, PNG, WebP — Maks. {maxSizeMB}MB per file
          </p>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Camera className="w-3.5 h-3.5" />
          <span>Bisa pilih beberapa foto sekaligus</span>
        </div>
      </div>
    </div>
  )
}
