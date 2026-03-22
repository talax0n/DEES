import {
  Navbar,
  Hero,
  About,
  Programs,
  Downloads,
  Activities,
  Contact,
  Footer,
} from "@/sections";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <Hero />
        <About />
        <Programs />
        <Downloads />
        <Activities />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
