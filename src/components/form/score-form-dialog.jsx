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
import { calculateDetailScore, clampScoreValue } from "@/lib/utils";

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
  const hasDetailScore = detailScoreValue != null;

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
    catatan: initialData?.useManualNilai ? initialData?.catatan ?? "" : "",
    useManualNilai: Boolean(initialData?.useManualNilai),
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
      catatan: initialData?.useManualNilai ? initialData?.catatan ?? "" : "",
      useManualNilai: Boolean(initialData?.useManualNilai),
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

  function handleToggleManual(checked) {
    setForm((prev) => ({ ...prev, useManualNilai: checked }));
    if (!checked) {
      setFormError("");
    }
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

  const manualEnabled = Boolean(form.useManualNilai);
  const detailCount = Array.isArray(initialData?.details)
    ? initialData.details.length
    : 0;
  const automaticDisplay =
    !manualEnabled && hasDetailScore
      ? Number(detailScoreValue).toFixed(1)
      : "";

  async function handleSubmit(e) {
    e.preventDefault();
    if (!onSubmit) return;

    setFormError("");

    const manualEnabled = Boolean(form.useManualNilai);
    const manualRaw =
      form.nilai === "" || form.nilai == null
        ? null
        : clampScoreValue(form.nilai);

    if (manualEnabled) {
      if (manualRaw === null) {
        setFormError("Nilai manual wajib diisi dengan angka 0-100.");
        return;
      }
    }

    const payload = {
      eventId: Number(form.eventId),
      pesertaId: Number(form.pesertaId),
      nilai: manualEnabled && manualRaw !== null ? Math.round(manualRaw) : null,
      catatan:
        manualEnabled && form.catatan?.trim()
          ? form.catatan.trim()
          : null,
      useManualNilai: manualEnabled,
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
      <DialogContent className="w-[95vw] max-w-lg rounded-xl border border-border bg-card p-0 shadow-lg sm:max-w-xl">
        <DialogHeader className="border-b border-border px-5 pt-5 pb-3">
          <DialogTitle className="text-base font-semibold text-foreground sm:text-lg">
            {isEdit ? "Edit Score" : "Tambah Score"}
          </DialogTitle>
          <DialogDescription className="mt-1 text-xs text-muted-foreground sm:text-sm">
            {isEdit
              ? "Perbarui nilai atau catatan juri."
              : "Masukkan penilaian untuk tim pada event tertentu."}
          </DialogDescription>
          {juriDisplay && (
            <p className="mt-2 text-[11px] text-muted-foreground">
              Juri:{" "}
              <span className="font-medium text-foreground">
                {juriDisplay}
              </span>
            </p>
          )}
          <p className="mt-1 text-[11px] text-muted-foreground">
            Kolom bertanda <span className="text-red-500">*</span> wajib diisi.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5">
          {!isEdit && (
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
              <Label className="text-xs font-medium text-foreground sm:text-sm">
                Pilih Juri <span className="text-red-500">*</span>
              </Label>
              <Select
                value={form.juriId}
                onValueChange={(value) => handleChange("juriId", value)}
              >
                <SelectTrigger className="h-9 rounded-md border-border text-xs sm:text-sm">
                  <SelectValue placeholder="Pilih juri penilai" />
                </SelectTrigger>
                <SelectContent className="rounded-md border border-border bg-card shadow-md">
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
            <div className="rounded-md border border-border bg-muted p-3 text-xs text-muted-foreground">
              Event:{" "}
              <span className="font-semibold text-foreground">
                {initialData?.event?.namaEvent || "Event tidak diketahui"}
              </span>
              <br />
              Tim:{" "}
              <span className="font-semibold text-foreground">
                {initialData?.peserta?.namaTim || "Tim tidak diketahui"}
              </span>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <Label
                htmlFor="score-nilai"
                className="text-xs font-medium text-foreground sm:text-sm"
              >
                Nilai akhir
              </Label>
              <label
                htmlFor="score-use-manual"
                className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground"
              >
                <input
                  id="score-use-manual"
                  type="checkbox"
                  checked={manualEnabled}
                  onChange={(e) => handleToggleManual(e.target.checked)}
                  className="h-4 w-4 rounded border-border text-foreground focus:ring-slate-500"
                />
                Gunakan nilai manual
              </label>
            </div>
            <Input
              id="score-nilai"
              type="number"
              step="1"
              min="0"
              max="100"
              value={manualEnabled ? form.nilai : automaticDisplay}
              onChange={(e) => handleChange("nilai", e.target.value)}
              placeholder={
                manualEnabled
                  ? "Masukkan nilai manual"
                  : "Nilai otomatis dari detail"
              }
              required={false}
              disabled={!manualEnabled}
              className="h-9 rounded-md border-border text-xs placeholder:text-muted-foreground sm:text-sm"
              autoComplete="off"
            />
            <p className="text-[11px] text-muted-foreground">
              {manualEnabled
                ? "Masukkan angka 0-100. Sistem akan membulatkan ke bilangan bulat terdekat."
                : hasDetailScore
                ? `Nilai otomatis dari ${detailCount} detail akan digunakan untuk perhitungan juara.`
                : "Nilai akhir akan dihitung otomatis setelah detail score terisi."}
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium text-foreground sm:text-sm">
              Catatan
            </Label>
            {manualEnabled ? (
              <Textarea
                rows={4}
                value={form.catatan}
                onChange={(e) => handleChange("catatan", e.target.value)}
                placeholder="Masukkan catatan juri (opsional)"
                className="rounded-md border-border text-xs placeholder:text-muted-foreground sm:text-sm"
              />
            ) : (
              <div className="rounded-md border border-dashed border-border bg-muted px-3 py-2 text-xs text-muted-foreground">
                Catatan akhir akan diambil dari detail score per kriteria.
              </div>
            )}
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
                (canChooseJuri && !isEdit && !form.juriId) ||
                (manualEnabled && (form.nilai === "" || form.nilai == null))
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
