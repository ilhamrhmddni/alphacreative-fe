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
import { Upload, Loader2 } from "lucide-react";
import { uploadMerchPhoto } from "@/lib/upload";
import { resolveMediaUrl } from "@/lib/utils";
import {
  sanitizeText,
  stringOrEmpty,
  toNullableText,
  numberFromValue,
  booleanFromValue,
} from "@/lib/form-helpers";

const EMPTY_FORM = {
  name: "",
  productCode: "",
  category: "",
  description: "",
  price: "",
  stock: "",
  isPublished: true,
  photoPath: "",
};

function buildInitialForm(initialData) {
  if (!initialData) return { ...EMPTY_FORM };
  return {
    name: stringOrEmpty(initialData.name),
    productCode: stringOrEmpty(initialData.productCode),
    category: stringOrEmpty(initialData.category),
    description: stringOrEmpty(initialData.description),
    price:
      initialData.price === undefined || initialData.price === null
        ? ""
        : String(initialData.price),
    stock:
      initialData.stock === undefined || initialData.stock === null
        ? ""
        : String(initialData.stock),
    isPublished:
      initialData.isPublished === undefined ? true : Boolean(initialData.isPublished),
    photoPath: stringOrEmpty(initialData.photoPath),
  };
}

export default function MerchandiseFormDialog({ open, onOpenChange, initialData, onSubmit }) {
  const [form, setForm] = useState(() => buildInitialForm(initialData));
  const [pendingFile, setPendingFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(() => form.photoPath || "");
  const [photoError, setPhotoError] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    const nextForm = buildInitialForm(initialData);
    setForm(nextForm);
    setPendingFile(null);
    setPreviewUrl(nextForm.photoPath || "");
    setPhotoError("");
    setFormError("");
    setSubmitting(false);
    setUploadingPhoto(false);
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
  }, [form.photoPath, pendingFile, previewUrl]);

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleCheckboxChange(event) {
    handleChange("isPublished", event.target.checked);
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setPendingFile(file);
    setPhotoError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!onSubmit) return;

    const trimmedName = sanitizeText(form.name);
    if (!trimmedName) {
      setFormError("Nama merchandise wajib diisi.");
      return;
    }

    const trimmedProductCode = sanitizeText(form.productCode);
    if (!trimmedProductCode) {
      setFormError("Kode produk wajib diisi.");
      return;
    }

    let photoPath = form.photoPath;

    try {
      setSubmitting(true);
      setFormError("");

      if (pendingFile) {
        setUploadingPhoto(true);
        try {
          photoPath = await uploadMerchPhoto(pendingFile);
        } catch (err) {
          setPhotoError(err.message || "Gagal mengunggah foto merchandise");
          return;
        } finally {
          setUploadingPhoto(false);
        }
      }

      const payload = {
        name: trimmedName,
        productCode: trimmedProductCode,
        category: toNullableText(form.category),
        description: toNullableText(form.description),
        price: numberFromValue(form.price, null),
        stock: numberFromValue(form.stock, null),
        isPublished: booleanFromValue(form.isPublished, true),
        photoPath: photoPath ? stringOrEmpty(photoPath) : null,
      };

      await onSubmit(payload);
    } finally {
      setSubmitting(false);
    }
  }

  const isEdit = Boolean(initialData);
  const busy = submitting || uploadingPhoto;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[90vh] w-[95vw] max-w-md flex-col rounded-xl border border-border bg-card p-0 shadow-lg">
        <DialogHeader className="flex-shrink-0 border-b border-border px-5 pt-5 pb-3">
          <DialogTitle className="text-base font-semibold text-foreground">
            {isEdit ? "Edit Merchandise" : "Tambah Merchandise"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Lengkapi detail produk untuk katalog merchandise.
          </DialogDescription>
          <p className="mt-2 text-[11px] text-muted-foreground">
            Kolom bertanda <span className="text-red-500">*</span> wajib diisi.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5 text-sm">
          {formError && <p className="text-[11px] font-medium text-red-500">{formError}</p>}

          <div className="space-y-2">
            <Label htmlFor="merch-name">
              Nama Produk <span className="text-red-500">*</span>
            </Label>
            <Input
              id="merch-name"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Contoh: Kaos Alpha Creative"
              className="h-9 rounded-md border-border"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="merch-code">
                Kode Produk <span className="text-red-500">*</span>
              </Label>
              <Input
                id="merch-code"
                value={form.productCode}
                onChange={(e) => handleChange("productCode", e.target.value)}
                placeholder="Contoh: KAOS-001"
                className="h-9 rounded-md border-border"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="merch-category">Kategori</Label>
              <Input
                id="merch-category"
                value={form.category}
                onChange={(e) => handleChange("category", e.target.value)}
                placeholder="Contoh: Pakaian"
                className="h-9 rounded-md border-border"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="merch-description">Deskripsi</Label>
            <Textarea
              id="merch-description"
              rows={4}
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Tuliskan deskripsi singkat produk"
              className="rounded-md border-border"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="merch-price">Harga</Label>
              <Input
                id="merch-price"
                type="number"
                min="0"
                value={form.price}
                onChange={(e) => handleChange("price", e.target.value)}
                placeholder="Contoh: 150000"
                className="h-9 rounded-md border-border"
              />
              <p className="text-[11px] text-muted-foreground">Kosongkan bila belum ditentukan.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="merch-stock">Stok</Label>
              <Input
                id="merch-stock"
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) => handleChange("stock", e.target.value)}
                placeholder="Contoh: 25"
                className="h-9 rounded-md border-border"
              />
              <p className="text-[11px] text-muted-foreground">Isi 0 bila stok habis.</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
              <input
                type="checkbox"
                checked={Boolean(form.isPublished)}
                onChange={handleCheckboxChange}
                className="h-4 w-4 rounded border border-border"
              />
              Tampilkan di katalog
            </Label>
            <p className="text-[11px] text-muted-foreground">
              Nonaktifkan untuk menyembunyikan produk sementara.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="merch-photo">Foto Produk</Label>
            {displayPreview ? (
              <div className="space-y-2">
                <div className="relative h-48 w-full overflow-hidden rounded-lg border border-border">
                  <Image
                    src={displayPreview}
                    alt={form.name || "Preview merchandise"}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <input
                  id="merch-photo"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="block w-full cursor-pointer text-xs text-muted-foreground file:mr-3 file:rounded-md file:border file:border-border file:bg-card file:px-3 file:py-1.5 file:text-xs file:font-medium file:hover:bg-muted"
                />
              </div>
            ) : (
              <input
                id="merch-photo"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full cursor-pointer text-xs text-muted-foreground file:mr-3 file:rounded-md file:border file:border-border file:bg-card file:px-3 file:py-1.5 file:text-xs file:font-medium file:hover:bg-muted"
              />
            )}
            {photoError && <p className="text-[11px] text-red-500">{photoError}</p>}
          </div>

          </div>

          <div className="flex-shrink-0 border-t border-border px-5 py-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                className="h-9 rounded-md sm:w-auto"
                onClick={() => onOpenChange?.(false)}
                disabled={busy}
              >
                Batal
              </Button>
              <Button type="submit" className="h-9 rounded-md sm:w-auto" disabled={busy}>
                {uploadingPhoto ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Mengunggah...
                  </span>
                ) : submitting ? (
                  "Menyimpan..."
                ) : isEdit ? (
                  "Simpan Perubahan"
                ) : (
                  "Tambah Merchandise"
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
