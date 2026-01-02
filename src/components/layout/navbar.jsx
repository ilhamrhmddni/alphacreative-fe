"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { Menu, LogOut } from "lucide-react";
import { resolveMediaUrl } from "@/lib/utils";

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
  const router = useRouter();
  const { user, logout } = useAuth() || {};

  const title = getPageTitle(pathname);
  const profileLink = "/dashboard/profile";
  const avatarUrl = user?.profilePhotoPath
    ? resolveMediaUrl(user.profilePhotoPath)
    : null;
  const initials = useMemo(() => {
    const source = user?.username || user?.email || "";
    return source.trim().slice(0, 2).toUpperCase();
  }, [user?.email, user?.username]);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return undefined;

    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  async function handleLogout() {
    if (typeof logout === "function") {
      try {
        await logout();
      } catch (err) {
        console.error("Logout failed", err);
      }
    }
    router.push("/auth/login");
    setMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b bg-card px-4 mr-6">
      {/* kiri: title */}
      <div className="flex flex-col">
        <h1 className="px-2 sm:px-6 text-sm sm:text-xl font-semibold">{title} - Alpha Creative</h1>
      </div>

      {/* kanan: mobile burger + user + logout */}
      <div className="flex items-center gap-1 sm:gap-3">
        {user && (
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              className="flex items-center gap-2 rounded-full px-2 py-1.5 text-sm transition-colors hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
            >
              <span className="hidden md:flex flex-col items-end gap-0.5 text-right leading-tight">
                <span className="truncate font-medium">
                  {user.username || user.email}
                </span>
                <span className="text-[10px] uppercase text-muted-foreground">
                  {user.role || ""}
                </span>
              </span>
              <span className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-border bg-muted text-xs font-semibold">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarUrl}
                    alt="Foto profil"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span>{initials || "?"}</span>
                )}
              </span>
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-4 w-60 rounded-md bg-popover text-popover-foreground shadow-lg ring-1 ring-transparent transition-colors hover:ring-border/60" role="menu">
                <div className="flex items-center justify-between gap-4 border-b px-4 py-3">
                  <div className="flex min-w-0 flex-col items-end gap-0.5 text-right">
                    <span className="truncate text-sm font-medium">
                      {user.username || user.email}
                    </span>
                    <span className="truncate text-xs uppercase text-muted-foreground">
                      {user.role || ""}
                    </span>
                  </div>
                  <span className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-border bg-muted text-xs font-semibold">
                    {avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={avatarUrl}
                        alt="Foto profil"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span>{initials || "?"}</span>
                    )}
                  </span>
                </div>

                <div className="flex flex-col gap-3 p-3 text-sm">
                  <Link
                    href={profileLink}
                    onClick={() => setMenuOpen(false)}
                    className="rounded-md px-3 py-2 text-left transition-colors hover:bg-accent"
                  >
                    Lihat Profil
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center justify-between rounded-md px-3 py-2 text-left text-red-600 transition-colors hover:bg-red-50"
                  >
                    Logout
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* HAMBURGER: tampil di mobile */}
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground md:hidden"
          aria-label="Toggle menu"
        >
          <Menu className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
