"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Users2,
  Newspaper,
  Trophy,
  ClipboardList,
  Layers,
  Menu,
  LogOut,
  UserCircle2,
  UserSquare2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/auth-provider";

const MENU_SECTIONS = [
  {
    label: "Ringkasan",
    items: [
      {
        href: "/dashboard",
        label: "Dashboard",
        roles: ["admin", "operator", "juri", "peserta"],
        icon: LayoutDashboard,
      },
    ],
  },
  {
    label: "Peserta",
    items: [
      { href: "/dashboard/peserta", label: "Peserta", roles: ["admin", "operator", "peserta"], icon: Users2 },
      { href: "/dashboard/detail-peserta", label: "Detail Peserta", roles: ["admin", "operator"], icon: UserSquare2 },
    ],
  },
  {
    label: "Konten",
    items: [
      { href: "/dashboard/events", label: "Event", roles: ["admin", "operator", "peserta"], icon: CalendarDays },
      { href: "/dashboard/berita", label: "Berita", roles: ["admin", "operator", "peserta"], icon: Newspaper },
    ],
  },
  {
    label: "Penilaian",
    items: [
      { href: "/dashboard/juara", label: "Juara", roles: ["admin", "operator", "juri", "peserta"], icon: Trophy },
      { href: "/dashboard/scores", label: "Score", roles: ["admin", "operator", "juri", "peserta"], icon: ClipboardList },
      { href: "/dashboard/score-details", label: "Detail Score", roles: ["admin", "operator", "juri"], icon: Layers },
    ],
  },
  {
    label: "Pengguna",
    items: [
      { href: "/dashboard/users", label: "Users", roles: ["admin"], icon: Users },
    ],
  },
];

