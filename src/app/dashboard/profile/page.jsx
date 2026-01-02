"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { UserCircle2, ShieldCheck, Mail, Camera, Loader2 } from "lucide-react";

import PageContainer from "@/components/layout/page-container";
import PageHeader from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/components/auth/auth-provider";
import { get, put } from "@/lib/api";
import { cn, resolveMediaUrl } from "@/lib/utils";
import { uploadProfilePhoto } from "@/lib/upload";

export default function ProfilePage() {
  const router = useRouter();
  const { user, initializing, logout, refreshUser } = useAuth();
  const [username, setUsername] = useState(user?.username ?? "");
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [nisnNta, setNisnNta] = useState(user?.nisnNta ?? "");
  const [alamat, setAlamat] = useState(user?.alamat ?? "");
  const [focusEventId, setFocusEventId] = useState(
    user?.focusEventId ? String(user.focusEventId) : ""
  );
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoFeedback, setPhotoFeedback] = useState(null);
  const fileInputRef = useRef(null);
  const isOperator = user?.role === "operator";
  const focusEventOptions = useMemo(() => {
    if (!Array.isArray(events)) return [];
    return events
      .filter((event) => event && typeof event.id === "number")
      .map((event) => ({
        value: String(event.id),
        label: event.namaEvent || `Event #${event.id}`,
      }));
  }, [events]);

  useEffect(() => {
    if (!initializing && !user) {
      router.push("/auth/login");
    }
  }, [initializing, user, router]);

  useEffect(() => {
    setUsername(user?.username ?? "");
    setNisnNta(user?.nisnNta ?? "");
    setAlamat(user?.alamat ?? "");
    setFocusEventId(user?.focusEventId ? String(user.focusEventId) : "");
    setEditing(false);
    setFeedback(null);
  }, [user]);

  useEffect(() => {
    if (!isOperator) return;
    let cancelled = false;
    async function fetchEvents() {
      try {
        setEventsLoading(true);
        const data = await get("/events");
        if (!cancelled) {
          setEvents(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setEventsLoading(false);
      }
    }
    fetchEvents();
    return () => {
      cancelled = true;
    };
  }, [isOperator]);

  if (initializing || !user) {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-muted-foreground">
        Memeriksa sesi...
      </div>
    );
  }

  function handleLogout() {
    logout?.();
    router.push("/auth/login");
  }

  function resetProfileForm() {
    setUsername(user?.username ?? "");
    setNisnNta(user?.nisnNta ?? "");
    setAlamat(user?.alamat ?? "");
    setFocusEventId(user?.focusEventId ? String(user.focusEventId) : "");
    setFeedback(null);
    setEditing(false);
  }

  async function handleUpdateProfile(e) {
    e.preventDefault();
    if (!username.trim()) {
      setFeedback({ type: "error", message: "Nama pengguna tidak boleh kosong." });
      return;
    }

    try {
      setSaving(true);
      setFeedback(null);
      const payload = {
        username: username.trim(),
        nisnNta: nisnNta?.trim() || null,
        alamat: alamat?.trim() || null,
      };
      if (isOperator) {
        payload.focusEventId = focusEventId ? Number(focusEventId) : null;
      }
      const updated = await put("/auth/me", payload);
      const fresh = await refreshUser();
      setUsername(fresh?.username ?? updated.username ?? "");
      setNisnNta(fresh?.nisnNta ?? updated.nisnNta ?? "");
      setAlamat(fresh?.alamat ?? updated.alamat ?? "");
      setFocusEventId(
        fresh?.focusEventId
          ? String(fresh.focusEventId)
          : updated.focusEventId
          ? String(updated.focusEventId)
          : ""
      );
      setFeedback({
        type: "success",
        message: "Profil berhasil diperbarui.",
      });
      setEditing(false);
    } catch (err) {
      setFeedback({
        type: "error",
        message: err.message || "Gagal memperbarui profil.",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleProfilePhotoChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setPhotoFeedback(null);
    try {
      setPhotoUploading(true);
      await uploadProfilePhoto(file);
      await refreshUser();
      setPhotoFeedback({ type: "success", message: "Foto profil berhasil diperbarui." });
    } catch (err) {
      setPhotoFeedback({
        type: "error",
        message: err.message || "Gagal mengunggah foto profil.",
      });
    } finally {
      setPhotoUploading(false);
      if (event.target) {
        event.target.value = ""; // reset agar file yang sama bisa dipilih ulang
      }
    }
  }

  const profilePhotoUrl = useMemo(
    () => resolveMediaUrl(user?.profilePhotoPath),
    [user?.profilePhotoPath]
  );

  function handlePasswordChange(field, value) {
    setPasswordForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    if (!passwordForm.newPassword) {
      setPasswordFeedback({
        type: "error",
        message: "Password baru wajib diisi.",
      });
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordFeedback({
        type: "error",
        message: "Password baru minimal 8 karakter.",
      });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordFeedback({
        type: "error",
        message: "Konfirmasi password tidak sesuai.",
      });
      return;
    }

    try {
      setPasswordSaving(true);
      setPasswordFeedback(null);
      await put("/auth/me/password", {
        newPassword: passwordForm.newPassword,
      });
      setPasswordFeedback({
        type: "success",
        message: "Password berhasil diperbarui.",
      });
      setPasswordForm({
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      setPasswordFeedback({
        type: "error",
        message: err.message || "Gagal mengganti password.",
      });
    } finally {
      setPasswordSaving(false);
    }
  }

  const statusClasses = user.isActive
    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
    : "bg-amber-50 text-amber-700 border border-amber-200";

  return (
    <PageContainer>
      <PageHeader
        title="Profil Akun"
        description="Kelola informasi akun dan keamanan login Anda."
        actions={
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 border border-border shadow-sm">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="relative h-16 w-16">
                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-border bg-muted">
                  {profilePhotoUrl ? (
                    <img
                      src={profilePhotoUrl}
                      alt="Foto profil"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <UserCircle2 className="h-10 w-10 text-muted-foreground" />
                  )}
                </div>
                <button
                  type="button"
                  className="absolute bottom-0 right-0 inline-flex h-7 w-7 items-center justify-center rounded-full border border-white bg-card text-muted-foreground shadow-sm transition-colors hover:bg-muted"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={photoUploading}
                  aria-label="Unggah foto profil"
                >
                  {photoUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleProfilePhotoChange}
                />
              </div>
              <div>
                <CardTitle className="text-base sm:text-lg">
                  {user.username || "Pengguna"}
                </CardTitle>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5" />
                  {user.email}
                </p>
              </div>
            </div>
            <span
              className="rounded-full border border-border px-3 py-1 text-xs font-medium uppercase tracking-wide text-muted-foreground"
            >
              {user.role}
            </span>
          </CardHeader>
          <CardContent className="space-y-6 text-sm">
            {photoFeedback && (
              <div
                className={cn(
                  "rounded-md border px-3 py-2 text-sm",
                  photoFeedback.type === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-red-200 bg-red-50 text-red-700"
                )}
              >
                {photoFeedback.message}
              </div>
            )}
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label>Email</Label>
                  <Input value={user.email} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Peran</Label>
                  <Input value={user.role} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Input value={user.isActive ? "Aktif" : "Nonaktif"} disabled />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="username">Nama Pengguna</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Masukkan nama pengguna baru"
                    disabled={!editing || saving}
                  />
                  <p className="text-xs text-muted-foreground">
                    Nama pengguna minimal 3 karakter.
                  </p>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="nisnNta">NISN / NTA</Label>
                  <Input
                    id="nisnNta"
                    value={nisnNta}
                    onChange={(e) => setNisnNta(e.target.value)}
                    placeholder="Opsional"
                    disabled={!editing || saving}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="alamat">Alamat</Label>
                  <Input
                    id="alamat"
                    value={alamat}
                    onChange={(e) => setAlamat(e.target.value)}
                    placeholder="Alamat lengkap (opsional)"
                    disabled={!editing || saving}
                  />
                </div>
                {isOperator && (
                  <div className="space-y-2 md:col-span-2">
                    <Label>Event Fokus</Label>
                    <Select
                      value={focusEventId || "none"}
                      onValueChange={(value) =>
                        setFocusEventId(value === "none" ? "" : value)
                      }
                      disabled={!editing || saving || eventsLoading}
                    >
                      <SelectTrigger className="h-9 w-full rounded-md border-border text-xs sm:text-sm">
                        <SelectValue
                          placeholder={
                            eventsLoading
                              ? "Memuat event..."
                              : "Pilih event fokus"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent className="rounded-md border border-border bg-card shadow-md">
                        <SelectItem value="none">Belum dipilih</SelectItem>
                        {focusEventOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {!eventsLoading && !focusEventOptions.length && (
                      <p className="text-[11px] text-amber-600">
                        Belum ada event tersedia.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {feedback && (
                <div
                  className={cn(
                    "rounded-md border px-3 py-2 text-sm",
                    feedback.type === "success"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-red-200 bg-red-50 text-red-700"
                  )}
                >
                  {feedback.message}
                </div>
              )}

              <div className="flex justify-end gap-2">
                {editing ? (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={saving}
                      onClick={resetProfileForm}
                    >
                      Batal
                    </Button>
                    <Button type="submit" disabled={saving}>
                      {saving ? "Menyimpan..." : "Simpan Perubahan"}
                    </Button>
                  </>
                ) : (
                  <Button type="button" onClick={() => setEditing(true)}>
                    Edit Profil
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="border border-border shadow-sm">
          <CardHeader className="space-y-1.5">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <ShieldCheck className="h-5 w-5 text-emerald-500" />
              Status & Keamanan
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Pantau status akun dan lakukan logout aman.
            </p>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Status Akun
              </p>
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusClasses}`}
              >
                {user.isActive ? "Aktif" : "Menunggu Konfirmasi"}
              </span>
              <p className="text-xs text-muted-foreground">
                Pastikan data akun selalu terbaru agar mudah diverifikasi.
              </p>
            </div>

            <div className="rounded-md border border-border bg-muted p-3 text-xs text-muted-foreground">
              Login terakhir tercatat di sistem. Hubungi admin bila ada aktivitas
              mencurigakan atau lupa logout dari perangkat lain.
            </div>

            <Button
              variant="ghost"
              className="text-red-600 hover:text-red-700"
              onClick={handleLogout}
            >
              Logout dari semua sesi
            </Button>

            <div className="border-t border-border pt-4">
              <p className="text-sm font-semibold text-foreground">
                Ubah Password
              </p>
              <form onSubmit={handleChangePassword} className="mt-3 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Password Baru</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      handlePasswordChange("newPassword", e.target.value)
                    }
                    placeholder="Minimal 8 karakter"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      handlePasswordChange("confirmPassword", e.target.value)
                    }
                    placeholder="Ulangi password baru"
                  />
                </div>

                {passwordFeedback && (
                  <div
                    className={cn(
                      "rounded-md border px-3 py-2 text-sm",
                      passwordFeedback.type === "success"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-red-200 bg-red-50 text-red-700"
                    )}
                  >
                    {passwordFeedback.message}
                  </div>
                )}

                <div className="flex justify-end">
                  <Button type="submit" disabled={passwordSaving}>
                    {passwordSaving ? "Menyimpan..." : "Simpan Password"}
                  </Button>
                </div>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
