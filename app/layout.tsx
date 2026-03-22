import type { Metadata } from "next";
import { Playfair_Display } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: {
    default: "GPIB Damai Sejahtera",
    template: "%s | GPIB Damai Sejahtera",
  },
  description:
    "Website resmi GPIB Damai Sejahtera — Jadwal ibadah, warta jemaat, dan informasi pelayanan.",
  openGraph: {
    locale: "id_ID",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={playfairDisplay.variable}>
      <body className="font-sans">
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
