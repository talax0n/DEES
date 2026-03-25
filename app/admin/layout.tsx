"use client"

import { useState } from "react"
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
  Search,
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
import { AuthProvider, useAuth } from "@/components/providers/AuthProvider"
import { ThemeToggle } from "@/components/theme-toggle"

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

function getInitials(name: string | null | undefined, email: string | null | undefined) {
  if (name) return name.slice(0, 2).toUpperCase()
  if (email) return email.slice(0, 2).toUpperCase()
  return "AD"
}

function SidebarContent({ pathname }: { pathname: string }) {
  const { user, role, signOut } = useAuth()
  const [query, setQuery] = useState("")
  const initials = getInitials(user?.name, user?.email)
  const displayName = user?.name ?? user?.email ?? "Administrator"
  const displayEmail = user?.email ?? ""

  const filteredNav = navItems.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="flex flex-col h-full bg-background/95 backdrop-blur-xl border-r border-border/40 text-foreground">
      {/* Logo area */}
      <div className="px-6 py-5 border-b border-border/40">
        <p className="text-xs font-semibold text-primary uppercase tracking-widest">Admin Panel</p>
        <p className="text-sm font-bold mt-0.5">GPIB Damai Sejahtera</p>
      </div>

      {/* Search */}
      <div className="px-3 pt-3 pb-1">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari menu..."
            className="w-full bg-muted/50 text-foreground text-xs placeholder:text-muted-foreground rounded-lg pl-8 pr-3 py-2 outline-none focus:bg-muted/80 focus:ring-1 focus:ring-primary/30 transition-all"
          />
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {filteredNav.map((item) => {
          const Icon = item.icon
          const isActive = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg py-2.5 text-sm font-medium transition-all duration-200 border-l-[3px]",
                isActive
                  ? "bg-primary/10 text-primary border-primary shadow-sm"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground border-transparent"
              )}
            >
              <Icon className={cn("h-4 w-4 shrink-0 ml-2", isActive ? "text-primary" : "")} />
              {item.label}
            </Link>
          )
        })}
        {filteredNav.length === 0 && (
          <p className="text-xs text-muted-foreground px-3 py-2 text-center mt-4">Tidak ditemukan</p>
        )}
      </nav>

      {/* Bottom: user + logout */}
      <div className="px-3 py-4 border-t border-border/40 bg-muted/20">
        <div className="flex items-center gap-3 px-3 py-2 mb-2 rounded-lg bg-background/50 border border-border/40 shadow-sm">
          <Avatar className="h-8 w-8 shrink-0 border border-primary/20">
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1.5">
              <p className="text-xs font-medium truncate">{displayName}</p>
              {role && (
                <span className={cn(
                  "shrink-0 inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider",
                  role === "ADMIN" ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                )}>
                  {role === "ADMIN" ? "Admin" : "Editor"}
                </span>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground truncate">{displayEmail}</p>
          </div>
        </div>
        <button
          className="flex items-center justify-center gap-2 w-full rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors border border-transparent hover:border-destructive/20"
          onClick={signOut}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Keluar
        </button>
      </div>
    </div>
  )
}

function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user, role, signOut } = useAuth()
  const pageTitle = getPageTitle(pathname)
  const initials = getInitials(user?.name, user?.email)
  const displayName = user?.name ?? user?.email ?? "Administrator"
  const displayEmail = user?.email ?? ""

  return (
    <div className="flex min-h-screen bg-muted/30 dark:bg-background">
      {/* Desktop Sidebar — fixed left */}
      <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 left-0 z-50 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)]">
        <SidebarContent pathname={pathname} />
      </aside>

      {/* Content area offset by sidebar */}
      <div className="flex-1 md:ml-64 flex flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 px-4 md:px-6 shadow-sm">
          {/* Mobile hamburger */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden shrink-0">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Buka menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0 border-0 bg-transparent">
              <SidebarContent pathname={pathname} />
            </SheetContent>
          </Sheet>

          {/* Page title */}
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold text-foreground tracking-tight truncate">{pageTitle}</h1>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
              <Bell className="h-4 w-4" />
              <span className="absolute top-2 right-2.5 h-1.5 w-1.5 rounded-full bg-primary" />
            </Button>

            <div className="h-4 w-px bg-border/60 mx-1" />

            {/* User dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-2 h-9 hover:bg-muted/50 rounded-full md:rounded-lg">
                  <Avatar className="h-7 w-7 border border-border/50">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="h-3 w-3 text-muted-foreground hidden md:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-lg border-border/50 p-1">
                <div className="px-3 py-2.5 mb-1 rounded-lg bg-muted/30">
                  <p className="text-sm font-semibold truncate">{displayName}</p>
                  <p className="text-xs text-muted-foreground truncate">{displayEmail}</p>
                  {role && (
                    <span className={cn(
                      "mt-2 inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                      role === "ADMIN" ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                    )}>
                      {role === "ADMIN" ? "Admin" : "Editor"}
                    </span>
                  )}
                </div>
                <DropdownMenuSeparator className="bg-border/40" />
                <DropdownMenuItem
                  className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer rounded-md mt-1"
                  onClick={signOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  if (pathname === "/admin/login") {
    return <>{children}</>
  }

  return (
    <AuthProvider>
      <AdminShell>{children}</AdminShell>
    </AuthProvider>
  )
}
