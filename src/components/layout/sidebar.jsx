"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Users2,
  Newspaper,
  Trophy,
  Menu,
  Handshake,
  CalendarPlus,
  Images,
  UserSquare2,
  ShoppingBag,
  Settings,
} from "lucide-react";

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
    label: "Event",
    items: [
      {
        href: "/dashboard/events",
        label: "Event",
        roles: ["admin", "operator", "peserta"],
        icon: CalendarDays,
      },
      {
        href: "/dashboard/sub-events",
        label: "Kategori Event",
        roles: ["admin", "operator"],
        icon: CalendarPlus,
      },
    ],
  },
  {
    label: "Peserta",
    items: [
      {
        href: "/dashboard/peserta",
        label: "Peserta",
        roles: ["admin", "operator", "peserta"],
        icon: Users2,
      },
      {
        href: "/dashboard/detail-peserta",
        label: "Detail Peserta",
        roles: ["admin", "operator"],
        icon: UserSquare2,
      },
    ],
  },
  {
    label: "Konten",
    items: [
      {
        href: "/dashboard/berita",
        label: "Berita",
        roles: ["admin", "operator", "peserta"],
        icon: Newspaper,
      },
      {
        href: "/dashboard/merchandise",
        label: "Merchandise",
        roles: ["admin", "operator", "peserta"],
        icon: ShoppingBag,
      },
      {
        href: "/dashboard/partnerships",
        label: "Kolaborasi",
        roles: ["admin", "operator"],
        icon: Handshake,
      },
      {
        href: "/dashboard/gallery",
        label: "Galeri",
        roles: ["admin", "operator"],
        icon: Images,
      },
    ],
  },
  {
    label: "Penilaian",
    items: [
      {
        href: "/dashboard/juara",
        label: "Juara",
        roles: ["admin", "operator", "juri", "peserta"],
        icon: Trophy,
      },
    ],
  },
  {
    label: "Pengguna",
    items: [
      {
        href: "/dashboard/users",
        label: "Users",
        roles: ["admin"],
        icon: Users,
      },
    ],
  },
  {
    label: "Sistem",
    items: [
      {
        href: "/dashboard/settings",
        label: "Pengaturan",
        roles: ["admin", "operator", "juri", "peserta"],
        icon: Settings,
      },
    ],
  },
];

export default function Sidebar({
  collapsed: collapsedProp,
  onToggleCollapse,
  onNavigate,
  mode = "desktop",
  locked = false,
}) {
  const pathname = usePathname();
  const { role } = useAuth();

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

  if (mode === "mobile") {
    return (
      <nav className="md:hidden space-y-1 bg-background px-2 py-3">
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
                    className="group flex items-center justify-between rounded-lg px-3 py-2 text-sm opacity-50"
                  >
                    <span className="flex-1 truncate text-left">{item.label}</span>
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
                  <span className="flex-1 truncate text-left">{item.label}</span>
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
          <p className="px-3 text-xs text-muted-foreground">
            Role tidak dikenali / belum login.
          </p>
        )}
      </nav>
    );
  }

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-screen flex-shrink-0 flex-col overflow-y-auto border-r bg-background transition-[width] duration-200 md:flex",
        collapsed ? "w-16" : "w-60"
      )}
    >
      <div className="flex h-14 items-center justify-between border-b px-4">
        {!collapsed && (
          <span className="truncate text-sm font-semibold">Alphacreative</span>
        )}

        <button
          type="button"
          onClick={handleToggleDesktop}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-4 w-4" />
        </button>
      </div>


      <nav className="flex-1 space-y-3 px-2 py-4">
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
          <p className="px-3 text-xs text-muted-foreground">
            Role tidak dikenali / belum login.
          </p>
        )}
      </nav>
    </aside>
  );
}
