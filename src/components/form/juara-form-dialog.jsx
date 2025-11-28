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

export default function JuaraFormDialog({
  open,
  onOpenChange,
  initialData,
  events,
  peserta,
  onSubmit,
}) {
  const [form, setForm] = useState(() => ({
    eventId: initialData?.eventId ? String(initialData.eventId) : "",
    pesertaId: initialData?.pesertaId ? String(initialData.pesertaId) : "",
    juara: initialData?.juara ?? "",
    kategori: initialData?.kategori ?? "",
    berkasLink: initialData?.berkasLink ?? "",
  }));
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setForm({
      eventId: initialData?.eventId ? String(initialData.eventId) : "",
      pesertaId: initialData?.pesertaId ? String(initialData.pesertaId) : "",
      juara: initialData?.juara ?? "",
      kategori: initialData?.kategori ?? "",
      berkasLink: initialData?.berkasLink ?? "",
    });
    setSubmitting(false);
  }, [initialData]);

  const eventOptions = useMemo(() => events ?? [], [events]);

  const pesertaOptions = useMemo(() => {
    if (!peserta?.length) return [];
    if (!form.eventId) {
      return peserta.map((item) => ({
        value: String(item.id),
        label: `${item.namaTim} • ${item.event?.namaEvent || "Event ?"}`,
      }));
    }

    return peserta
      .filter((item) => String(item.eventId) === form.eventId)
      .map((item) => ({
        value: String(item.id),
        label: `${item.namaTim} • ${item.event?.namaEvent || "Event ?"}`,
      }));
  }, [peserta, form.eventId]);

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!onSubmit) return;

    const payload = {
      eventId: Number(form.eventId),
      pesertaId: Number(form.pesertaId),
      juara: form.juara?.trim(),
      kategori: form.kategori?.trim() || null,
      berkasLink: form.berkasLink?.trim() || null,
    };

    if (!payload.eventId || !payload.pesertaId || !payload.juara) {
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit(payload);
    } finally {
      setSubmitting(false);
    }
  }

  const isEdit = Boolean(initialData);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-lg rounded-xl border border-slate-200 bg-white p-0 shadow-lg sm:max-w-xl">
        <DialogHeader className="border-b border-slate-100 px-5 pt-5 pb-3">
          <DialogTitle className="text-base font-semibold text-slate-900 sm:text-lg">
            {isEdit ? "Edit Data Juara" : "Tambah Data Juara"}
          </DialogTitle>
          <DialogDescription className="mt-1 text-xs text-slate-500 sm:text-sm">
            {isEdit
              ? "Perbarui posisi juara atau kategori tim."
              : "Catat juara baru untuk event yang telah selesai."}
          </DialogDescription>
          <p className="mt-2 text-[11px] text-slate-400">
            Kolom bertanda <span className="text-red-500">*</span> wajib diisi.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5">
          <div className="space-y-2">
            <Label className="text-xs font-medium text-slate-900 sm:text-sm">
              Event <span className="text-red-500">*</span>
            </Label>
            <Select
              value={form.eventId}
              onValueChange={(value) => {
                handleChange("eventId", value);
                handleChange("pesertaId", "");
              }}
            >
              <SelectTrigger className="h-9 rounded-md border-slate-200 text-xs sm:text-sm">
                <SelectValue placeholder="Pilih event" />
              </SelectTrigger>
              <SelectContent className="rounded-md border border-slate-200 bg-white shadow-md">
                {eventOptions.map((event) => (
                  <SelectItem key={event.id} value={String(event.id)}>
                    {event.namaEvent}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!eventOptions.length && (
              <p className="text-[11px] text-amber-600">
                Belum ada event. Buat event terlebih dahulu.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium text-slate-900 sm:text-sm">
              Tim / Peserta <span className="text-red-500">*</span>
            </Label>
            <Select
              value={form.pesertaId}
              onValueChange={(value) => handleChange("pesertaId", value)}
              disabled={!form.eventId}
            >
              <SelectTrigger className="h-9 rounded-md border-slate-200 text-xs sm:text-sm">
                <SelectValue
                  placeholder={
                    form.eventId ? "Pilih tim" : "Pilih event terlebih dahulu"
                  }
                />
              </SelectTrigger>
              <SelectContent className="rounded-md border border-slate-200 bg-white shadow-md">
                {pesertaOptions.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.eventId && !pesertaOptions.length && (
              <p className="text-[11px] text-amber-600">
                Tidak ada peserta untuk event ini.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium text-slate-900 sm:text-sm">
              Posisi Juara <span className="text-red-500">*</span>
            </Label>
            <Input
              required
              value={form.juara}
              onChange={(e) => handleChange("juara", e.target.value)}
              placeholder="Juara 1, Juara Harapan, dsb"
              className="h-9 rounded-md border-slate-200 text-xs placeholder:text-slate-400 sm:text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium text-slate-900 sm:text-sm">
              Kategori (opsional)
            </Label>
            <Input
              value={form.kategori}
              onChange={(e) => handleChange("kategori", e.target.value)}
              placeholder="Misal: Umum, Pemula, Best Design..."
              className="h-9 rounded-md border-slate-200 text-xs placeholder:text-slate-400 sm:text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium text-slate-900 sm:text-sm">
              Link Berkas Penilaian (Google Drive)
            </Label>
            <Input
              value={form.berkasLink}
              onChange={(e) => handleChange("berkasLink", e.target.value)}
              placeholder="https://drive.google.com/..."
              className="h-9 rounded-md border-slate-200 text-xs placeholder:text-slate-400 sm:text-sm"
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
                !form.eventId ||
                !form.pesertaId ||
                !form.juara.trim()
              }
              className="rounded-md text-xs sm:text-sm"
            >
              {submitting ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Tambah Juara"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
