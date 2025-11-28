"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

function getPageTitle(pathname) {
  if (!pathname) return "Dashboard";
  if (pathname === "/dashboard") return "Dashboard";
  if (pathname.startsWith("/dashboard/events")) return "Event";
  if (pathname.startsWith("/dashboard/peserta")) return "Peserta";
  if (pathname.startsWith("/dashboard/detail-peserta")) return "Detail Peserta";
  if (pathname.startsWith("/dashboard/berita")) return "Berita";
  if (pathname.startsWith("/dashboard/scores")) return "Penilaian";
  if (pathname.startsWith("/dashboard/score-details")) return "Detail Penilaian";
  if (pathname.startsWith("/dashboard/juara")) return "Juara";
  if (pathname.startsWith("/dashboard/partisipasi")) return "Partisipasi";
  if (pathname.startsWith("/dashboard/users")) return "Users";
  return "Dashboard";
}

export default function Navbar({ onToggleMobileSidebar }) {
  const pathname = usePathname();
  const { user, logout } = useAuth() || {};

  const title = getPageTitle(pathname);

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b bg-card px-4 mr-6">
      {/* kiri: title */}
      <div className="flex flex-col">
        <h1 className="px-2 sm:px-6 text-sm sm:text-xl font-semibold">{title} - Alpha Creative</h1>
      </div>

      {/* kanan: mobile burger + user + logout */}
      <div className="flex items-center gap-2">
        {/* HAMBURGER: tampil di mobile */}
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          className="inline-flex md:hidden h-8 w-8 items-center justify-center rounded-md border border-border hover:bg-accent text-muted-foreground hover:text-foreground"
          aria-label="Toggle menu"
        >
          <Menu className="h-4 w-4" />
        </button>

        {user && (
          <div className="hidden md:flex flex-col items-end">
            <span className="text-md font-medium">
              {user.username || user.email}
            </span>
            <span className="text-[10px] uppercase text-muted-foreground">
              {user.role}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
