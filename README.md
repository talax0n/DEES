<div align="center">
  <h1>⛪ GPIB Damai Sejahtera</h1>
  <p><strong>A modern church website and internal CMS for managing congregational activities, schedules, and resources.</strong></p>
</div>

## Overview

The GPIB Damai Sejahtera Web Portal is built to serve two main purposes:
1. **Landing Page:** A public-facing website for the congregation and visitors to access worship schedules, ministry activities, and church resources.
2. **Admin Dashboard:** An internal Content Management System (CMS) for authorized staff to manage church content, schedules, file downloads, and activity galleries.

## ✨ Features

### Public Portal
- **Worship Schedules (`/jadwal`):** View upcoming Sunday and weekday services, complete with times and YouTube streaming links.
- **Categorical Ministries (`/kegiatan`):** Information and activities for various ministries (PA, PT, GP, PKP, PKB, PKLU).
- **Downloads (`/unduhan`):** Access weekly liturgies (TAIB) and church bulletins (Warta Jemaat) in PDF format.
- **Activities & Events:** View recent church activities with rich photo galleries.

### Admin Dashboard (`/admin`)
- **Secure Access:** Protected login for content editors and administrators.
- **Schedule Management:** Complete CRUD interface for managing worship schedules and service details.
- **Resource Management:** Upload and organize weekly church files (TAIB/Warta).
- **Activity & Gallery Management:** Create event posts, manage rich-text descriptions, and upload event photo galleries.

## 🛠 Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Language:** TypeScript
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/)
- **Animations:** [Framer Motion](https://motion.dev/)
- **Database:** PostgreSQL (via [Supabase](https://supabase.com/))
- **ORM:** [Prisma](https://www.prisma.io/)
- **Package Manager:** [Bun](https://bun.sh/)

## 🚀 Getting Started

Follow these instructions to set up the project locally for development.

### Prerequisites

- [Bun](https://bun.sh/) (latest version recommended)
- A [Supabase](https://supabase.com/) project or local PostgreSQL database

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ds-web
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory and add your database credentials:
   ```bash
   DATABASE_URL="postgresql://user:password@host:port/database"
   ```
   > **Note:** Replace the value with your actual PostgreSQL connection string.

4. **Database Migration**
   Push the Prisma schema to your database and generate the client:
   ```bash
   bunx prisma db push
   bunx prisma generate
   ```

5. **Start the Development Server**
   ```bash
   bun run dev
   ```
   The application will be available at [http://localhost:3000](http://localhost:3000).

## 📁 Project Structure

```text
├── app/                  # Next.js App Router root
│   ├── (landing)/        # Public-facing pages (Home, Schedule, Activities)
│   ├── admin/            # Protected admin dashboard pages
│   └── api/              # API routes for CRUD and file uploads
├── components/           # Reusable React components
│   ├── admin/            # Admin-specific components
│   ├── landing/          # Public-facing UI components
│   └── ui/               # shadcn/ui components
├── lib/                  # Utilities, database client, validation schemas
├── prisma/               # Prisma schema and seed scripts
└── public/               # Static assets (images, icons)
```

## 📜 Available Commands

- `bun run dev` - Starts the Next.js development server.
- `bun run build` - Builds the application for production.
- `bun run start` - Starts the production server.
- `bun run lint` - Runs ESLint to check for code quality issues.
