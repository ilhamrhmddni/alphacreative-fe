"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { uploadPartnerLogo } from "@/lib/upload";
import { resolveMediaUrl } from "@/lib/utils";
import {
  booleanFromValue,
  sanitizeText,
  stringOrEmpty,
  toNullableText,
} from "@/lib/form-helpers";
import { Loader2, Upload } from "lucide-react";

const EMPTY_FORM = {
  name: "",
  role: "",
  description: "",
  isPublished: true,
  logoPath: "",
};

export default function PartnershipFormDialog({
  open,
  onOpenChange,
  initialData,
  onSubmit,
}) {
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [pendingFile, setPendingFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [logoError, setLogoError] = useState("");

  useEffect(() => {
    if (!initialData) {
      setForm({ ...EMPTY_FORM });
      setPendingFile(null);
      setPreviewUrl("");
      setFormError("");
      setLogoError("");
      return;
    }
    setForm({
      name: stringOrEmpty(initialData.name),
      role: stringOrEmpty(initialData.role),
      description: stringOrEmpty(initialData.description),
      isPublished: booleanFromValue(initialData.isPublished, true),
      logoPath: stringOrEmpty(initialData.logoPath || initialData.logo),
    });
    setPendingFile(null);
    setPreviewUrl(stringOrEmpty(initialData.logoPath || initialData.logo));
    setFormError("");
    setLogoError("");
  }, [initialData]);

  useEffect(() => {
    if (!pendingFile) return;
    const url = URL.createObjectURL(pendingFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [pendingFile]);

  const displayPreview = useMemo(() => {
    if (pendingFile && previewUrl) return previewUrl;
    if (form.logoPath) {
      return resolveMediaUrl(form.logoPath) || form.logoPath;
    }
    return "";
  }, [pendingFile, previewUrl, form.logoPath]);

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setPendingFile(file);
    setLogoError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!onSubmit) return;

    if (!form.name.trim()) {
      setFormError("Nama partner wajib diisi.");
      return;
    }

    try {
      setSubmitting(true);
      setFormError("");

      let logoPath = form.logoPath;
      if (pendingFile) {
        setUploading(true);
        try {
          const uploadedUrl = await uploadPartnerLogo(pendingFile);
          logoPath = uploadedUrl;
        } catch (err) {
          setLogoError(err.message || "Gagal mengunggah logo");
          return;
        } finally {
          setUploading(false);
        }
      }

      if (!logoPath) {
        setLogoError("Logo wajib diunggah.");
        return;
      }

      const payload = {
        name: sanitizeText(form.name),
        role: toNullableText(form.role),
        description: toNullableText(form.description),
        type: "collaboration",
        order:
          typeof initialData?.order === "number" ? initialData.order : 0,
        isPublished: booleanFromValue(form.isPublished, true),
        logoPath,
      };

      await onSubmit(payload);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-lg rounded-xl border border-border bg-card p-0 shadow-lg">
        <DialogHeader className="border-b border-border px-5 pt-5 pb-3">
          <DialogTitle className="text-base font-semibold text-foreground">
            {initialData?.id ? "Edit Kolaborasi" : "Tambah Kolaborasi"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Kelola informasi kolaborasi yang tampil di landing page.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5 text-sm">
          {formError && (
            <p className="text-[11px] font-medium text-red-500">{formError}</p>
          )}

          <div className="space-y-2">
            <Label htmlFor="partner-name">
              Nama Partner <span className="text-red-500">*</span>
            </Label>
            <Input
              id="partner-name"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Contoh: Alpha Creative Nusantara"
              className="h-9 rounded-md border-border"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="partner-role">Peran</Label>
            <Input
              id="partner-role"
              value={form.role}
              onChange={(e) => handleChange("role", e.target.value)}
              placeholder="Misalnya: Event Partner"
              className="h-9 rounded-md border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="partner-description">Deskripsi</Label>
            <Textarea
              id="partner-description"
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Tuliskan ringkasan dukungan atau kolaborasi"
              rows={3}
              className="rounded-md border-border"
            />
          </div>

          <div className="space-y-2">
            <Label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isPublished}
                onChange={(e) => handleChange("isPublished", e.target.checked)}
                className="h-4 w-4 rounded border border-border"
              />
              Tampilkan di landing page
            </Label>
            <p className="text-[11px] text-muted-foreground">
              Nonaktifkan untuk menyembunyikan sementara.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="partner-logo">
              Logo <span className="text-red-500">*</span>
            </Label>
            <input
              id="partner-logo"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full cursor-pointer text-xs text-muted-foreground file:mr-3 file:rounded-md file:border file:border-border file:bg-card file:px-3 file:py-1.5 file:text-xs file:font-medium file:hover:bg-muted"
            />
            {displayPreview ? (
              <div className="relative h-32 w-full overflow-hidden rounded-lg border border-border bg-card/80">
                <Image
                  src={displayPreview}
                  alt={form.name || "Logo partner"}
                  fill
                  className="object-contain p-6"
                  unoptimized
                />
              </div>
            ) : (
              <div className="flex h-28 items-center justify-center rounded-lg border border-dashed border-border bg-muted text-xs text-muted-foreground">
                <div className="flex flex-col items-center gap-2">
                  <Upload className="h-5 w-5" />
                  <span>Belum ada logo dipilih</span>
                </div>
              </div>
            )}
            {logoError && (
              <p className="text-[11px] text-red-500">{logoError}</p>
            )}
          </div>

          <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="h-9 rounded-md sm:w-auto"
              disabled={submitting || uploading}
              onClick={() => onOpenChange?.(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="h-9 rounded-md sm:w-auto"
              disabled={submitting || uploading}
            >
              {uploading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Mengunggah...
                </span>
              ) : submitting ? (
                "Menyimpan..."
              ) : initialData?.id ? (
                "Simpan Perubahan"
              ) : (
                "Tambah Kolaborasi"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
