# GPIB Damai Sejahtera — Project Plan

## 1. Project Overview

A modern church website for **GPIB Damai Sejahtera** consisting of two main parts:

- **Landing Page** — Public-facing website for jemaat & visitors
- **Admin Dashboard** — Internal CMS for managing church content

---

## 2. Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Framework | Next.js 14+ (App Router) | Fullstack — handles frontend & backend |
| UI Components | shadcn/ui | |
| Animation | Framer Motion | |
| Styling | Tailwind CSS | |
| Language | TypeScript | |
| Database | Supabase (PostgreSQL) | |
| File Storage | Supabase Storage | For PDFs, images |
| ORM | Prisma | |
| Auth (Admin) | RBAC (implemented later) | Custom roles: admin, editor, etc. |
| Deployment (MVP) | Vercel | |
| Deployment (Prod) | VPS / Self-hosted | Migration planned post-MVP |

---

## 3. Content Reference (from GPIB Markus)

Based on the GPIB Markus website, here's the content structure adapted for Damai Sejahtera:

### Church Identity
- Church name, logo, tagline
- MUPEL affiliation info
- Brief sejarah (history)
- Visi & Misi

### Jadwal Ibadah (Worship Schedule)
- Multiple Sunday services with times (e.g., 07.00 WIB, 09.30 WIB, 17.00 WIB)
- Ibadah Keluarga / Sektoral (weekday services)
- YouTube / streaming links for each service

### Pelayanan Kategorial (Categorical Ministries)
- PA (Pelayanan Anak)
- PT (Persekutuan Teruna)
- GP (Gerakan Pemuda)
- PKP (Persekutuan Kaum Perempuan)
- PKB (Persekutuan Kaum Bapak)
- PKLU (Persekutuan Kaum Lanjut Usia)
- Each with: description, schedule, contact person

### Unduhan (Downloads)
- Tata Ibadah (TAIB) — weekly worship liturgy PDF
- Warta Jemaat — weekly church bulletin PDF
- Organized by date (newest first)

### Kegiatan Pelayanan (Ministry Activities)
- Event posts with title, date, description
- Photo documentation / gallery per event
- News articles & announcements

### Contact Us
- Church address & map embed
- Phone number(s)
- Email
- Kantor Sekretariat hours
- Social media links (YouTube, Instagram, etc.)

---

## 4. Proposed Project Structure

