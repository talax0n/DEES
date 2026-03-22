import { Badge } from '@/components/ui/badge'
import { ArrowUpRight, Cross } from 'lucide-react'

export function About() {
  return (
    <section id="about" className="w-full py-20 lg:py-32 bg-off-white relative overflow-hidden">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left column - 40% */}
          <div className="lg:col-span-5 space-y-6">
            {/* Section pill */}
            <Badge 
              variant="default" 
              className="bg-navy text-white hover:bg-navy px-4 py-1.5 text-xs font-medium rounded-full"
            >
              <span className="font-mono mr-2">01</span>
              Tentang
            </Badge>

            {/* Headline */}
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-navy leading-tight">
              Kami dengan tulus{' '}
              <span className="text-gold">menyambut Anda ke keluarga rohani kami</span>,
              tempat setiap orang menemukan kedamaian, dukungan, dan harapan baru.
            </h2>

            {/* Body text */}
            <p className="text-gray-text text-base lg:text-lg leading-relaxed">
              GPIB Damai Sejahtera adalah gereja yang berkomitmen untuk menjadi rumah rohani 
              bagi setiap orang. Kami percaya bahwa melalui firman Tuhan, persekutuan, dan 
              pelayanan, setiap jiwa dapat bertumbuh dalam iman dan kasih Kristus.
            </p>

            {/* CTA Link */}
            <a 
              href="#" 
              className="inline-flex items-center gap-2 text-navy font-medium hover:text-gold transition-colors group"
            >
              Pelajari Lebih
              <span className="w-8 h-8 rounded-full bg-navy text-white flex items-center justify-center group-hover:bg-gold transition-colors">
                <ArrowUpRight className="w-4 h-4" />
              </span>
            </a>
          </div>

          {/* Center decorative element */}
          <div className="hidden lg:flex lg:col-span-1 justify-center">
            <div className="relative flex items-center">
              <div className="w-px h-32 bg-gray-line" />
              <div className="absolute left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center">
                <Cross className="w-5 h-5 text-gold" />
              </div>
            </div>
          </div>

          {/* Right column - 60% */}
          <div className="lg:col-span-6 relative">
            {/* Main image card with rotation */}
            <div 
              className="relative rounded-3xl overflow-hidden shadow-xl aspect-[4/3]"
              style={{ transform: 'rotate(2deg)' }}
            >
              {/* Placeholder for church interior image */}
              <div className="absolute inset-0 bg-gradient-to-br from-navy-mid to-navy flex items-center justify-center">
                <div className="text-center text-white/60">
                  <Cross className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p className="text-sm">Interior Gereja</p>
                </div>
              </div>
            </div>

            {/* Floating stat card */}
            <div 
              className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-lg px-6 py-4 z-10"
            >
              <p className="font-serif text-2xl lg:text-3xl font-semibold text-navy">
                700<span className="text-gold">+</span>
              </p>
              <p className="text-gray-text text-sm">Keluarga Jemaat</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
