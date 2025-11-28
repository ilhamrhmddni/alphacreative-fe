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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ScoreFormDialog({
  open,
  onOpenChange,
  initialData,
  events,
  peserta,
  juriOptions,
  currentUser,
  onSubmit,
}) {
  const isEdit = Boolean(initialData);
  const detailScoreValue = useMemo(
    () => calculateDetailScore(initialData?.details),
    [initialData]
  );
  const hasDetailScore = Boolean(isEdit && detailScoreValue != null);

  const isAdmin = currentUser?.role === "admin";
  const isOperator = currentUser?.role === "operator";
  const canChooseJuri = isAdmin || isOperator;

  const initialJuriId = (() => {
    if (initialData?.juriId) return String(initialData.juriId);
    if (canChooseJuri) return "";
    return currentUser?.id ? String(currentUser.id) : "";
  })();

  const [formError, setFormError] = useState("");
  const [form, setForm] = useState(() => ({
    eventId: initialData?.eventId ? String(initialData.eventId) : "",
    pesertaId: initialData?.pesertaId ? String(initialData.pesertaId) : "",
    nilai:
      initialData?.nilai != null && initialData?.nilai !== ""
        ? String(initialData.nilai)
        : "",
    juriId: initialJuriId,
    catatan: initialData?.catatan ?? "",
  }));
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => {
    const nextJuriId = (() => {
      if (initialData?.juriId) return String(initialData.juriId);
      if (canChooseJuri) return "";
      return currentUser?.id ? String(currentUser.id) : "";
    })();
    setForm({
      eventId: initialData?.eventId ? String(initialData.eventId) : "",
      pesertaId: initialData?.pesertaId ? String(initialData.pesertaId) : "",
      nilai:
        initialData?.nilai != null && initialData?.nilai !== ""
          ? String(initialData.nilai)
          : "",
      juriId: nextJuriId,
      catatan: initialData?.catatan ?? "",
    });
    setSubmitting(false);
    setFormError("");
  }, [initialData, canChooseJuri, currentUser?.id]);

  const eventOptions = useMemo(() => events ?? [], [events]);
  const pesertaOptions = useMemo(() => {
    const list = peserta ?? [];
    if (!form.eventId) {
      return list.map((item) => ({
        value: String(item.id),
        label: `${item.namaTim} • ${item.event?.namaEvent || "Event ?"}`,
      }));
    }
    return list
      .filter((item) => String(item.eventId) === form.eventId)
      .map((item) => ({
        value: String(item.id),
        label: `${item.namaTim}`,
      }));
  }, [peserta, form.eventId]);

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  const juriSelectOptions = useMemo(() => juriOptions ?? [], [juriOptions]);

  const selectedJuriOption = useMemo(() => {
    if (initialData?.juri) return initialData.juri;
    return juriSelectOptions.find((j) => String(j.id) === form.juriId);
  }, [initialData, juriSelectOptions, form.juriId]);

  const juriDisplay = (() => {
    if (selectedJuriOption) {
      return selectedJuriOption.username || selectedJuriOption.email || "";
    }
    if (initialData?.juri || currentUser) {
      return (
        initialData?.juri?.username ||
        initialData?.juri?.email ||
        currentUser?.username ||
        currentUser?.email
      );
    }
    return "";
  })();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!onSubmit) return;

    let nilaiNumber =
      form.nilai === "" || form.nilai == null ? null : Number(form.nilai);

    if (
      !hasDetailScore &&
      nilaiNumber != null &&
      (Number.isNaN(nilaiNumber) ||
        nilaiNumber < 0 ||
        nilaiNumber > 100)
    ) {
      return;
    }

    const payload = {
      eventId: Number(form.eventId),
      pesertaId: Number(form.pesertaId),
      nilai: hasDetailScore
        ? Number(detailScoreValue)
        : nilaiNumber != null && !Number.isNaN(nilaiNumber)
        ? Number(Math.min(Math.max(nilaiNumber, 0), 100))
        : null,
      catatan: form.catatan?.trim() || null,
    };

    if (!payload.eventId || !payload.pesertaId) {
      return;
    }
    if (canChooseJuri) {
      if (!form.juriId) return;
      payload.juriId = Number(form.juriId);
    } else {
      payload.juriId = Number(
        initialData?.juriId || currentUser?.id || 0
      );
      if (!payload.juriId) return;
    }

    try {
      setSubmitting(true);
      await onSubmit(payload);
      setFormError("");
    } catch (err) {
      setFormError(err.message || "Gagal menyimpan score");
      console.error(err);
      return;
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-lg rounded-xl border border-slate-200 bg-white p-0 shadow-lg sm:max-w-xl">
        <DialogHeader className="border-b border-slate-100 px-5 pt-5 pb-3">
          <DialogTitle className="text-base font-semibold text-slate-900 sm:text-lg">
            {isEdit ? "Edit Score" : "Tambah Score"}
          </DialogTitle>
          <DialogDescription className="mt-1 text-xs text-slate-500 sm:text-sm">
            {isEdit
              ? "Perbarui nilai atau catatan juri."
              : "Masukkan penilaian untuk tim pada event tertentu."}
          </DialogDescription>
          {juriDisplay && (
            <p className="mt-2 text-[11px] text-slate-500">
              Juri:{" "}
              <span className="font-medium text-slate-900">
                {juriDisplay}
              </span>
            </p>
          )}
          <p className="mt-1 text-[11px] text-slate-400">
            Kolom bertanda <span className="text-red-500">*</span> wajib diisi.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5">
          {!isEdit && (
            <>
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
                    {pesertaOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
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
            </>
          )}

          {canChooseJuri && (
            <div className="space-y-2">
              <Label className="text-xs font-medium text-slate-900 sm:text-sm">
                Pilih Juri <span className="text-red-500">*</span>
              </Label>
              <Select
                value={form.juriId}
                onValueChange={(value) => handleChange("juriId", value)}
              >
                <SelectTrigger className="h-9 rounded-md border-slate-200 text-xs sm:text-sm">
                  <SelectValue placeholder="Pilih juri penilai" />
                </SelectTrigger>
                <SelectContent className="rounded-md border border-slate-200 bg-white shadow-md">
                  {juriSelectOptions.map((juri) => (
                    <SelectItem key={juri.id} value={String(juri.id)}>
                      {juri.username || juri.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!juriSelectOptions.length && (
                <p className="text-[11px] text-amber-600">
                  Tidak ada juri terdaftar.
                </p>
              )}
            </div>
          )}

          {isEdit && (
            <div className="rounded-md border border-slate-100 bg-slate-50 p-3 text-xs text-slate-500">
              Event:{" "}
              <span className="font-semibold text-slate-900">
                {initialData?.event?.namaEvent || "Event tidak diketahui"}
              </span>
              <br />
              Tim:{" "}
              <span className="font-semibold text-slate-900">
                {initialData?.peserta?.namaTim || "Tim tidak diketahui"}
              </span>
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-xs font-medium text-slate-900 sm:text-sm">
              Nilai{" "}
              <span className="text-[11px] lowercase text-slate-400">
                (isi manual atau gunakan detail)
              </span>
            </Label>
            <Input
              type="number"
              step="1"
              min="0"
              max="100"
              value={
                hasDetailScore
                  ? detailScoreValue?.toFixed(1) ?? ""
                  : form.nilai
              }
              onChange={(e) => handleChange("nilai", e.target.value)}
              placeholder="Masukkan nilai akhir"
              required={false}
              disabled={hasDetailScore}
              className="h-9 rounded-md border-slate-200 text-xs placeholder:text-slate-400 sm:text-sm"
            />
            {hasDetailScore && (
              <p className="text-[11px] text-slate-500">
                Nilai otomatis dari {initialData?.details?.length || 0} detail:{" "}
                <span className="font-semibold">
                  {Number(detailScoreValue).toFixed(1)}
                </span>
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium text-slate-900 sm:text-sm">
              Catatan
            </Label>
            <Textarea
              rows={4}
              value={form.catatan}
              onChange={(e) => handleChange("catatan", e.target.value)}
              placeholder="Masukkan catatan juri (opsional)"
              className="rounded-md border-slate-200 text-xs placeholder:text-slate-400 sm:text-sm"
            />
          </div>

          <div className="flex flex-col gap-2 pt-2">
            {formError && <p className="text-[11px] text-red-500">{formError}</p>}
            <div className="flex justify-end gap-2">
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
                (!isEdit && (!form.eventId || !form.pesertaId)) ||
                (canChooseJuri && !isEdit && !form.juriId)
              }
              className="rounded-md text-xs sm:text-sm"
            >
              {submitting ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Tambah Score"}
            </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
function calculateDetailScore(details) {
  if (!details || details.length === 0) return null;
  const valid = details.filter(
    (item) => item && !Number.isNaN(Number(item.nilai))
  );
  if (!valid.length) return null;

  const hasWeight = valid.some(
    (item) => item.bobot !== undefined && item.bobot !== null
  );
  if (hasWeight) {
    let weightedSum = 0;
    valid.forEach((item) => {
      const nilai = clamp(Number(item.nilai) || 0, 0, 100);
      const weightRaw = Number(item.bobot);
      if (!Number.isNaN(weightRaw)) {
        const weight = clamp(weightRaw, 0, 1);
        weightedSum += nilai * weight;
      }
    });
    return clamp(weightedSum, 0, 100);
  }

  const total = valid.reduce(
    (sum, item) => sum + clamp(Number(item.nilai) || 0, 0, 100),
    0
  );
  return clamp(total / valid.length, 0, 100);
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
