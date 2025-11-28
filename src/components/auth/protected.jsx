// src/components/auth/protected.jsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "./auth-provider";
import { Loader2 } from "lucide-react";

export function Protected({ children, allowRoles }) {
  const { user, initializing } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!initializing && !user) {
      router.replace("/auth/login"); // ← sesuaikan di sini
    }
  }, [initializing, user, router]);

  if (initializing || (!user && typeof window !== "undefined")) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (user && allowRoles && !allowRoles.includes(user.role)) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Anda tidak memiliki akses ke halaman ini.
        </p>
      </div>
    );
  }

  return children;
}