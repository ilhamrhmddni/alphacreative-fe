"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

export default function EventRegistrationDialog({
  open,
  onOpenChange,
  eventData,
  onSubmit,
  loadingCategories = false,
}) {
  const [form, setForm] = useState({
    namaTim: "",
    namaPerwakilan: "",
    eventCategoryId: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({
        namaTim: eventData?.defaultNamaTim || "",
        namaPerwakilan: "",
        eventCategoryId: eventData?.categories?.[0]?.id
          ? String(eventData.categories[0].id)
          : "",
      });
      setSubmitting(false);
    }
  }, [eventData, open]);

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!onSubmit || !eventData) return;
    try {
      setSubmitting(true);
      await onSubmit({
        namaTim: form.namaTim.trim(),
        namaPerwakilan: form.namaPerwakilan.trim(),
        eventCategoryId: form.eventCategoryId || null,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-lg rounded-xl border border-border bg-card p-0 shadow-lg">
        <DialogHeader className="border-b border-border px-5 pt-5 pb-3">
          <DialogTitle className="text-base font-semibold text-foreground sm:text-lg">
            Daftar Event
          </DialogTitle>
          <DialogDescription className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Lengkapi data singkat untuk mendaftarkan tim Anda pada event{" "}
            <span className="font-semibold text-foreground">
              {eventData?.namaEvent || "-"}
            </span>
            .
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-5 py-5 space-y-4">
          {loadingCategories ? (
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground sm:text-sm">
                Pilih Kategori
              </label>
              <div className="rounded-md border border-dashed border-border bg-muted px-3 py-2 text-[11px] text-muted-foreground">
                Memuat kategori event...
              </div>
            </div>
          ) : eventData?.categories?.length ? (
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground sm:text-sm">
                Pilih Kategori <span className="text-red-500">*</span>
              </label>
              <Select
                value={form.eventCategoryId}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, eventCategoryId: value }))
                }
              >
                <SelectTrigger className="h-9 rounded-md border-border text-xs sm:text-sm">
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent className="rounded-md border border-border bg-card shadow-md">
                  {eventData.categories.map((category) => (
                    <SelectItem key={category.id} value={String(category.id)}>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-foreground">
                          {category.name}
                        </span>
                        {category.description && (
                          <span className="text-[11px] text-muted-foreground">
                            {category.description}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground sm:text-sm">
                Kategori
              </label>
              <div className="rounded-md border border-dashed border-border bg-muted px-3 py-2 text-[11px] text-muted-foreground">
                Event ini belum memiliki kategori khusus. Pendaftaran akan dicatat sebagai umum.
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-medium text-foreground sm:text-sm">
              Nama Tim <span className="text-red-500">*</span>
            </label>
            <Input
              required
              value={form.namaTim}
              onChange={(e) => handleChange("namaTim", e.target.value)}
              placeholder="Tulis nama tim Anda"
              className="h-9 rounded-md border-border text-xs sm:text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-foreground sm:text-sm">
              Nama Perwakilan
            </label>
            <Input
              value={form.namaPerwakilan}
              onChange={(e) => handleChange("namaPerwakilan", e.target.value)}
              placeholder="(Opsional) nama narahubung"
              className="h-9 rounded-md border-border text-xs sm:text-sm"
            />
          </div>

          <div className="rounded-md border border-border bg-muted px-3 py-2 text-[11px] text-muted-foreground">
            Setelah pendaftaran dikirim, admin akan meninjau permintaan Anda.
            Status pendaftaran dapat dipantau melalui tab Peserta.
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange?.(false)}
              className="h-9 rounded-md"
              disabled={submitting}
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="h-9 rounded-md"
              disabled={
                  submitting ||
                  loadingCategories ||
                !form.namaTim.trim() ||
                (eventData?.categories?.length ? !form.eventCategoryId : false)
              }
            >
              {submitting ? "Mendaftar..." : "Kirim Pendaftaran"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
