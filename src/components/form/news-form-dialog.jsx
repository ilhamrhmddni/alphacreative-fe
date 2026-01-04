"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
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
import { uploadNewsPhoto } from "@/lib/upload";
import { resolveMediaUrl } from "@/lib/utils";
import { X } from "lucide-react";

function toDateInputValue(dateLike) {
  if (!dateLike) return "";
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

export default function NewsFormDialog({
  open,
  onOpenChange,
  initialData,
  onSubmit,
  eventOptions = [],
  eventsLoading = false,
}) {
  const isEdit = Boolean(initialData);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  
  // Form state
  const [title, setTitle] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [tanggal, setTanggal] = useState("");
  const [eventId, setEventId] = useState("");
  const [tags, setTags] = useState([]);
  const [photoPath, setPhotoPath] = useState("");
  
  // Photo upload state
  const [pendingFile, setPendingFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [photoError, setPhotoError] = useState("");
  
  // Tag input state
  const [tagInput, setTagInput] = useState("");

  // Initialize form when dialog opens or data changes
  useEffect(() => {
    if (open) {
      const eventIdValue = initialData?.eventId ?? initialData?.event?.id ?? null;
      const tagsValue = Array.isArray(initialData?.tags)
        ? initialData.tags.filter(Boolean)
        : [];

      setTitle(initialData?.title || "");
      setDeskripsi(initialData?.deskripsi || "");
      setTanggal(toDateInputValue(initialData?.tanggal));
      setPhotoPath(initialData?.photoPath || "");
      setEventId(eventIdValue != null ? String(eventIdValue) : "");
      setTags(tagsValue);
      setPendingFile(null);
      setPreviewUrl("");
      setPhotoError("");
      setTagInput("");
      setSubmitting(false);
      setUploadingPhoto(false);
    }
  }, [open, initialData]);

  function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoError("");
    setPendingFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  }

  function handleAddTag() {
    const value = tagInput.trim();
    if (value && !tags.includes(value)) {
      setTags([...tags, value]);
      setTagInput("");
    }
  }

  function handleRemoveTag(tagToRemove) {
    setTags(tags.filter((t) => t !== tagToRemove));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!onSubmit) return;

    let finalPhotoPath = photoPath;

    try {
      setSubmitting(true);

      // Upload photo if there's a pending file
      if (pendingFile) {
        setUploadingPhoto(true);
        try {
          finalPhotoPath = await uploadNewsPhoto(pendingFile);
        } catch (err) {
          console.error(err);
          setPhotoError(err.message || "Gagal mengunggah foto");
          return;
        } finally {
          setUploadingPhoto(false);
        }
      }

      // Build payload
      const payload = {
        title: title?.trim(),
        deskripsi: deskripsi || "",
        tanggal: tanggal ? new Date(tanggal).toISOString() : null,
        photoPath: finalPhotoPath || null,
        tags: tags.filter(Boolean),
      };

      // Add eventId if valid
      if (eventId && eventId !== "") {
        const eventIdNum = Number(eventId);
        if (!Number.isNaN(eventIdNum)) {
          payload.eventId = eventIdNum;
        }
      }

      await onSubmit(payload);
      onOpenChange(false);
    } catch (err) {
      console.error("Submit error:", err);
    } finally {
      setSubmitting(false);
    }
  }

  const isBusy = submitting || uploadingPhoto;
  const displayPreview = previewUrl || (photoPath ? resolveMediaUrl(photoPath) || photoPath : "");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-lg sm:max-w-xl max-h-[90vh] overflow-y-auto rounded-xl border bg-card p-0 shadow-lg">
        <DialogHeader className="px-5 pt-5 pb-3 border-b">
          <DialogTitle className="text-base sm:text-lg font-semibold">
            {isEdit ? "Edit Berita" : "Tambah Berita"}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm mt-1">
            {isEdit
              ? "Perbarui informasi berita yang tampil ke publik."
              : "Unggah berita atau pengumuman baru untuk pengunjung."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-5 pt-4 pb-6 space-y-4">
          <div className="space-y-2">
            <Label className="text-xs sm:text-sm font-medium">
              Judul Berita <span className="text-red-500">*</span>
            </Label>
            <Input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Masukkan judul berita"
              className="h-9 rounded-md"
              disabled={isBusy}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs sm:text-sm font-medium">
              Event Terkait <span className="text-gray-400">(opsional)</span>
            </Label>
            <Select
              value={eventId}
              onValueChange={setEventId}
              disabled={eventsLoading || isBusy}
            >
              <SelectTrigger className="h-9 w-full rounded-md">
                <SelectValue
                  placeholder={
                    eventsLoading ? "Memuat event..." : "Pilih event (atau biarkan kosong)"
                  }
                />
              </SelectTrigger>
              <SelectContent className="rounded-md border bg-card shadow-md">
                <SelectItem value="">Tidak ada event</SelectItem>
                {eventOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs sm:text-sm font-medium">
              Tanggal Tayang <span className="text-red-500">*</span>
            </Label>
            <Input
              type="date"
              required
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              className="h-9 rounded-md"
              disabled={isBusy}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs sm:text-sm font-medium">
              Deskripsi <span className="text-red-500">*</span>
            </Label>
            <Textarea
              required
              rows={5}
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              placeholder="Tuliskan isi berita atau pengumuman..."
              className="rounded-md text-xs sm:text-sm"
              disabled={isBusy}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs sm:text-sm font-medium">Tag Berita</Label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Tekan Enter untuk menambahkan tag"
                className="h-9 rounded-md text-xs sm:text-sm"
                disabled={isBusy}
              />
              <Button
                type="button"
                variant="outline"
                className="h-9 rounded-md"
                disabled={!tagInput.trim() || isBusy}
                onClick={handleAddTag}
              >
                Tambah
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-full border bg-muted px-2 py-0.5 text-[11px] font-medium"
                  >
                    {tag}
                    <button
                      type="button"
                      className="rounded-full p-0.5"
                      onClick={() => handleRemoveTag(tag)}
                      disabled={isBusy}
                      aria-label={`Hapus tag ${tag}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-xs sm:text-sm font-medium">
              Foto Pendukung{" "}
              <span className="text-xs text-muted-foreground">(Opsional)</span>
            </Label>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="block w-full cursor-pointer text-xs file:mr-3 file:rounded-md file:border file:bg-card file:px-3 file:py-1.5 file:text-xs file:font-medium file:hover:bg-muted sm:text-sm"
              disabled={isBusy}
            />

            {displayPreview && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-md text-xs"
                    disabled={isBusy}
                  >
                    Lihat preview
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="sm:max-w-md rounded-xl border bg-card">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Preview Foto</AlertDialogTitle>
                    <AlertDialogDescription className="text-xs">
                      {pendingFile
                        ? "Ini adalah gambar yang baru kamu pilih."
                        : "Ini foto yang tersimpan saat ini."}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="mt-2 flex w-full justify-center">
                    <div className="relative max-h-[60vh] w-full overflow-hidden rounded-md border">
                      <Image
                        src={displayPreview}
                        alt="Preview foto berita"
                        width={640}
                        height={360}
                        className="h-auto w-full object-contain"
                        unoptimized
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <AlertDialogCancel>Tutup</AlertDialogCancel>
                  </div>
                </AlertDialogContent>
              </AlertDialog>
            )}

            {!pendingFile && photoPath && (
              <p className="text-[11px] text-muted-foreground break-all">
                Foto tersimpan: <span className="font-medium">{photoPath}</span>
              </p>
            )}

            {photoError && (
              <p className="text-[11px] text-red-500">{photoError}</p>
            )}
          </div>

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isBusy}
              className="h-9 w-full rounded-md sm:w-auto"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isBusy}
              className="h-9 w-full rounded-md sm:w-auto"
            >
              {uploadingPhoto
                ? "Mengunggah foto..."
                : submitting
                ? "Menyimpan..."
                : isEdit
                ? "Simpan Perubahan"
                : "Publikasikan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
