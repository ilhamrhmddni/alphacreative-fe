"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
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
import { uploadNewsPhoto as uploadImage } from "@/lib/upload";
import { resolveMediaUrl } from "@/lib/utils";
import {
  sanitizeText,
  stringOrEmpty,
} from "@/lib/form-helpers";
import { Bold, CornerDownLeft, Italic, Quote, X } from "lucide-react";

function toDateInputValue(dateLike) {
  if (!dateLike) return "";
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

function createInitialForm(initialData) {
  const eventId =
    initialData?.eventId ?? initialData?.event?.id ?? null;
  const tags = Array.isArray(initialData?.tags)
    ? initialData.tags
        .map((tag) => sanitizeText(tag))
        .filter((tag, idx, arr) => tag && arr.indexOf(tag) === idx)
    : [];

  return {
    title: stringOrEmpty(initialData?.title),
    deskripsi: stringOrEmpty(initialData?.deskripsi),
    tanggal: toDateInputValue(initialData?.tanggal),
    photoPath: stringOrEmpty(initialData?.photoPath),
    eventId: eventId != null ? String(eventId) : "",
    tags,
  };
}

export default function NewsFormDialog({
  open,
  onOpenChange,
  initialData,
  onSubmit,
  eventOptions = [],
  eventsLoading = false,
}) {
  const initialFormState = useMemo(() => createInitialForm(initialData), [initialData]);
  const [form, setForm] = useState(initialFormState);
  const [pendingFile, setPendingFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(initialFormState.photoPath);
  const [photoError, setPhotoError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [eventError, setEventError] = useState("");
  const [tagInput, setTagInput] = useState("");
  const textareaRef = useRef(null);

  useEffect(() => {
    setForm(initialFormState);
    setPendingFile(null);
    setPreviewUrl(initialFormState.photoPath);
    setPhotoError("");
    setSubmitting(false);
    setUploadingPhoto(false);
    setEventError("");
    setTagInput("");
  }, [initialFormState]);

  useEffect(() => {
    if (!pendingFile) return;
    const url = URL.createObjectURL(pendingFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [pendingFile]);

  function handleChange(field, value) {
    if (field === "eventId") {
      setEventError("");
    }
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoError("");
    setPendingFile(file);
  }

  function handleAddTag(value) {
    const nextValue = sanitizeText(value ?? tagInput);
    if (!nextValue) return;
    setForm((prev) => {
      if (prev.tags.includes(nextValue)) return prev;
      return { ...prev, tags: [...prev.tags, nextValue] };
    });
    setTagInput("");
  }

  function handleRemoveTag(tag) {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.filter((item) => item !== tag),
    }));
  }

  function handleTagKeyDown(e) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddTag(e.currentTarget.value);
    }
  }

  function applyFormatting(command) {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const { selectionStart, selectionEnd, value } = textarea;
    const selectedText = value.slice(selectionStart, selectionEnd);
    let nextValue = value;
    let start = selectionStart;
    let end = selectionEnd;

    const wrap = (prefix, suffix, placeholder = "teks") => {
      const content = selectedText || placeholder;
      const insertion = `${prefix}${content}${suffix}`;
      nextValue =
        value.slice(0, selectionStart) +
        insertion +
        value.slice(selectionEnd);
      start = selectionStart + prefix.length;
      end = start + content.length;
    };

    switch (command) {
      case "bold":
        wrap("**", "**");
        break;
      case "italic":
        wrap("_", "_");
        break;
      case "quote": {
        const quoteBlock = (selectedText || "kutipan")
          .split("\n")
          .map((line) => `> ${line}`)
          .join("\n");
        nextValue =
          value.slice(0, selectionStart) +
          quoteBlock +
          value.slice(selectionEnd);
        start = selectionStart;
        end = selectionStart + quoteBlock.length;
        break;
      }
      case "break": {
        const insertion = "\n";
        nextValue =
          value.slice(0, selectionStart) +
          insertion +
          value.slice(selectionEnd);
        start = selectionStart + insertion.length;
        end = start;
        break;
      }
      default:
        return;
    }

    setForm((prev) => ({ ...prev, deskripsi: nextValue }));
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(start, end);
    });
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
          const uploadedUrl = await uploadImage(pendingFile);
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
        title: sanitizeText(form.title),
        deskripsi: stringOrEmpty(form.deskripsi),
        tanggal: form.tanggal ? new Date(form.tanggal).toISOString() : null,
        photoPath: photoPath || null,
        tags: form.tags.map((tag) => sanitizeText(tag)).filter(Boolean),
      };

      if (form.eventId) {
        payload.eventId = Number(form.eventId);
      }

      await onSubmit(payload);
    } finally {
      setSubmitting(false);
    }
  }

  const isEdit = Boolean(initialData);
  const isBusy = submitting || uploadingPhoto;
  const previewSource = useMemo(() => {
    if (previewUrl) return previewUrl;
    if (form.photoPath) {
      return resolveMediaUrl(form.photoPath) || form.photoPath;
    }
    return "";
  }, [previewUrl, form.photoPath]);
  const noEventsAvailable = !eventOptions.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-lg sm:max-w-xl max-h-[90vh] overflow-y-auto rounded-xl border border-border bg-card p-0 shadow-lg">
        <DialogHeader className="px-5 pt-5 pb-3 border-b border-border">
          <DialogTitle className="text-base sm:text-lg font-semibold text-foreground">
            {isEdit ? "Edit Berita" : "Tambah Berita"}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground mt-1">
            {isEdit
              ? "Perbarui informasi berita yang tampil ke publik."
              : "Unggah berita atau pengumuman baru untuk pengunjung."}
          </DialogDescription>
          <p className="mt-2 text-[11px] text-muted-foreground">
            Kolom bertanda <span className="text-red-500">*</span> wajib diisi. Kolom lain opsional.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-5 pt-4 pb-6 space-y-4">
          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-medium text-foreground">
              Judul Berita <span className="text-red-500">*</span>
            </label>
            <Input
              required
              value={form.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="Masukkan judul berita"
              className="h-9 rounded-md border-border text-xs sm:text-sm placeholder:text-muted-foreground"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-medium text-foreground">
              Event Terkait <span className="text-gray-400">(opsional)</span>
            </label>
            <Select
              value={form.eventId || ""}
              onValueChange={(value) => handleChange("eventId", value || null)}
              disabled={eventsLoading || isBusy}
            >
              <SelectTrigger className="h-9 w-full rounded-md border-border text-xs sm:text-sm">
                <SelectValue placeholder={eventsLoading ? "Memuat event..." : "Pilih event (atau biarkan kosong)"} />
              </SelectTrigger>
              <SelectContent className="rounded-md border border-border bg-card shadow-md">
                <SelectItem value="">Tidak ada event</SelectItem>
                {eventOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {eventError && (
              <p className="text-[11px] text-red-500">{eventError}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-medium text-foreground">
              Tanggal Tayang <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              required
              value={form.tanggal}
              onChange={(e) => handleChange("tanggal", e.target.value)}
              className="h-9 rounded-md border-border text-xs sm:text-sm placeholder:text-muted-foreground"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-medium text-foreground">
              Deskripsi <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 rounded-md px-2"
                onClick={() => applyFormatting("bold")}
              >
                <Bold className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 rounded-md px-2"
                onClick={() => applyFormatting("italic")}
              >
                <Italic className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 rounded-md px-2"
                onClick={() => applyFormatting("quote")}
              >
                <Quote className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 rounded-md px-2"
                onClick={() => applyFormatting("break")}
              >
                <CornerDownLeft className="h-4 w-4" />
              </Button>
            </div>
            <Textarea
              required
              rows={5}
              value={form.deskripsi}
              onChange={(e) => handleChange("deskripsi", e.target.value)}
              placeholder="Tuliskan isi berita atau pengumuman..."
              ref={textareaRef}
              className="rounded-md border-border text-xs sm:text-sm placeholder:text-muted-foreground"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-medium text-foreground">
              Tag Berita
            </label>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="Tekan Enter untuk menambahkan tag"
                className="h-9 rounded-md border-border text-xs sm:text-sm placeholder:text-muted-foreground"
                disabled={isBusy}
              />
              <Button
                type="button"
                variant="outline"
                className="h-9 rounded-md"
                disabled={!tagInput.trim() || isBusy}
                onClick={() => handleAddTag()}
              >
                Tambah Tag
              </Button>
            </div>
            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {form.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
                  >
                    {tag}
                    <button
                      type="button"
                      className="rounded-full p-0.5 text-muted-foreground hover:text-muted-foreground"
                      onClick={() => handleRemoveTag(tag)}
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
            <label className="text-xs sm:text-sm font-medium text-foreground">
              Foto Pendukung{" "}
              <span className="text-[10px] sm:text-xs text-muted-foreground">
                (Opsional)
              </span>
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="block w-full cursor-pointer text-xs text-muted-foreground file:mr-3 file:rounded-md file:border file:border-border file:bg-card file:px-3 file:py-1.5 file:text-xs file:font-medium file:hover:bg-muted sm:text-sm"
            />

            {previewSource && (
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
                <AlertDialogContent className="sm:max-w-md rounded-xl border border-border bg-card">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Preview Foto</AlertDialogTitle>
                    <AlertDialogDescription className="text-xs text-muted-foreground">
                      {pendingFile
                        ? "Ini adalah gambar yang baru kamu pilih."
                        : "Ini foto yang tersimpan saat ini."}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="mt-2 flex w-full justify-center">
                    <div className="relative max-h-[60vh] w-full overflow-hidden rounded-md border border-border">
                      <Image
                        src={previewSource}
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

            {!pendingFile && form.photoPath && (
              <p className="text-[11px] text-muted-foreground break-all">
                Foto tersimpan:
                <span className="ml-1 font-medium">{form.photoPath}</span>
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
              onClick={() => onOpenChange?.(false)}
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
