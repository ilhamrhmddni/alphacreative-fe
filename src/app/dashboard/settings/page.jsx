"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import PageContainer from "@/components/layout/page-container";
import PageHeader from "@/components/layout/page-header";
import { MerchandiseContactSettings } from "@/components/settings/merchandise-contact-settings";
import { DarkModeSettings } from "@/components/settings/dark-mode-settings";

export default function SettingsPage() {
  const router = useRouter();
  const { user, initializing } = useAuth();

  useEffect(() => {
    if (!initializing && !user) {
      router.push("/dashboard");
    }
  }, [initializing, user, router]);

  if (initializing || !user) {
    return null;
  }

  return (
    <PageContainer>
      <PageHeader
        title="Pengaturan"
        description="Kelola preferensi dan konfigurasi sistem"
      />

      <div className="space-y-8">
        <div className="grid gap-6 lg:grid-cols-1">
          <DarkModeSettings />
          {(user.role === "admin" || user.role === "operator") && (
            <MerchandiseContactSettings />
          )}
        </div>
      </div>
    </PageContainer>
  );
}