```
gpib-damai-sejahtera/
├── public/
│   ├── images/
│   │   ├── logo.png
│   │   ├── hero/
│   │   └── pelkat/              # Pelayanan kategorial icons
│   └── fonts/
│
├── src/
│   ├── app/
│   │   ├── (landing)/           # Landing page route group
│   │   │   ├── layout.tsx       # Landing layout (navbar + footer)
│   │   │   ├── page.tsx         # Homepage
│   │   │   ├── jadwal/
│   │   │   │   └── page.tsx     # Jadwal pelayanan page
│   │   │   ├── unduhan/
│   │   │   │   └── page.tsx     # Downloads (TAIB & Warta)
│   │   │   ├── kegiatan/
│   │   │   │   ├── page.tsx     # Activity listing
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx # Activity detail + gallery
│   │   │   └── kontak/
│   │   │       └── page.tsx     # Contact us page
│   │   │
│   │   ├── admin/               # Admin dashboard route group
│   │   │   ├── layout.tsx       # Dashboard layout (sidebar + topbar)
│   │   │   ├── page.tsx         # Dashboard overview
│   │   │   ├── jadwal/
│   │   │   │   └── page.tsx     # CRUD jam ibadah
│   │   │   ├── unduhan/
│   │   │   │   └── page.tsx     # CRUD TAIB & Warta files
│   │   │   ├── kegiatan/
│   │   │   │   ├── page.tsx     # CRUD kegiatan/acara
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx # Edit specific kegiatan
│   │   │   └── login/
│   │   │       └── page.tsx     # Admin login
│   │   │
│   │   ├── api/                 # API routes
│   │   │   ├── jadwal/
│   │   │   │   └── route.ts
│   │   │   ├── unduhan/
│   │   │   │   └── route.ts
│   │   │   ├── kegiatan/
│   │   │   │   └── route.ts
│   │   │   └── upload/
│   │   │       └── route.ts
│   │   │
│   │   ├── layout.tsx           # Root layout
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── landing/             # Landing page components
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── HeroSection.tsx
│   │   │   ├── JadwalSection.tsx
│   │   │   ├── PelkatCarousel.tsx
│   │   │   ├── KegiatanCard.tsx
│   │   │   ├── GalleryGrid.tsx
│   │   │   ├── DownloadCard.tsx
│   │   │   └── ContactForm.tsx
│   │   │
│   │   ├── admin/               # Admin dashboard components
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Topbar.tsx
│   │   │   ├── DataTable.tsx
│   │   │   ├── FileUploader.tsx
│   │   │   ├── ImageUploader.tsx
│   │   │   ├── JadwalForm.tsx
│   │   │   ├── UnduhanForm.tsx
│   │   │   ├── KegiatanForm.tsx
│   │   │   └── DeleteDialog.tsx
│   │   │
│   │   └── ui/                  # shadcn/ui components
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── dialog.tsx
│   │       ├── input.tsx
│   │       ├── table.tsx
│   │       ├── tabs.tsx
│   │       ├── dropdown-menu.tsx
│   │       └── ...
│   │
│   ├── lib/
│   │   ├── db.ts                # Database client
│   │   ├── auth.ts              # Auth config
│   │   ├── storage.ts           # File upload helpers
│   │   ├── utils.ts             # General utilities
│   │   └── validations.ts       # Zod schemas
│   │
│   ├── hooks/
│   │   ├── useJadwal.ts
│   │   ├── useUnduhan.ts
│   │   ├── useKegiatan.ts
│   │   └── useAuth.ts
│   │
│   └── types/
│       └── index.ts             # TypeScript interfaces
│
├── prisma/                      # If using Prisma
│   ├── schema.prisma
│   └── seed.ts
│
├── tailwind.config.ts
├── next.config.mjs
├── tsconfig.json
├── package.json
└── .env.local
```

---

## 5. Data Models

```typescript
// types/index.ts

interface JadwalIbadah {
  id: string
  namaIbadah: string        // e.g. "Ibadah Minggu Pagi I"
  hari: string               // e.g. "Minggu"
  waktu: string              // e.g. "07.00 WIB"
  lokasi: string             // e.g. "Gedung Utama"
  linkStreaming?: string     // YouTube link
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

interface PelayananKategorial {
  id: string
  nama: string              // e.g. "Persekutuan Teruna"
  singkatan: string          // e.g. "PT"
  deskripsi: string
  jadwal: string             // e.g. "Setiap Sabtu, 16.00 WIB"
  kontakPerson?: string
  iconUrl?: string
  order: number              // display order
}

interface Unduhan {
  id: string
  judul: string             // e.g. "Tata Ibadah Minggu 23 Maret 2026"
  tipe: "TAIB" | "WARTA"
  tanggal: Date              // date of the service
  fileUrl: string            // URL to the PDF file
  fileSize?: number
  createdAt: Date
  updatedAt: Date
}

interface Kegiatan {
  id: string
  judul: string
  slug: string
  deskripsi: string          // rich text or markdown
  tanggal: Date
  lokasi?: string
  coverImage?: string
  galeri: string[]           // array of image URLs
  isPublished: boolean
  createdAt: Date
  updatedAt: Date
}
```

---

## 6. Landing Page — Page Breakdown

### 6.1 Homepage (`/`)
Sections stacked vertically:

1. **Hero Section** — Church name, tagline, background image/video, CTA buttons (Warta Jemaat, Live Streaming)
2. **Statistik** — Animated counters (Keluarga Jemaat, Pendeta, Sektor Pelayanan)
3. **Jadwal Ibadah Preview** — Cards showing upcoming services with streaming links
4. **Pelayanan Kategorial** — Carousel/grid of ministry cards (PA, PT, GP, PKP, PKB, PKLU)
5. **Kegiatan Terbaru** — Latest 3-4 activities with thumbnails
6. **Unduhan Terbaru** — Latest TAIB & Warta download cards
7. **Contact CTA** — Compact contact section with map preview

