"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

function toDateInputValue(dateLike) {
  if (!dateLike) return "";
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

export default function DetailPesertaFormDialog({
  open,
  onOpenChange,
  initialData,
  pesertaOptions,
  onSubmit,
  presetPesertaId,
  presetPesertaLabel,
}) {
  const [form, setForm] = useState(() => ({
    pesertaId: initialData?.pesertaId
      ? String(initialData.pesertaId)
      : presetPesertaId
      ? String(presetPesertaId)
      : "",
    namaDetail: initialData?.namaDetail ?? "",
    tanggalLahir: toDateInputValue(initialData?.tanggalLahir),
    nisnNta: initialData?.nisnNta ?? "",
    alamat: initialData?.alamat ?? "",
  }));
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setForm({
      pesertaId: initialData?.pesertaId
        ? String(initialData.pesertaId)
        : presetPesertaId
        ? String(presetPesertaId)
        : "",
      namaDetail: initialData?.namaDetail ?? "",
      tanggalLahir: toDateInputValue(initialData?.tanggalLahir),
      nisnNta: initialData?.nisnNta ?? "",
      alamat: initialData?.alamat ?? "",
    });
    setSubmitting(false);
  }, [initialData, presetPesertaId]);

  const isEdit = Boolean(initialData);
  const parsedOptions = useMemo(() => pesertaOptions ?? [], [pesertaOptions]);

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function getAgeFromBirthdate(dateString) {
    if (!dateString) return null;
    const birth = new Date(dateString);
    if (Number.isNaN(birth.getTime())) return null;

    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    const dayDiff = today.getDate() - birth.getDate();

    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age -= 1;
    }

    return age >= 0 ? age : null;
  }

  const calculatedAge = useMemo(
    () => getAgeFromBirthdate(form.tanggalLahir),
    [form.tanggalLahir]
  );

  async function handleSubmit(e) {
    e.preventDefault();
    if (!onSubmit) return;
    const payload = {
      namaDetail: form.namaDetail?.trim(),
      tanggalLahir: form.tanggalLahir
        ? new Date(form.tanggalLahir).toISOString()
        : null,
      umur: calculatedAge ?? null,
      nisnNta: form.nisnNta?.trim() || null,
      alamat: form.alamat?.trim() || null,
    };
    if (!payload.namaDetail) return;
    if (!isEdit) {
      const pesertaIdValue = presetPesertaId ?? form.pesertaId;
      payload.pesertaId = Number(pesertaIdValue);
    }

    try {
      setSubmitting(true);
      await onSubmit(payload);
    } finally {
      setSubmitting(false);
    }
  }

  const dialogTitle = isEdit ? "Edit Anggota" : "Tambah Anggota";
  const dialogDescription = isEdit
    ? "Perbarui informasi anggota tim tanpa mengubah peserta."
    : "Tambahkan data anggota tim/peserta lengkap.";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-lg rounded-xl border border-border bg-card p-0 shadow-lg sm:max-w-xl">
        <DialogHeader className="border-b border-border px-5 pt-5 pb-3">
          <DialogTitle className="text-base font-semibold text-foreground sm:text-lg">
            {dialogTitle}
          </DialogTitle>
          <DialogDescription className="mt-1 text-xs text-muted-foreground sm:text-sm">
            {dialogDescription}
          </DialogDescription>
          <p className="mt-2 text-[11px] text-muted-foreground">
            Kolom bertanda <span className="text-red-500">*</span> wajib diisi.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5">
          {!isEdit && !presetPesertaId && (
            <div className="space-y-2">
              <Label className="text-xs font-medium text-foreground sm:text-sm">
                Peserta / Tim <span className="text-red-500">*</span>
              </Label>
              <Select
                value={form.pesertaId}
                onValueChange={(value) => handleChange("pesertaId", value)}
              >
                <SelectTrigger className="h-9 rounded-md border-border text-xs sm:text-sm">
                  <SelectValue placeholder="Pilih peserta" />
                </SelectTrigger>
                <SelectContent className="rounded-md border border-border bg-card shadow-md">
                  {parsedOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!parsedOptions.length && (
                <p className="text-[11px] text-amber-600">
                  Belum ada peserta terdaftar. Tambahkan peserta terlebih dahulu.
                </p>
              )}
            </div>
          )}

        {!isEdit && presetPesertaId && (
          <div className="rounded-md border border-border bg-muted p-3 text-xs text-muted-foreground">
            Terdaftar untuk tim{" "}
            <span className="font-semibold text-foreground">
              {presetPesertaLabel || "Tim tidak diketahui"}
            </span>
          </div>
        )}

        {isEdit && (
          <div className="rounded-md border border-border bg-muted p-3 text-xs text-muted-foreground">
            Terdaftar pada tim{" "}
            <span className="font-semibold text-foreground">
                {initialData?.peserta?.namaTim || "Tim tidak diketahui"}
            </span>
          </div>
        )}

          <div className="space-y-2">
            <Label className="text-xs font-medium text-foreground sm:text-sm">
              Nama Anggota <span className="text-red-500">*</span>
            </Label>
            <Input
              required
              value={form.namaDetail}
              onChange={(e) => handleChange("namaDetail", e.target.value)}
              placeholder="Masukkan nama lengkap"
              className="h-9 rounded-md border-border text-xs placeholder:text-muted-foreground sm:text-sm"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-xs font-medium text-foreground sm:text-sm">
                Tanggal Lahir
              </Label>
              <Input
                type="date"
                value={form.tanggalLahir}
                onChange={(e) => handleChange("tanggalLahir", e.target.value)}
                className="h-9 rounded-md border-border text-xs placeholder:text-muted-foreground sm:text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium text-foreground sm:text-sm">
                Umur
              </Label>
              <Input
                value={
                  calculatedAge != null ? String(calculatedAge) : "-"
                }
                readOnly
                className="h-9 cursor-not-allowed rounded-md border-border bg-muted text-xs text-muted-foreground sm:text-sm"
              />
              <p className="text-[11px] text-muted-foreground">
                Umur dihitung otomatis dari tanggal lahir.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium text-foreground sm:text-sm">
              NISN / NTA
            </Label>
            <Input
              value={form.nisnNta}
              onChange={(e) => handleChange("nisnNta", e.target.value)}
              placeholder="Opsional"
              className="h-9 rounded-md border-border text-xs placeholder:text-muted-foreground sm:text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium text-foreground sm:text-sm">
              Alamat
            </Label>
            <Input
              value={form.alamat}
              onChange={(e) => handleChange("alamat", e.target.value)}
              placeholder="Alamat lengkap (opsional)"
              className="h-9 rounded-md border-border text-xs placeholder:text-muted-foreground sm:text-sm"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-md text-xs sm:text-sm"
              onClick={() => onOpenChange?.(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={
                submitting ||
                !form.namaDetail ||
                (!isEdit && !form.pesertaId)
              }
              className="rounded-md text-xs sm:text-sm"
            >
              {submitting ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Tambah Detail"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
