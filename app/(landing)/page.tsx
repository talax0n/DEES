import { Hero } from "@/components/landing/Hero";
import { About } from "@/components/landing/About";
import { Programs } from "@/components/landing/Programs";
import { Downloads } from "@/components/landing/Downloads";
import { Activities } from "@/components/landing/Activities";
import { Contact } from "@/components/landing/Contact";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <main>
        <Hero />
        <About />
        <Programs />
        <Downloads />
        <Activities />
        <Contact />
      </main>
    </div>
  );
}