### 6.2 Jadwal Pelayanan (`/jadwal`)
- Full schedule table/cards grouped by day
- Each entry: service name, time, location, streaming link (if available)
- Pelayanan Kategorial section with detailed cards (expandable or separate sub-section)

### 6.3 Unduhan (`/unduhan`)
- Filterable by type (TAIB / Warta / Semua)
- Sorted by date (newest first)
- Download cards with: title, date, file size, download button
- Pagination or infinite scroll

### 6.4 Kegiatan Pelayanan (`/kegiatan`)
- Grid of activity cards with cover images
- Click → detail page with full description + photo gallery
- Lightbox for gallery photos

### 6.5 Contact Us (`/kontak`)
- Church address + embedded Google Maps
- Phone, email, social links
- Kantor Sekretariat hours
- Optional: contact form (sends email)

---

## 7. Admin Dashboard — Page Breakdown

### 7.1 Login (`/admin/login`)
- Email/password authentication
- Protected by middleware — all `/admin/*` routes require auth

### 7.2 Dashboard Overview (`/admin`)
- Quick stats: total jadwal, total unduhan, total kegiatan
- Recent activity log
- Quick action buttons

### 7.3 Jadwal Ibadah CRUD (`/admin/jadwal`)
- Data table (shadcn Table) listing all services
- Add/Edit dialog form: nama, hari, waktu, lokasi, link streaming, isActive
- Delete with confirmation dialog
- Toggle active/inactive

### 7.4 Unduhan CRUD (`/admin/unduhan`)
- Data table listing all files
- Upload form: judul, tipe (TAIB/Warta), tanggal, file (PDF upload)
- Replace file functionality
- Delete with confirmation

### 7.5 Kegiatan CRUD (`/admin/kegiatan`)
- Data table listing all activities
- Create/Edit form: judul, deskripsi (rich text editor), tanggal, lokasi, cover image upload
- Multi-image gallery uploader (drag & drop, reorder)
- Toggle published/draft
- Delete with confirmation

---

## 8. Implementation Phases

### Phase 1 — Foundation (Days 1–2)
- [ ] Initialize Next.js project with TypeScript
- [ ] Set up Tailwind CSS + shadcn/ui
- [ ] Install Framer Motion
- [ ] Set up project structure (folders, layout files)
- [ ] Configure fonts & global styles (church brand colors)
- [ ] Build shared components: Navbar, Footer, Sidebar
- [ ] Set up database & ORM (after tech decision)
- [ ] Create data models / schema migration
- [ ] Seed database with sample data

### Phase 2 — Landing Page (Days 3–5)
- [ ] Homepage: Hero section with animations
- [ ] Homepage: Statistik counters (Framer Motion animated numbers)
- [ ] Homepage: Jadwal ibadah preview cards
- [ ] Homepage: Pelayanan kategorial carousel
- [ ] Homepage: Kegiatan terbaru section
- [ ] Homepage: Unduhan terbaru section
- [ ] Homepage: Contact CTA section
- [ ] Jadwal Pelayanan full page
- [ ] Unduhan page with filter & pagination
- [ ] Kegiatan listing page
- [ ] Kegiatan detail page with gallery (lightbox)
- [ ] Contact Us page with map embed
- [ ] Responsive design pass (mobile-first)
- [ ] SEO: meta tags, Open Graph, structured data

### Phase 3 — Admin Dashboard (Days 6–8)
- [ ] Admin login page + auth middleware
- [ ] Dashboard layout (sidebar, topbar)
- [ ] Dashboard overview page
- [ ] Jadwal CRUD (table + form dialog)
- [ ] Unduhan CRUD (table + file upload)
- [ ] Kegiatan CRUD (table + rich form + gallery upload)
- [ ] File upload API routes
- [ ] Form validation (Zod + React Hook Form)

