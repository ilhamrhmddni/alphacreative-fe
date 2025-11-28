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

export default function PesertaFormDialog({
  open,
  onOpenChange,
  initialData,
  onSubmit,
  events,
  users,
}) {
  const [form, setForm] = useState(() => ({
    eventId: initialData?.eventId ? String(initialData.eventId) : "",
    userId: initialData?.userId ? String(initialData.userId) : "",
    namaTim: initialData?.namaTim ?? "",
    namaPerwakilan: initialData?.namaPerwakilan ?? "",
    linkDrive: initialData?.partisipasi?.linkDrive ?? "",
  }));
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setForm({
      eventId: initialData?.eventId ? String(initialData.eventId) : "",
      userId: initialData?.userId ? String(initialData.userId) : "",
      namaTim: initialData?.namaTim ?? "",
      namaPerwakilan: initialData?.namaPerwakilan ?? "",
      linkDrive: initialData?.partisipasi?.linkDrive ?? "",
    });
    setSubmitting(false);
  }, [initialData]);

  const isEdit = Boolean(initialData);
  const eventOptions = useMemo(() => events ?? [], [events]);
  const userOptions = useMemo(() => users ?? [], [users]);

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!onSubmit) return;

    const payload = {
      namaTim: form.namaTim?.trim(),
      namaPerwakilan: form.namaPerwakilan?.trim() || null,
    };

    if (!payload.namaTim) return;

    if (!isEdit) {
      payload.eventId = Number(form.eventId);
      payload.userId = Number(form.userId);
    }
    if (isEdit) {
      payload.linkDrive = form.linkDrive?.trim() || "";
    }

    try {
      setSubmitting(true);
      await onSubmit(payload);
    } finally {
      setSubmitting(false);
    }
  }

  const dialogTitle = isEdit ? "Edit Peserta" : "Tambah Peserta";
  const dialogDescription = isEdit
    ? "Perbarui nama tim atau perwakilan tanpa mengubah event dan user."
    : "Daftarkan user ke sebuah event sebagai peserta/tim baru.";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-lg rounded-xl border border-slate-200 bg-white p-0 shadow-lg sm:max-w-xl">
        <DialogHeader className="border-b border-slate-100 px-5 pt-5 pb-3">
          <DialogTitle className="text-base font-semibold text-slate-900 sm:text-lg">
            {dialogTitle}
          </DialogTitle>
          <DialogDescription className="mt-1 text-xs text-slate-500 sm:text-sm">
            {dialogDescription}
          </DialogDescription>
          <p className="mt-2 text-[11px] text-slate-400">
            Kolom bertanda <span className="text-red-500">*</span> wajib diisi.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5">
          {!isEdit && (
            <>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-slate-900 sm:text-sm">
                  Pilih Event <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={form.eventId}
                  onValueChange={(value) => handleChange("eventId", value)}
                  required
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
                    Belum ada event aktif. Buat event sebelum menambah peserta.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium text-slate-900 sm:text-sm">
                  Pilih User <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={form.userId}
                  onValueChange={(value) => handleChange("userId", value)}
                  required
                >
                  <SelectTrigger className="h-9 rounded-md border-slate-200 text-xs sm:text-sm">
                    <SelectValue placeholder="Pilih user peserta" />
                  </SelectTrigger>
                  <SelectContent className="rounded-md border border-slate-200 bg-white shadow-md">
                    {userOptions.map((user) => (
                      <SelectItem key={user.id} value={String(user.id)}>
                        {user.username || user.email} • {user.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!userOptions.length && (
                  <p className="text-[11px] text-amber-600">
                    Belum ada user dengan role peserta. Buat akun terlebih dahulu.
                  </p>
                )}
              </div>
            </>
          )}

          {isEdit && (
            <div className="rounded-md border border-slate-100 bg-slate-50 p-3 text-xs text-slate-500">
              Event:{" "}
              <span className="font-semibold text-slate-900">
                {initialData?.event?.namaEvent || "Event tidak diketahui"}
              </span>
              <br />
              User:{" "}
              <span className="font-semibold text-slate-900">
                {initialData?.user?.email || "User tidak diketahui"}
              </span>
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-xs font-medium text-slate-900 sm:text-sm">
              Nama Tim <span className="text-red-500">*</span>
            </Label>
            <Input
              required
              value={form.namaTim}
              onChange={(e) => handleChange("namaTim", e.target.value)}
              placeholder="Masukkan nama tim"
              className="h-9 rounded-md border-slate-200 text-xs placeholder:text-slate-400 sm:text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium text-slate-900 sm:text-sm">
              Nama Perwakilan
            </Label>
            <Input
              value={form.namaPerwakilan}
              onChange={(e) => handleChange("namaPerwakilan", e.target.value)}
              placeholder="Nama penanggung jawab tim"
              className="h-9 rounded-md border-slate-200 text-xs placeholder:text-slate-400 sm:text-sm"
            />
          </div>

          {isEdit && (
            <div className="space-y-2">
              <Label className="text-xs font-medium text-slate-900 sm:text-sm">
                Link Drive Foto
              </Label>
              <Input
                type="url"
                value={form.linkDrive}
                onChange={(e) => handleChange("linkDrive", e.target.value)}
                placeholder="https://drive.google.com/..."
                className="h-9 rounded-md border-slate-200 text-xs placeholder:text-slate-400 sm:text-sm"
              />
              <p className="text-[11px] text-slate-500">
                Kosongkan untuk menghapus tautan. Peserta juga dapat memperbarui dari dashboard mereka.
              </p>
            </div>
          )}

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
                (!isEdit && (!form.eventId || !form.userId)) ||
                !form.namaTim
              }
              className="rounded-md text-xs sm:text-sm"
            >
              {submitting ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Tambah Peserta"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
