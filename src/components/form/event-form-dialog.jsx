"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

import { uploadEventPhoto } from "@/lib/upload";
import {
  numberFromValue,
  sanitizeText,
  stringOrEmpty,
  toNullableText,
} from "@/lib/form-helpers";

function toDateInputValue(dateLike) {
  if (!dateLike) return "";
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

function createInitialForm(initialData) {
  const tempat = sanitizeText(initialData?.tempatEvent);
  return {
    namaEvent: stringOrEmpty(initialData?.namaEvent),
    deskripsiEvent: stringOrEmpty(initialData?.deskripsiEvent),
    tanggalEvent: toDateInputValue(initialData?.tanggalEvent),
    tempatEvent: tempat || "Balikpapan",
    venue: stringOrEmpty(initialData?.venue),
    status: stringOrEmpty(initialData?.status),
    photoPath: stringOrEmpty(initialData?.photoPath),
    kuota: stringOrEmpty(initialData?.kuota),
    biaya: stringOrEmpty(initialData?.biaya),
  };
}

export default function EventFormDialog({
  open,
  onOpenChange,
  initialData,
  onSubmit,
}) {
  const [submitting, setSubmitting] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState("");

  const [pendingFile, setPendingFile] = useState(null);
  const initialFormState = useMemo(() => createInitialForm(initialData), [initialData]);
  const [previewUrl, setPreviewUrl] = useState(initialFormState.photoPath);
  const [form, setForm] = useState(initialFormState);

  useEffect(() => {
    setForm(initialFormState);
    setPhotoError("");
    setUploadingPhoto(false);
    setPendingFile(null);
    setPreviewUrl(initialFormState.photoPath);
  }, [initialFormState]);

  useEffect(() => {
    if (!pendingFile) return;
    const objectUrl = URL.createObjectURL(pendingFile);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [pendingFile]);

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoError("");
    setPendingFile(file);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!onSubmit) return;

    let photoPath = form.photoPath;

    try {
      setSubmitting(true);

      if (pendingFile) {
        setUploadingPhoto(true);
        try {
          const uploadedUrl = await uploadEventPhoto(pendingFile);
          photoPath = uploadedUrl;
        } catch (err) {
          console.error(err);
          setPhotoError(err.message || "Gagal mengunggah foto");
          return;
        } finally {
          setUploadingPhoto(false);
        }
      }

      const payload = {
        namaEvent: sanitizeText(form.namaEvent),
        deskripsiEvent: toNullableText(form.deskripsiEvent),
        tanggalEvent: form.tanggalEvent
          ? new Date(form.tanggalEvent).toISOString()
          : null,
        tempatEvent: sanitizeText(form.tempatEvent) || "Balikpapan",
        venue: toNullableText(form.venue),
        status: toNullableText(form.status),
        photoPath: photoPath || null,
        kuota: numberFromValue(form.kuota),
        biaya: numberFromValue(form.biaya),
      };

      await onSubmit(payload);
    } finally {
      setSubmitting(false);
    }
  }

  const isEdit = !!initialData;
  const isBusy = submitting || uploadingPhoto;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="
          w-[95vw] max-w-lg sm:max-w-xl
          max-h-[90vh] overflow-y-auto
          p-0
          rounded-xl
          border border-border
          bg-card
          shadow-lg
        "
      >
        <DialogHeader className="px-5 pt-5 pb-2 border-b border-border">
          <DialogTitle className="text-base sm:text-lg font-semibold text-foreground">
            {isEdit ? "Edit Event" : "Tambah Event"}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground mt-1">
            {isEdit
              ? "Perbarui informasi event yang sudah terdaftar."
              : "Buat event baru untuk kalender Liga Pembaris."}
          </DialogDescription>
          <p className="mt-2 text-[11px] text-muted-foreground">
            Kolom bertanda <span className="text-red-500">*</span> wajib diisi.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-5 pb-5 pt-4 space-y-4">
          {/* Nama, kategori, tanggal */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-medium text-foreground">
                Nama Event <span className="text-red-500">*</span>
              </label>
              <Input
                required
                value={form.namaEvent}
                className="h-9 placeholder:text-muted-foreground text-xs sm:text-sm rounded-md border-border"
                onChange={(e) => handleChange("namaEvent", e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-medium text-foreground">
                Tanggal Event <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                required
                value={form.tanggalEvent}
                className="h-9 placeholder:text-muted-foreground text-xs sm:text-sm rounded-md border-border"
                onChange={(e) => handleChange("tanggalEvent", e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-medium text-foreground">
                Deskripsi{" "}
                <span className="text-[10px] sm:text-xs text-muted-foreground">
                  (Opsional)
                </span>
              </label>
              <Textarea
                value={form.deskripsiEvent}
                onChange={(e) =>
                  handleChange("deskripsiEvent", e.target.value)
                }
                rows={3}
                placeholder="Tuliskan deskripsi singkat event…"
                className="placeholder:text-muted-foreground text-xs sm:text-sm rounded-md border-border resize-none"
              />
            </div>
          </div>

          {/* Lokasi & status */}
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-medium text-foreground">
                  Tempat <span className="text-red-500">*</span>
                </label>
                <Input
                  required
                  value={form.tempatEvent}
                  className="h-9 placeholder:text-muted-foreground text-xs sm:text-sm rounded-md border-border"
                  onChange={(e) => handleChange("tempatEvent", e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-medium text-foreground">
                  Venue{" "}
                  <span className="text-[10px] sm:text-xs text-muted-foreground">
                    (Opsional)
                  </span>
                </label>
                <Input
                  value={form.venue}
                  onChange={(e) => handleChange("venue", e.target.value)}
                  placeholder="GOR, Lapangan A, dll"
                  className="h-9 placeholder:text-muted-foreground text-xs sm:text-sm rounded-md border-border"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-medium text-foreground">
                Status{" "}
                <span className="text-[10px] sm:text-xs text-muted-foreground">
                  (Opsional)
                </span>
              </label>
              <Select
                value={form.status || ""}
                onValueChange={(val) => handleChange("status", val)}
              >
                <SelectTrigger className="h-9 w-full text-xs sm:text-sm rounded-md border-border">
                  <SelectValue placeholder="Pilih status (opsional)" />
                </SelectTrigger>
                <SelectContent className="bg-card border border-border shadow-md rounded-md">
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Kuota & biaya */}
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-medium text-foreground">
                  Kuota Peserta{" "}
                  <span className="text-[10px] sm:text-xs text-muted-foreground">
                    (Opsional)
                  </span>
                </label>
                <Input
                  type="number"
                  min={0}
                  value={form.kuota}
                  onChange={(e) => handleChange("kuota", e.target.value)}
                  placeholder="Misal 20"
                  className="h-9 placeholder:text-muted-foreground text-xs sm:text-sm rounded-md border-border"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-medium text-foreground">
                  Biaya Pendaftaran (Rp){" "}
                  <span className="text-[10px] sm:text-xs text-muted-foreground">
                    (Opsional)
                  </span>
                </label>
                <Input
                  type="number"
                  min={0}
                  value={form.biaya}
                  onChange={(e) => handleChange("biaya", e.target.value)}
                  placeholder="Misal 150000"
                  className="h-9 placeholder:text-muted-foreground text-xs sm:text-sm rounded-md border-border"
                />
              </div>
            </div>
          </div>

          {/* Media */}
          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-medium text-foreground">
              Foto Event{" "}
              <span className="text-[10px] sm:text-xs text-muted-foreground">
                (Opsional)
              </span>
            </label>

            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="
                  block w-full text-xs sm:text-sm
                  text-muted-foreground
                  file:mr-3 file:rounded-md
                  file:border file:border-border
                  file:bg-card file:px-3 file:py-1.5
                  file:text-xs file:font-medium
                  file:hover:bg-muted
                  cursor-pointer
                "
              />

              {(previewUrl || form.photoPath) && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="rounded-md text-xs"
                    >
                      Lihat preview
                    </Button>
                  </AlertDialogTrigger>

                  <AlertDialogContent className="sm:max-w-md bg-card rounded-xl border border-border">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Preview Foto Event</AlertDialogTitle>
                      <AlertDialogDescription className="text-xs text-muted-foreground">
                        {pendingFile
                          ? "Ini preview foto yang akan diunggah saat kamu menyimpan."
                          : "Ini foto yang saat ini tersimpan untuk event ini."}
                      </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="mt-2 w-full flex justify-center">
                      <img
                        src={previewUrl || form.photoPath}
                        alt="Preview foto event"
                        className="max-h-[60vh] max-w-full object-contain rounded-md border border-border"
                      />
                    </div>

                    <div className="mt-4 flex justify-end">
                      <AlertDialogCancel>Tutup</AlertDialogCancel>
                    </div>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>

            {!pendingFile && form.photoPath && (
              <p className="text-[11px] text-muted-foreground break-all">
                Foto tersimpan:
                <span className="font-medium ml-1">{form.photoPath}</span>
              </p>
            )}

            {photoError && (
              <p className="text-[11px] text-red-500">{photoError}</p>
            )}
          </div>

          {/* FOOTER */}
          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange?.(false)}
              disabled={isBusy}
              className="w-full sm:w-auto h-9 rounded-md"
            >
              Batal
            </Button>

            <Button
              type="submit"
              disabled={isBusy}
              className="w-full sm:w-auto h-9 rounded-md"
            >
              {uploadingPhoto
                ? "Mengunggah foto..."
                : submitting
                ? "Menyimpan..."
                : isEdit
                ? "Simpan Perubahan"
                : "Buat Event"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}