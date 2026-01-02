"use client";

import { useMemo } from "react";
import { BaseFormDialog } from "./base-form-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const createInitialForm = (initialData) => ({
  eventId: initialData?.eventId ? String(initialData.eventId) : "",
  pesertaId: initialData?.pesertaId ? String(initialData.pesertaId) : "",
  juara: initialData?.juara ?? "",
  kategori: initialData?.kategori ?? "",
  berkasLink: initialData?.berkasLink ?? "",
});

export default function JuaraFormDialog({
  open,
  onOpenChange,
  initialData,
  events,
  peserta,
  onSubmit,
  submitting = false,
}) {
  const isEdit = Boolean(initialData);
  const eventOptions = useMemo(() => events ?? [], [events]);

  const getPesertaOptions = (eventId) => {
    if (!peserta?.length) return [];
    if (!eventId) {
      return peserta.map((item) => ({
        value: String(item.id),
        label: `${item.namaTim} • ${item.event?.namaEvent || "Event ?"}`,
      }));
    }
    return peserta
      .filter((item) => String(item.eventId) === eventId)
      .map((item) => ({
        value: String(item.id),
        label: `${item.namaTim} • ${item.event?.namaEvent || "Event ?"}`,
      }));
  };

  const handleSubmit = async (form) => {
    if (!onSubmit) return;

    const payload = {
      eventId: Number(form.eventId),
      pesertaId: Number(form.pesertaId),
      juara: form.juara?.trim(),
      kategori: form.kategori?.trim() || null,
      berkasLink: form.berkasLink?.trim() || null,
    };

    if (!payload.eventId || !payload.pesertaId || !payload.juara) return;
    await onSubmit(payload);
  };

  return (
    <BaseFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit Data Juara" : "Tambah Data Juara"}
      description={
        isEdit
          ? "Perbarui posisi juara atau kategori tim."
          : "Catat juara baru untuk event yang telah selesai."
      }
      initialData={initialData}
      createInitialForm={createInitialForm}
      onSubmit={handleSubmit}
      submitting={submitting}
      submitLabel={isEdit ? "Simpan Perubahan" : "Tambah Juara"}
    >
      {({ form, handleChange }) => {
        const pesertaOptions = getPesertaOptions(form.eventId);

        return (
          <>
            <div className="space-y-2">
              <Label className="text-xs font-medium text-foreground sm:text-sm">
                Event <span className="text-red-500">*</span>
              </Label>
              <Select
                value={form.eventId}
                onValueChange={(value) => {
                  handleChange("eventId", value);
                  handleChange("pesertaId", "");
                }}
              >
                <SelectTrigger className="h-9 rounded-md border-border text-xs sm:text-sm">
                  <SelectValue placeholder="Pilih event" />
                </SelectTrigger>
                <SelectContent className="rounded-md border border-border bg-card shadow-md">
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
              <Label className="text-xs font-medium text-foreground sm:text-sm">
                Tim / Peserta <span className="text-red-500">*</span>
              </Label>
              <Select
                value={form.pesertaId}
                onValueChange={(value) => handleChange("pesertaId", value)}
                disabled={!form.eventId}
              >
                <SelectTrigger className="h-9 rounded-md border-border text-xs sm:text-sm">
                  <SelectValue
                    placeholder={
                      form.eventId ? "Pilih tim" : "Pilih event terlebih dahulu"
                    }
                  />
                </SelectTrigger>
                <SelectContent className="rounded-md border border-border bg-card shadow-md">
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
              <Label className="text-xs font-medium text-foreground sm:text-sm">
                Posisi Juara <span className="text-red-500">*</span>
              </Label>
              <Input
                required
                value={form.juara}
                onChange={(e) => handleChange("juara", e.target.value)}
                placeholder="Juara 1, Juara Harapan, dsb"
                className="h-9 rounded-md border-border text-xs placeholder:text-muted-foreground sm:text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium text-foreground sm:text-sm">
                Kategori (opsional)
              </Label>
              <Input
                value={form.kategori}
                onChange={(e) => handleChange("kategori", e.target.value)}
                placeholder="Misal: Umum, Pemula, Best Design..."
                className="h-9 rounded-md border-border text-xs placeholder:text-muted-foreground sm:text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium text-foreground sm:text-sm">
                Link Berkas Penilaian (Google Drive)
              </Label>
              <Input
                value={form.berkasLink}
                onChange={(e) => handleChange("berkasLink", e.target.value)}
                placeholder="https://drive.google.com/..."
                className="h-9 rounded-md border-border text-xs placeholder:text-muted-foreground sm:text-sm"
              />
            </div>
          </>
        );
      }}
    </BaseFormDialog>
  );
}
