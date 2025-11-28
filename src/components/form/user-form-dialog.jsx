"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ROLE_OPTIONS = [
  { value: "admin", label: "Admin" },
  { value: "operator", label: "Operator" },
  { value: "juri", label: "Juri" },
  { value: "peserta", label: "Peserta" },
];

const STATUS_OPTIONS = [
  { value: "true", label: "Aktif" },
  { value: "false", label: "Nonaktif" },
];

export default function UserFormDialog({
  open,
  onOpenChange,
  initialData,
  onSubmit,
  onResetPassword,
  roleOptions: roleOptionsProp,
}) {
  const availableRoleOptions =
    Array.isArray(roleOptionsProp) && roleOptionsProp.length > 0
      ? roleOptionsProp
      : ROLE_OPTIONS;
  const defaultRoleValue =
    initialData?.role ?? availableRoleOptions[0]?.value ?? "operator";
  const [form, setForm] = useState(() => ({
    email: initialData?.email ?? "",
    username: initialData?.username ?? "",
    role: defaultRoleValue,
    isActive:
      initialData?.isActive !== undefined ? initialData.isActive : true,
    password: "",
    nisnNta: initialData?.nisnNta ?? "",
    alamat: initialData?.alamat ?? "",
  }));
  const [submitting, setSubmitting] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    setForm({
      email: initialData?.email ?? "",
      username: initialData?.username ?? "",
      role: initialData?.role ?? availableRoleOptions[0]?.value ?? "operator",
      isActive:
        initialData?.isActive !== undefined ? initialData.isActive : true,
      password: "",
      nisnNta: initialData?.nisnNta ?? "",
      alamat: initialData?.alamat ?? "",
    });
  }, [initialData, availableRoleOptions]);

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleResetPassword() {
    if (!onResetPassword || !initialData) return;
    try {
      setResetting(true);
      await onResetPassword(initialData);
    } finally {
      setResetting(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!onSubmit) return;

    try {
      setSubmitting(true);
      const payload = {
        email: form.email.trim(),
        username: form.username.trim(),
        role: form.role,
        isActive: Boolean(form.isActive),
        nisnNta: form.nisnNta?.trim() || null,
        alamat: form.alamat?.trim() || null,
      };

      if (!initialData) {
        payload.password = form.password;
      }

      await onSubmit(payload);
    } finally {
      setSubmitting(false);
    }
  }

  const isEdit = Boolean(initialData);
  const statusValue = useMemo(
    () => (form.isActive ? "true" : "false"),
    [form.isActive]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-lg max-h-[90vh] overflow-y-auto rounded-xl border border-slate-200 bg-white p-0 shadow-lg">
        <DialogHeader className="px-5 pt-5 pb-3 border-b border-slate-100">
          <DialogTitle className="text-base sm:text-lg font-semibold text-slate-900">
            {isEdit ? "Edit User" : "Tambah User"}
          </DialogTitle>
          <DialogDescription className="mt-1 text-xs text-slate-500 sm:text-sm">
            {isEdit
              ? "Perbarui data user dan peran mereka."
              : availableRoleOptions.length === 1
              ? `Buat akun baru untuk ${availableRoleOptions[0].label}.`
              : "Buat akun baru untuk admin, operator, juri, atau peserta."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-5 pt-4 pb-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs sm:text-sm font-medium text-slate-900">
              Email <span className="text-red-500">*</span>
            </label>
            <Input
              required
              type="email"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="user@example.com"
              className="h-9 rounded-md border-slate-200 text-xs sm:text-sm placeholder:text-slate-400"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs sm:text-sm font-medium text-slate-900">
              Username <span className="text-red-500">*</span>
            </label>
            <Input
              required
              value={form.username}
              onChange={(e) => handleChange("username", e.target.value)}
              placeholder="Nama pengguna"
              className="h-9 rounded-md border-slate-200 text-xs sm:text-sm placeholder:text-slate-400"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs sm:text-sm font-medium text-slate-900">
              Role <span className="text-red-500">*</span>
            </label>
            <Select
              value={form.role}
              onValueChange={(val) => handleChange("role", val)}
            >
              <SelectTrigger className="h-9 w-full rounded-md border-slate-200 text-xs sm:text-sm">
                <SelectValue placeholder="Pilih peran" />
              </SelectTrigger>
              <SelectContent className="rounded-md border border-slate-200 bg-white shadow-md">
                {availableRoleOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs sm:text-sm font-medium text-slate-900">
              Status <span className="text-red-500">*</span>
            </label>
            <Select
              value={statusValue}
              onValueChange={(val) =>
                handleChange("isActive", val === "true")
              }
            >
              <SelectTrigger className="h-9 w-full rounded-md border-slate-200 text-xs sm:text-sm">
                <SelectValue placeholder="Pilih status" />
              </SelectTrigger>
              <SelectContent className="rounded-md border border-slate-200 bg-white shadow-md">
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {!isEdit && (
            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-medium text-slate-900">
                Password Sementara <span className="text-red-500">*</span>
              </label>
              <Input
                required
                type="password"
                value={form.password}
                onChange={(e) => handleChange("password", e.target.value)}
                placeholder="Minimal 6 karakter"
                className="h-9 rounded-md border-slate-200 text-xs sm:text-sm placeholder:text-slate-400"
              />
              <p className="text-[11px] text-slate-500">
                Berikan password ini ke user dan minta mereka mengganti setelah
                login.
              </p>
            </div>
          )}

          {isEdit && onResetPassword && (
            <div className="space-y-2 rounded-md border border-dashed border-slate-200 p-3">
              <p className="text-sm font-semibold text-slate-900">
                Reset Password
              </p>
              <p className="text-xs text-slate-500">
                Atur ulang password user ke nilai default{" "}
                <span className="font-semibold">12345678</span>. Ingatkan user
                untuk mengganti password dari halaman profil mereka.
              </p>
              <Button
                type="button"
                variant="outline"
                className="h-9 rounded-md text-xs sm:text-sm"
                disabled={resetting}
                onClick={handleResetPassword}
              >
                {resetting ? "Mereset..." : "Reset ke Password Default"}
              </Button>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs sm:text-sm font-medium text-slate-900">
              NISN / NTA
            </label>
            <Input
              value={form.nisnNta}
              onChange={(e) => handleChange("nisnNta", e.target.value)}
              placeholder="Opsional"
              className="h-9 rounded-md border-slate-200 text-xs sm:text-sm placeholder:text-slate-400"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs sm:text-sm font-medium text-slate-900">
              Alamat
            </label>
            <Input
              value={form.alamat}
              onChange={(e) => handleChange("alamat", e.target.value)}
              placeholder="Alamat lengkap (opsional)"
              className="h-9 rounded-md border-slate-200 text-xs sm:text-sm placeholder:text-slate-400"
            />
          </div>


          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={submitting}
              onClick={() => onOpenChange?.(false)}
              className="h-9 w-full rounded-md sm:w-auto"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="h-9 w-full rounded-md sm:w-auto"
            >
              {submitting
                ? "Menyimpan..."
                : isEdit
                ? "Simpan Perubahan"
                : "Buat User"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
