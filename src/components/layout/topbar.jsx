"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { UserCircle2 } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { resolveMediaUrl } from "@/lib/utils";

export function Topbar() {
  const { user, logout } = useAuth();

  const profilePhotoUrl = useMemo(
    () => resolveMediaUrl(user?.profilePhotoPath),
    [user?.profilePhotoPath]
  );

  return (
    <header className="h-14 flex items-center justify-between border-b px-4 bg-background">
      <Link href="/dashboard" className="flex items-center gap-2">
        <div className="relative h-8 w-40 shrink-0">
          <Image
            src="/logo.svg"
            alt="Alpha Creative"
            fill
            sizes="160px"
            priority
            className="object-contain"
          />
        </div>
      </Link>
      <div className="flex items-center gap-3 text-sm">
        {user && (
          <>
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-border bg-muted">
                {profilePhotoUrl ? (
                  <img
                    src={profilePhotoUrl}
                    alt="Foto profil"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <UserCircle2 className="h-5 w-5" />
                )}
              </div>
              <span>
                {user.username} <span className="text-xs">({user.role})</span>
              </span>
            </div>
            <Button size="sm" variant="outline" onClick={logout}>
              Logout
            </Button>
          </>
        )}
      </div>
    </header>
  );
}