export default function Sidebar({
  collapsed: collapsedProp,
  onToggleCollapse,
  onNavigate,
  mode = "desktop", // "desktop" | "mobile"
  locked = false,
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { role, logout } = useAuth(); // ← ambil role dari context

  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const collapsed =
    typeof collapsedProp === "boolean" ? collapsedProp : internalCollapsed;

  const visibleSections = useMemo(() => {
    if (!role) return [];
    return MENU_SECTIONS.map((section) => ({
      label: section.label,
      items: section.items.filter((item) => item.roles.includes(role)),
    })).filter((section) => section.items.length > 0);
  }, [role]);
  const profileHref = "/dashboard/profile";
  const profileActive = pathname === profileHref;
  const navigationLocked = Boolean(locked);
  const lockMessage = useMemo(() => {
    if (!navigationLocked) return "";
    if (role === "peserta") {
      return "Akun menunggu aktivasi admin.";
    }
    if (role === "operator") {
      return "Pilih event fokus di tab Profil sebelum mengakses menu lain.";
    }
    return "Navigasi sementara dinonaktifkan.";
  }, [navigationLocked, role]);

  function handleToggleDesktop() {
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      setInternalCollapsed((prev) => !prev);
    }
  }

  function handleNavigate() {
    onNavigate?.();
  }

  function handleLogout() {
    logout?.();
    onNavigate?.();
    router.push("/auth/login");
  }

  // ========== MODE MOBILE ==========
  if (mode === "mobile") {
    return (
      <nav className="md:hidden px-2 py-3 space-y-1 bg-background">
        {navigationLocked && lockMessage && (
          <p className="px-3 pb-2 text-[11px] font-medium text-amber-600">
            {lockMessage}
          </p>
        )}
        {visibleSections.map((section) => (
          <div key={section.label} className="space-y-1">
            <p className="px-3 pt-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {section.label}
            </p>
            {section.items.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              const disabled = navigationLocked;

              if (disabled) {
                return (
                  <div
                    key={item.href}
                    className={cn(
                      "group flex items-center justify-between rounded-lg px-3 py-2 text-sm opacity-50"
                    )}
                  >
                    <span className="flex-1 truncate text-left">
                      {item.label}
                    </span>
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground">
                      <Icon className="h-4 w-4 shrink-0" />
                    </span>
                  </div>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleNavigate}
                  className={cn(
                    "group flex items-center justify-between rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary",
                    active && "bg-primary text-primary-foreground shadow-sm"
                  )}
                >
                  <span className="flex-1 truncate text-left">
                    {item.label}
                  </span>
                  <span
                    className={cn(
                      "flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors group-hover:bg-primary/20 group-hover:text-primary",
                      active && "bg-primary/90 text-primary-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                  </span>
                </Link>
              );
            })}
          </div>
        ))}

        {role && (
          <div className="mt-4 border-t border-border pt-3 space-y-2">
            <Link
              href={profileHref}
              onClick={handleNavigate}
              className={cn(
                "group flex items-center justify-between rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary",
                profileActive && "bg-primary text-primary-foreground shadow-sm"
              )}
            >
              <span className="flex-1 truncate text-left">Profile</span>
              <span
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors group-hover:bg-primary/20 group-hover:text-primary",
                  profileActive && "bg-primary/90 text-primary-foreground"
                )}
              >
                <UserCircle2 className="h-4 w-4 shrink-0" />
              </span>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="group w-full flex items-center justify-between rounded-md px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <span className="flex-1 truncate text-left">Logout</span>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-red-700 transition-colors group-hover:bg-red-200">
                <LogOut className="h-4 w-4 shrink-0" />
              </span>
            </button>
          </div>
        )}

        {!role && (
          <p className="text-xs text-muted-foreground px-3">
            Role tidak dikenali / belum login.
          </p>
        )}
      </nav>
    );
  }

  // ========== MODE DESKTOP ==========
  return (
    <aside
      className={cn(
        "hidden md:flex h-screen flex-col border-r bg-white transition-[width] duration-200 sticky top-0 overflow-y-auto flex-shrink-0",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* HEADER */}
      <div className="h-14 flex items-center justify-between border-b px-4">
        {!collapsed && (
          <span className="text-sm font-semibold truncate">
            Alphacreative
          </span>
        )}

        <button
          type="button"
          onClick={handleToggleDesktop}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border hover:bg-accent text-muted-foreground hover:text-foreground"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-4 w-4 " />
        </button>
      </div>

      {/* MENU UTAMA */}
      <nav className="flex-1 px-2 py-4 space-y-3">
        {visibleSections.map((section) => (
          <div key={section.label}>
            {!collapsed && (
              <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {section.label}
              </p>
            )}
            {section.items.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              const disabled = navigationLocked;

              if (disabled) {
                return (
                  <div
                    key={item.href}
                    className={cn(
                      "group flex items-center justify-between rounded-md px-3 py-2 text-sm opacity-50",
                      collapsed && "opacity-30"
                    )}
                  >
                    <span
                      className={cn(
                        "flex-1 truncate text-left",
                        collapsed && "opacity-0"
                      )}
                    >
                      {item.label}
                    </span>
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground">
                      <Icon className="h-4 w-4 shrink-0" />
                    </span>
                  </div>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleNavigate}
                  className={cn(
                    "group flex items-center justify-between rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary",
                    active && "bg-primary text-primary-foreground shadow-sm"
                  )}
                >
                  <span
                    className={cn(
                      "flex-1 truncate text-left transition-opacity",
                      collapsed && "opacity-0"
                    )}
                  >
                    {item.label}
                  </span>
                  <span
                    className={cn(
                      "flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors group-hover:bg-primary/20 group-hover:text-primary",
                      active && "bg-primary/90 text-primary-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                  </span>
                </Link>
              );
            })}
          </div>
        ))}

        {!role && (
          <p className="text-xs text-muted-foreground px-3">
            Role tidak dikenali / belum login.
          </p>
        )}
      </nav>

      {/* LOGOUT DI BAWAH */}
      {role && (
        <div className="mt-auto border-t p-2 space-y-1.5">
          {navigationLocked && lockMessage && (
            <p className="px-3 text-[11px] font-medium text-amber-600">
              {lockMessage}
            </p>
          )}
          <Link
            href={profileHref}
            onClick={handleNavigate}
            className={cn(
              "group flex items-center justify-between rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary",
              profileActive && "bg-primary text-primary-foreground shadow-sm"
            )}
          >
            <span
              className={cn(
                "flex-1 truncate text-left transition-opacity",
                collapsed && "opacity-0"
              )}
            >
              Profile
            </span>
            <span
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors group-hover:bg-primary/20 group-hover:text-primary",
                  profileActive && "bg-primary/90 text-primary-foreground"
                )}
            >
              <UserCircle2 className="h-4 w-4 shrink-0" />
            </span>
          </Link>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="group w-full flex items-center gap-2 px-3 py-2 text-red-600 transition-colors hover:text-red-700 hover:bg-red-50"
          >
            <span
              className={cn(
                "flex-1 truncate text-left transition-opacity",
                collapsed && "opacity-0"
              )}
            >
              Logout
            </span>
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-red-700 transition-colors group-hover:bg-red-200">
              <LogOut className="h-4 w-4 shrink-0" />
            </span>
          </Button>
        </div>
      )}
    </aside>
  );
}
