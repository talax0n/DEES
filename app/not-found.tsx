import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 text-center">
      <div className="mb-8">
        <Image
          src="/LOGO.png"
          alt="GPIB Damai Sejahtera"
          width={80}
          height={80}
          className="mx-auto"
        />
      </div>

      <p className="font-mono text-gold text-sm font-medium mb-3">404</p>
      <h1 className="font-serif text-3xl sm:text-4xl font-medium text-navy mb-4">
        Halaman Tidak Ditemukan
      </h1>
      <p className="text-gray-text max-w-sm mb-8">
        Halaman yang Anda cari tidak ada atau telah dipindahkan.
      </p>

      <Link href="/">
        <Button className="rounded-full bg-navy text-white hover:bg-navy-mid px-8">
          Kembali ke Beranda
        </Button>
      </Link>
    </div>
  );
}
