import { Cross, Youtube, Instagram } from 'lucide-react'

const navLinks = [
  { label: 'Beranda', href: '#' },
  { label: 'Tentang Gereja', href: '#about' },
  { label: 'Pelayanan', href: '#programs' },
  { label: 'Kegiatan', href: '#activities' },
  { label: 'Kontak', href: '#contact' },
]

const serviceLinks = [
  { label: 'Jadwal Ibadah', href: '#programs' },
  { label: 'Pelkat', href: '#programs' },
  { label: 'Tata Ibadah', href: '#downloads' },
  { label: 'Warta Jemaat', href: '#downloads' },
]

const socialLinks = [
  { label: 'YouTube', href: '#', icon: Youtube },
  { label: 'Instagram', href: '#', icon: Instagram },
]

export function Footer() {
  return (
    <footer className="w-full bg-navy pt-16 lg:pt-20 pb-8">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* Main footer content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
          {/* Column 1 - Logo & tagline */}
          <div className="space-y-4">
            <a href="#" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <Cross className="w-5 h-5 text-gold" />
              </div>
              <span className="font-serif font-semibold text-white">
                GPIB Damai Sejahtera
              </span>
            </a>
            <p className="text-white/60 text-sm leading-relaxed">
              Menjadi gereja yang bertumbuh dalam iman, kasih, dan pelayanan.
            </p>
            <p className="text-gold text-sm">
              Bagian dari GPIB
            </p>
          </div>

          {/* Column 2 - Navigation */}
          <div>
            <h4 className="font-medium text-white mb-4">Navigasi</h4>
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-white/60 text-sm hover:text-gold transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 - Services */}
          <div>
            <h4 className="font-medium text-white mb-4">Pelayanan</h4>
            <ul className="space-y-2">
              {serviceLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-white/60 text-sm hover:text-gold transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4 - Social */}
          <div>
            <h4 className="font-medium text-white mb-4">Sosial</h4>
            <div className="flex items-center gap-3">
              {socialLinks.map((link) => {
                const Icon = link.icon
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-gold transition-colors"
                    aria-label={link.label}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </a>
                )
              })}
            </div>
          </div>
        </div>

        {/* Gold separator line */}
        <div className="w-full h-px bg-gold/30 mb-6" />

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-xs text-center sm:text-left">
            © {new Date().getFullYear()} GPIB Damai Sejahtera. Hak cipta dilindungi.
          </p>
          <p className="text-white/40 text-xs text-center sm:text-right">
            GPIB – Gereja Protestan di Indonesia bagian Barat
          </p>
        </div>
      </div>
    </footer>
  )
}
