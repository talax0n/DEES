import type { Metadata } from "next";
import { Contact } from "@/components/landing/Contact";

export const metadata: Metadata = {
  title: "Kontak",
  description: "Hubungi GPIB Damai Sejahtera — alamat, telepon, email, dan jam kantor sekretariat.",
};

export default function KontakPage() {
  return (
    <div className="pt-20">
      {/* TODO: Expand with Google Maps embed + contact form + office hours */}
      <Contact />
    </div>
  );
}
