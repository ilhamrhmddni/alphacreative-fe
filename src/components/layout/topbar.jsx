"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";

export function Topbar() {
  const { user, logout } = useAuth();

  return (
    <header className="h-14 flex items-center justify-between border-b px-4 bg-background">
      <div className="font-medium text-sm">Backend Panel</div>
      <div className="flex items-center gap-3 text-sm">
        {user && (
          <>
            <span className="text-muted-foreground">
              {user.username} ({user.role})
            </span>
            <Button size="sm" variant="outline" onClick={logout}>
              Logout
            </Button>
          </>
        )}
      </div>
    </header>
  );
}