### Phase 4 — Integration & Polish (Days 9–10)
- [ ] Connect landing page to real API/database
- [ ] Server-side rendering for landing pages (ISR/SSG)
- [ ] Loading states & error handling
- [ ] Framer Motion page transitions
- [ ] Scroll animations (fade-in, slide-up on viewport entry)
- [ ] Accessibility audit (ARIA, keyboard nav, contrast)
- [ ] Performance audit (Lighthouse)
- [ ] Final responsive testing (mobile, tablet, desktop)
- [ ] Deploy to production

---

## 9. UI Review Checklist

Use this checklist to verify the existing base UI. For the review, share the codebase and I'll audit against these criteria:

### 9.1 Project Structure Review
- [ ] Follows the folder structure outlined in Section 4
- [ ] Route groups `(landing)` and `admin` are properly separated
- [ ] Components are organized by domain (landing/ vs admin/ vs ui/)
- [ ] No business logic in page components (delegated to hooks/lib)
- [ ] TypeScript interfaces exist in `types/`
- [ ] Proper use of `layout.tsx` for shared layouts

### 9.2 Component Architecture
- [ ] Components are small and single-responsibility
- [ ] shadcn/ui components are properly installed (not copy-pasted incorrectly)
- [ ] Reusable components exist for repeated patterns (cards, forms)
- [ ] Client vs Server components are correctly separated (`"use client"` only where needed)
- [ ] Props are typed with TypeScript interfaces

### 9.3 Styling & Design
- [ ] Tailwind CSS classes are consistent (no arbitrary values where Tailwind utilities exist)
- [ ] Color palette is defined in `tailwind.config.ts` (brand colors as CSS variables)
- [ ] Typography scale is consistent (not random font sizes)
- [ ] Spacing is consistent (using Tailwind spacing scale)
- [ ] Dark mode support (if planned)
- [ ] No inline styles

### 9.4 Framer Motion Usage
- [ ] Animations enhance UX, not distract
- [ ] Page load: staggered fade-in/slide-up for sections
- [ ] Scroll-triggered animations use `whileInView`
- [ ] Hover/tap interactions on cards and buttons
- [ ] Page transitions (AnimatePresence for route changes)
- [ ] Reduced motion media query respected (`useReducedMotion`)

### 9.5 Responsive Design
- [ ] Mobile-first approach (base styles = mobile, then `md:`, `lg:`)
- [ ] Navbar collapses to hamburger on mobile
- [ ] All images are responsive (`w-full`, `object-cover`)
- [ ] Tables in admin have horizontal scroll on mobile
- [ ] Touch targets ≥ 44px on mobile
- [ ] No horizontal overflow on any viewport

### 9.6 Accessibility
- [ ] Semantic HTML (`<nav>`, `<main>`, `<section>`, `<article>`, etc.)
- [ ] Images have meaningful `alt` text
- [ ] Links have descriptive text (no "click here")
- [ ] Form inputs have associated `<label>`
- [ ] Color contrast ≥ 4.5:1 for text
- [ ] Focus indicators visible on all interactive elements
- [ ] Skip-to-content link present

### 9.7 Performance
- [ ] Images use Next.js `<Image>` component (not `<img>`)
- [ ] Large images are optimized (WebP/AVIF)
- [ ] Fonts loaded with `next/font`
- [ ] No unnecessary client-side JS (prefer Server Components)
- [ ] Lazy loading for below-fold images and sections

### 9.8 Code Quality
- [ ] Consistent naming convention (camelCase for functions, PascalCase for components)
- [ ] No hardcoded strings that should be constants/config
- [ ] Environment variables for API URLs, keys, etc.
- [ ] No `console.log` left in production code
- [ ] ESLint + Prettier configured and clean

---

## 10. Next Steps

1. **Share the existing codebase** — Push to GitHub or share the project folder so I can review against the checklist above
2. **Decide on remaining tech stack** — Database, storage, auth, deployment
3. **Confirm content** — Finalize church-specific content (jadwal times, pelkat list, contact info, etc.)
4. **Start Phase 1** — Once the plan is approved and tech is decided

---

*Plan created: March 23, 2026*
