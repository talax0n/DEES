"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function LandingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="font-serif text-3xl font-medium text-navy mb-3">
          Terjadi Kesalahan
        </h1>
        <p className="text-gray-text mb-8">
          {error.message || "Maaf, terjadi kesalahan yang tidak terduga. Silakan coba lagi."}
        </p>
        <Button
          onClick={reset}
          className="rounded-full bg-navy text-white hover:bg-navy-mid px-8"
        >
          Coba Lagi
        </Button>
      </div>
    </div>
  );
}
