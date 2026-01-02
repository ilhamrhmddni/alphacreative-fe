"use client";

import { BaseFormDialog } from "./base-form-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const createInitialForm = (initialData) => ({
  name: initialData?.name || "",
  description: initialData?.description || "",
  quota:
    initialData?.quota !== null && initialData?.quota !== undefined
      ? String(initialData.quota)
      : "",
});

export default function EventCategoryFormDialog({
  open,
  onOpenChange,
  eventContext,
  initialData,
  onSubmit,
  submitting = false,
}) {
  const isEdit = Boolean(initialData);

  const handleSubmit = async (form) => {
    if (!onSubmit || !eventContext) return;

    const payload = {
      eventId: eventContext.id,
      name: form.name.trim(),
      description: form.description.trim() || null,
      quota:
        form.quota === "" || form.quota === null ? null : Number(form.quota),
    };

    await onSubmit(payload);
  };

  return (
    <BaseFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit Kategori" : "Tambah Kategori"}
      description={
        eventContext
          ? `Event: ${eventContext.namaEvent || "-"}`
          : "Pilih event untuk melanjutkan."
      }
      initialData={initialData}
      createInitialForm={createInitialForm}
      onSubmit={handleSubmit}
      submitting={submitting}
      submitLabel={isEdit ? "Simpan" : "Tambah"}
    >
      {({ form, handleChange }) => (
        <>
          <div className="space-y-2">
            <label className="text-xs font-medium text-foreground sm:text-sm">
              Nama Kategori <span className="text-red-500">*</span>
            </label>
            <Input
              required
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Contoh: SD, SMP, Universitas"
              className="h-9 rounded-md border-border text-xs sm:text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-foreground sm:text-sm">
              Deskripsi <span className="text-[10px] text-muted-foreground">(Opsional)</span>
            </label>
            <Textarea
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={3}
              placeholder="Catatan singkat kategori..."
              className="resize-none rounded-md border-border text-xs sm:text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-foreground sm:text-sm">
              Kuota Per Kategori{" "}
              <span className="text-[10px] text-muted-foreground">(Opsional)</span>
            </label>
            <Input
              type="number"
              min={0}
              value={form.quota}
              onChange={(e) => handleChange("quota", e.target.value)}
              placeholder="Misal 10"
              className="h-9 rounded-md border-border text-xs sm:text-sm"
            />
          </div>
        </>
      )}
    </BaseFormDialog>
  );
}
