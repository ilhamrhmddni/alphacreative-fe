"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Sidebar from "@/components/layout/sidebar";
import Navbar from "@/components/layout/navbar";
import { useAuth } from "@/components/auth/auth-provider";
import { cn } from "@/lib/utils";

export default function AppShell({ children, roles }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, initializing } = useAuth();
  // desktop collapse
  const [collapsed, setCollapsed] = useState(false);
  // mobile dropdown (sidebar dari atas)
  const [mobileOpen, setMobileOpen] = useState(false);
  const participantLocked =
    user?.role === "peserta" && user?.isActive === false;
  const operatorNeedsFocus =
    user?.role === "operator" && !user?.focusEventId;
  const navigationLocked = participantLocked || operatorNeedsFocus;
  const lockStateRef = useRef(navigationLocked);

  useEffect(() => {
    if (!initializing && !user) {
      router.replace("/auth/login");
    }
  }, [initializing, user, router]);

  useEffect(() => {
    if (
      !initializing &&
      user &&
      navigationLocked &&
      pathname !== "/dashboard/profile"
    ) {
      router.replace("/dashboard/profile");
    }
  }, [initializing, user, navigationLocked, pathname, router]);

  useEffect(() => {
    const wasLocked = lockStateRef.current;
    if (
      !initializing &&
      user?.role === "operator" &&
      wasLocked &&
      !navigationLocked &&
      pathname === "/dashboard/profile"
    ) {
      router.replace("/dashboard");
    }
    lockStateRef.current = navigationLocked;
  }, [initializing, navigationLocked, pathname, router, user]);

  if (initializing || !user) {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-muted-foreground">
        Memeriksa sesi login...
      </div>
    );
  }

  if (roles && !roles.includes(user.role)) {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-muted-foreground">
        Anda tidak memiliki akses ke halaman ini.
      </div>
    );
  }

  return (
    <div className="h-screen bg-background overflow-hidden">
      {/* SIDEBAR DESKTOP */}
      <div className="hidden md:block fixed inset-y-0 left-0 z-30">
        <Sidebar
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((prev) => !prev)}
          onNavigate={() => {}}
          mode="desktop"
          locked={navigationLocked}
        />
      </div>

      {/* AREA KANAN: NAVBAR + KONTEN */}
      <div
        className={cn(
          "flex h-screen flex-col overflow-hidden",
          collapsed ? "md:ml-16" : "md:ml-[15rem]"
        )}
      >
        <Navbar
          onToggleMobileSidebar={() => setMobileOpen((prev) => !prev)}
        />

        {/* SIDEBAR MOBILE: PANEL MUNCUL DARI SAMPING */}
        {mobileOpen && (
          <div className="md:hidden">
            <div
              className="fixed inset-0 z-40 bg-black/40"
              onClick={() => setMobileOpen(false)}
            />
            <aside className="fixed inset-y-0 left-0 z-50 w-64 max-w-[80vw] overflow-y-auto border-r border-border bg-background shadow-lg">
              <Sidebar
                mode="mobile"
                onNavigate={() => setMobileOpen(false)}
                locked={navigationLocked}
              />
            </aside>
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-4 md:p-6 w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
