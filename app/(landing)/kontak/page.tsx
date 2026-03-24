import type { Metadata } from "next";
import { CHURCH_INFO } from "@/lib/constants";
import { ContactForm } from "./ContactForm";
import { MapPin, Phone, Mail, Clock, Youtube, Instagram, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Hubungi Kami | GPIB Damai Sejahtera",
  description: "Hubungi GPIB Damai Sejahtera — alamat, telepon, email, dan jam kantor sekretariat.",
};

export default function KontakPage() {
  return (
    <div className="min-h-screen bg-white pt-20">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-12">
        {/* Header */}
        <div className="mb-10">
          <Badge className="bg-navy text-white hover:bg-navy px-4 py-1.5 text-xs font-medium rounded-full mb-4">
            Kontak
          </Badge>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-navy">
            Hubungi <span className="text-gold">Kami</span>
          </h1>
          <p className="text-gray-text mt-3 text-base max-w-xl">
            Kami siap menjawab pertanyaan dan mendengarkan Anda.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Left — Contact info + map */}
          <div className="space-y-8">
            <div className="space-y-5">
              {[
                { icon: MapPin, label: "Alamat", content: CHURCH_INFO.address },
                { icon: Phone, label: "Telepon", content: CHURCH_INFO.phone },
                { icon: Mail, label: "Email", content: CHURCH_INFO.email },
                { icon: Clock, label: "Jam Kantor", content: CHURCH_INFO.officeHours },
              ].map(({ icon: Icon, label, content }) => (
                <div key={label} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-navy/10 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-navy" />
                  </div>
                  <div>
                    <p className="text-gray-text text-sm mb-0.5">{label}</p>
                    <p className="text-navy font-medium whitespace-pre-line">{content}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Social links */}
            <div className="flex items-center gap-3">
              <a
                href={CHURCH_INFO.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition-colors text-sm font-medium"
              >
                <Youtube className="w-4 h-4" />
                YouTube
              </a>
              <a
                href={CHURCH_INFO.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors text-sm font-medium"
              >
                <Instagram className="w-4 h-4" />
                Instagram
              </a>
            </div>

            {/* Google Maps embed */}
            <div className="rounded-2xl overflow-hidden border border-gray-line aspect-[4/3] relative bg-off-white">
              <iframe
                src={CHURCH_INFO.mapsEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Lokasi GPIB Damai Sejahtera"
                className="absolute inset-0"
              />
              <a
                href={CHURCH_INFO.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full shadow text-xs font-medium text-navy hover:bg-off-white transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Buka di Maps
              </a>
            </div>
          </div>

          {/* Right — Contact form */}
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
