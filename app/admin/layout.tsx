"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Clock,
  FileDown,
  Camera,
  LogOut,
  Menu,
  Bell,
  ChevronDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard, exact: true },
  { label: "Jadwal Ibadah", href: "/admin/jadwal", icon: Clock, exact: false },
  { label: "Unduhan", href: "/admin/unduhan", icon: FileDown, exact: false },
  { label: "Dokumentasi", href: "/admin/dokumentasi", icon: Camera, exact: false },
]

const pageTitles: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/jadwal": "Jadwal Ibadah",
  "/admin/unduhan": "Unduhan",
  "/admin/dokumentasi": "Dokumentasi Kegiatan",
}

function getPageTitle(pathname: string) {
  if (pageTitles[pathname]) return pageTitles[pathname]
  if (pathname.startsWith("/admin/dokumentasi/")) return "Kelola Foto Event"
  return "Admin"
}

function SidebarContent({ pathname }: { pathname: string }) {
  return (
    <div className="flex flex-col h-full bg-navy">
      {/* Logo area */}
      <div className="px-6 py-5 border-b border-white/10">
        <p className="text-xs font-semibold text-gold uppercase tracking-widest">Admin Panel</p>
        <p className="text-sm font-bold text-white mt-0.5">GPIB Damai Sejahtera</p>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-white/15 text-white"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom: user + logout */}
      <div className="px-3 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback className="bg-white/20 text-white text-xs font-semibold">
              AD
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-xs font-medium text-white truncate">Administrator</p>
            <p className="text-xs text-white/50 truncate">admin@gpib.org</p>
          </div>
        </div>
        <button
          className="flex items-center gap-3 w-full rounded-lg px-3 py-2 text-sm font-medium text-white/60 hover:bg-white/5 hover:text-white transition-colors"
          onClick={() => {
            // TODO: Implement logout (e.g. Supabase Auth signOut or NextAuth signOut)
            console.log("Logout")
          }}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Keluar
        </button>
      </div>
    </div>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Login page renders as a standalone page without the dashboard shell
  if (pathname === "/admin/login") {
    return <>{children}</>
  }

  const pageTitle = getPageTitle(pathname)

  return (
    <div className="flex min-h-screen bg-off-white">
      {/* Desktop Sidebar — fixed left */}
      <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 left-0 z-50 shadow-lg">
        <SidebarContent pathname={pathname} />
      </aside>

      {/* Content area offset by sidebar */}
      <div className="flex-1 md:ml-64 flex flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-white px-4 md:px-6 shadow-sm">
          {/* Mobile hamburger */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden shrink-0">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Buka menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0 border-0">
              <SidebarContent pathname={pathname} />
            </SheetContent>
          </Sheet>

          {/* Page title */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{pageTitle}</p>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1">
            {/* Notification bell — placeholder */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              {/* TODO: Show badge when there are unread notifications */}
            </Button>

            {/* User dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-2 h-9">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-navy text-white text-xs font-semibold">
                      AD
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="h-3 w-3 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium">Administrator</p>
                  <p className="text-xs text-muted-foreground">admin@gpib.org</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => {
                    // TODO: Implement logout
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
