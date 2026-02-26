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
  categoryId: initialData?.peserta?.eventCategoryId ? String(initialData.peserta.eventCategoryId) : "",
  pesertaId: initialData?.pesertaId ? String(initialData.pesertaId) : "",
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
  const hasAnyCategories = useMemo(
    () => (peserta ?? []).some((p) => p.eventCategoryId),
    [peserta]
  );

  const getCategoryOptions = (eventId) => {
    if (!peserta?.length || !eventId) return [];
    const eventPeserta = peserta.filter((item) => String(item.eventId) === eventId);
    const seen = new Set();
    return eventPeserta
      .filter((item) => item.eventCategory)
      .filter((item) => {
        if (seen.has(item.eventCategoryId)) return false;
        seen.add(item.eventCategoryId);
        return true;
      })
      .map((item) => ({
        value: String(item.eventCategoryId),
        label: item.eventCategory?.name || "Tanpa nama",
      }));
  };

  const getPesertaOptions = (eventId, categoryId) => {
    if (!peserta?.length) return [];
    let filtered = eventId
      ? peserta.filter((item) => String(item.eventId) === eventId)
      : peserta;
    if (categoryId) {
      filtered = filtered.filter((item) => String(item.eventCategoryId) === categoryId);
    }
    return filtered.map((item) => ({
      value: String(item.id),
      label: item.namaTim,
    }));
  };

  const handleSubmit = async (form) => {
    if (!onSubmit) return;

    const payload = {
      eventId: Number(form.eventId),
      pesertaId: Number(form.pesertaId),
      kategori: form.kategori?.trim() || null,
      berkasLink: form.berkasLink?.trim() || null,
    };

    if (!payload.eventId || !payload.pesertaId) return;
    await onSubmit(payload);
  };

  return (
    <BaseFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit Data Juara" : "Tambah Data Juara"}
      description={
        isEdit
          ? "Perbarui data hasil lomba tim."
          : "Catat hasil lomba tim untuk event yang telah selesai."
      }
      initialData={initialData}
      createInitialForm={createInitialForm}
      onSubmit={handleSubmit}
      submitting={submitting}
      submitLabel={isEdit ? "Simpan Perubahan" : "Tambah Juara"}
    >
      {({ form, handleChange }) => {
        const categoryOptions = getCategoryOptions(form.eventId);
        const pesertaOptions = getPesertaOptions(form.eventId, form.categoryId);

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
                  handleChange("categoryId", "");
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

            {hasAnyCategories && (
              <div className="space-y-2">
                <Label className="text-xs font-medium text-foreground sm:text-sm">
                  Kategori Event
                </Label>
                <Select
                  value={form.categoryId}
                  disabled={!form.eventId}
                  onValueChange={(value) => {
                    handleChange("categoryId", value);
                    handleChange("pesertaId", "");
                  }}
                >
                  <SelectTrigger className="h-9 rounded-md border-border text-xs sm:text-sm">
                    <SelectValue
                      placeholder={
                        form.eventId
                          ? "Pilih kategori event"
                          : "Pilih event terlebih dahulu"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="rounded-md border border-border bg-card shadow-md">
                    {categoryOptions.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

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
                  Tidak ada peserta untuk kategori ini.
                </p>
              )}
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
