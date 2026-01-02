"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
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
import { uploadGalleryPhoto } from "@/lib/upload";
import { resolveMediaUrl } from "@/lib/utils";
import { Loader2, Upload } from "lucide-react";

const EMPTY_FORM = {
  title: "",
  caption: "",
  photoPath: "",
  order: "0",
  isPublished: true,
};

export default function GalleryFormDialog({ open, onOpenChange, initialData, onSubmit }) {
  const [form, setForm] = useState(() => ({ ...EMPTY_FORM }));
  const [pendingFile, setPendingFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [photoError, setPhotoError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!initialData) {
      setForm({ ...EMPTY_FORM });
      setPreviewUrl("");
      setPendingFile(null);
      setPhotoError("");
      setFormError("");
      return;
    }
    setForm({
      title: initialData.title || "",
      caption: initialData.caption || "",
      photoPath: initialData.photoPath || "",
      order:
        initialData.order === 0 || initialData.order
          ? String(initialData.order)
          : "0",
      isPublished:
        initialData.isPublished === undefined ? true : Boolean(initialData.isPublished),
    });
    setPreviewUrl(initialData.photoPath || "");
    setPendingFile(null);
    setPhotoError("");
    setFormError("");
  }, [initialData]);

  useEffect(() => {
    if (!pendingFile) return;
    const url = URL.createObjectURL(pendingFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [pendingFile]);

  const displayPreview = useMemo(() => {
    if (pendingFile && previewUrl) return previewUrl;
    if (form.photoPath) {
      return resolveMediaUrl(form.photoPath) || form.photoPath;
    }
    return "";
  }, [pendingFile, previewUrl, form.photoPath]);

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setPendingFile(file);
    setPhotoError("");
    setFormError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!onSubmit) return;
    if (!form.title.trim()) {
      setFormError("Judul harus diisi.");
      return;
    }

    try {
      setSubmitting(true);
      setPhotoError("");
      setFormError("");

      let photoPath = form.photoPath;
      if (pendingFile) {
        setUploadingPhoto(true);
        try {
          const uploadedUrl = await uploadGalleryPhoto(pendingFile);
          photoPath = uploadedUrl;
        } catch (err) {
          setPhotoError(err.message || "Gagal mengunggah foto");
          return;
        } finally {
          setUploadingPhoto(false);
        }
      }

      if (!photoPath) {
        setPhotoError("Foto galeri harus diunggah.");
        return;
      }

      const payload = {
        title: form.title.trim(),
        caption: form.caption.trim() ? form.caption.trim() : null,
        photoPath,
        order: Number.isFinite(Number(form.order)) ? Number(form.order) : 0,
        isPublished: Boolean(form.isPublished),
      };

      await onSubmit(payload);
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    onOpenChange?.(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md rounded-xl border border-border bg-card p-0 shadow-lg">
        <DialogHeader className="border-b border-border px-5 pt-5 pb-3">
          <DialogTitle className="text-base font-semibold text-foreground">
            {initialData ? "Edit Foto Galeri" : "Tambah Foto Galeri"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Unggah foto dan caption singkat untuk ditampilkan pada landing page.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5 text-sm">
          {formError && (
            <p className="text-[11px] font-medium text-red-500">{formError}</p>
          )}

          <div className="space-y-2">
            <Label htmlFor="gallery-title">Judul</Label>
            <Input
              id="gallery-title"
              value={form.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="Contoh: Momen Parade"
              className="h-9 rounded-md border-border"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gallery-caption">Caption</Label>
            <Textarea
              id="gallery-caption"
              value={form.caption}
              onChange={(e) => handleChange("caption", e.target.value)}
              placeholder="Tuliskan caption singkat (opsional)"
              rows={3}
              className="rounded-md border-border"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="gallery-order">Urutan</Label>
              <Input
                id="gallery-order"
                type="number"
                value={form.order}
                onChange={(e) => handleChange("order", e.target.value)}
                className="h-9 rounded-md border-border"
              />
              <p className="text-[11px] text-muted-foreground">
                Foto dengan angka lebih kecil akan tampil lebih dulu.
              </p>
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="gallery-photo">Foto</Label>
            <input
              id="gallery-photo"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full cursor-pointer text-xs text-muted-foreground file:mr-3 file:rounded-md file:border file:border-border file:bg-card file:px-3 file:py-1.5 file:text-xs file:font-medium file:hover:bg-muted"
            />
            {displayPreview ? (
              <div className="relative h-48 w-full overflow-hidden rounded-lg border border-border">
                <Image
                  src={displayPreview}
                  alt={form.title || "Preview foto galeri"}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            ) : (
              <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-border bg-muted text-xs text-muted-foreground">
                <div className="flex flex-col items-center gap-2">
                  <Upload className="h-5 w-5" />
                  <span>Belum ada foto dipilih</span>
                </div>
              </div>
            )}
            {photoError && <p className="text-[11px] text-red-500">{photoError}</p>}
          </div>

          <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={submitting || uploadingPhoto}
              className="h-9 rounded-md sm:w-auto"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={submitting || uploadingPhoto}
              className="h-9 rounded-md sm:w-auto"
            >
              {uploadingPhoto ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Mengunggah...
                </span>
              ) : submitting ? (
                "Menyimpan..."
              ) : initialData ? (
                "Simpan Perubahan"
              ) : (
                "Tambah Galeri"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
