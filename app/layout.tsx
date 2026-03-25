import type { Metadata } from "next";
import { Playfair_Display } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";

import { ThemeProvider } from "@/components/theme-provider";

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
    <html lang="id" className={playfairDisplay.variable} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Church",
              "name": "GPIB Damai Sejahtera",
              "denomination": "Gereja Protestan di Indonesia bagian Barat",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Jl. Contoh No. 1",
                "addressLocality": "Jakarta Selatan",
                "addressCountry": "ID",
                "postalCode": "12345",
              },
              "telephone": "+62 21 1234 5678",
              "email": "info@gpibdamaisejahtera.org",
              "url": "https://gpibdamaisejahtera.org",
            }),
          }}
        />
      </head>
      <body className="font-sans antialiased bg-background text-foreground min-h-screen">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>{children}</TooltipProvider>
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
