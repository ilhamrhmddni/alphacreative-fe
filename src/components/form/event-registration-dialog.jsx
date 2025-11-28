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

export default function EventRegistrationDialog({
  open,
  onOpenChange,
  eventData,
  onSubmit,
}) {
  const [form, setForm] = useState({
    namaTim: "",
    namaPerwakilan: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({
        namaTim: eventData?.defaultNamaTim || "",
        namaPerwakilan: "",
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
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-lg rounded-xl border border-slate-200 bg-white p-0 shadow-lg">
        <DialogHeader className="border-b border-slate-100 px-5 pt-5 pb-3">
          <DialogTitle className="text-base font-semibold text-slate-900 sm:text-lg">
            Daftar Event
          </DialogTitle>
          <DialogDescription className="mt-1 text-xs text-slate-500 sm:text-sm">
            Lengkapi data singkat untuk mendaftarkan tim Anda pada event{" "}
            <span className="font-semibold text-slate-900">
              {eventData?.namaEvent || "-"}
            </span>
            .
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-5 py-5 space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-900 sm:text-sm">
              Nama Tim <span className="text-red-500">*</span>
            </label>
            <Input
              required
              value={form.namaTim}
              onChange={(e) => handleChange("namaTim", e.target.value)}
              placeholder="Tulis nama tim Anda"
              className="h-9 rounded-md border-slate-200 text-xs sm:text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-900 sm:text-sm">
              Nama Perwakilan
            </label>
            <Input
              value={form.namaPerwakilan}
              onChange={(e) => handleChange("namaPerwakilan", e.target.value)}
              placeholder="(Opsional) nama narahubung"
              className="h-9 rounded-md border-slate-200 text-xs sm:text-sm"
            />
          </div>

          <div className="rounded-md border border-slate-100 bg-slate-50 px-3 py-2 text-[11px] text-slate-500">
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
              disabled={submitting || !form.namaTim.trim()}
            >
              {submitting ? "Mendaftar..." : "Kirim Pendaftaran"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
