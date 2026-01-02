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

export default function ScoreDetailFormDialog({
  open,
  onOpenChange,
  initialData,
  scores,
  juriOptions,
  presetScore = null,
  onSubmit,
}) {
  const [form, setForm] = useState(() => ({
    scoreId: initialData?.scoreId
      ? String(initialData.scoreId)
      : presetScore?.id
      ? String(presetScore.id)
      : "",
    kriteria: initialData?.kriteria ?? "",
    nilai: initialData?.nilai != null ? String(initialData.nilai) : "",
    bobot:
      initialData?.bobot !== undefined && initialData?.bobot !== null
        ? String(initialData.bobot)
        : "",
    catatan: initialData?.catatan ?? "",
  }));
  const [submitting, setSubmitting] = useState(false);
  const [selectedJuri, setSelectedJuri] = useState(
    initialData?.score?.juriId
      ? String(initialData.score.juriId)
      : presetScore?.juriId
      ? String(presetScore.juriId)
      : "all"
  );

  useEffect(() => {
    setForm({
      scoreId: initialData?.scoreId
        ? String(initialData.scoreId)
        : presetScore?.id
        ? String(presetScore.id)
        : "",
      kriteria: initialData?.kriteria ?? "",
      nilai: initialData?.nilai != null ? String(initialData.nilai) : "",
      bobot:
        initialData?.bobot !== undefined && initialData?.bobot !== null
          ? String(initialData.bobot)
          : "",
      catatan: initialData?.catatan ?? "",
    });
    setSubmitting(false);
    if (initialData?.score?.juriId) {
      setSelectedJuri(String(initialData.score.juriId));
    } else if (presetScore?.juriId) {
      setSelectedJuri(String(presetScore.juriId));
    } else {
      setSelectedJuri("all");
    }
  }, [initialData, presetScore]);

  const isEdit = Boolean(initialData);
  const scoreOptions = useMemo(() => scores ?? [], [scores]);
  const filteredScores = useMemo(() => {
    if (selectedJuri === "all") return scoreOptions;
    return scoreOptions.filter(
      (score) => String(score.juriId) === selectedJuri
    );
  }, [scoreOptions, selectedJuri]);
  const activeScore = useMemo(() => {
    if (form.scoreId) {
      return (
        scoreOptions.find((score) => String(score.id) === form.scoreId) ||
        initialData?.score ||
        presetScore ||
        null
      );
    }
    return initialData?.score || presetScore || null;
  }, [form.scoreId, scoreOptions, initialData, presetScore]);

  const juriSelectOptions = useMemo(() => juriOptions ?? [], [juriOptions]);

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!onSubmit) return;

    const nilaiNumber =
      form.nilai === "" || form.nilai == null ? null : Number(form.nilai);
    if (nilaiNumber == null || Number.isNaN(nilaiNumber)) {
      return;
    }

    let bobotNumber = null;
    if (form.bobot !== "" && form.bobot != null) {
      const parsed = Number(form.bobot);
      if (Number.isNaN(parsed)) {
        return;
      }
      bobotNumber = parsed;
    }

    const payload = {
      kriteria: form.kriteria?.trim(),
      nilai: nilaiNumber,
      bobot: bobotNumber,
      catatan: form.catatan?.trim() ? form.catatan.trim() : null,
    };

    if (!payload.kriteria) {
      return;
    }

    if (!isEdit) {
      const resolvedScoreId =
        form.scoreId || (presetScore?.id ? String(presetScore.id) : "");
      if (!resolvedScoreId) {
        return;
      }
      payload.scoreId = Number(resolvedScoreId);
    }

    try {
      setSubmitting(true);
      await onSubmit(payload);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-lg rounded-xl border border-border bg-card p-0 shadow-lg sm:max-w-xl">
        <DialogHeader className="border-b border-border px-5 pt-5 pb-3">
          <DialogTitle className="text-base font-semibold text-foreground sm:text-lg">
            {isEdit ? "Edit Detail Score" : "Tambah Detail Score"}
          </DialogTitle>
          <DialogDescription className="mt-1 text-xs text-muted-foreground sm:text-sm">
            {isEdit
              ? "Perbarui kriteria, nilai, atau bobot penilaian."
              : "Tambahkan kriteria penilaian baru untuk score yang ada."}
          </DialogDescription>
          <p className="mt-2 text-[11px] text-muted-foreground">
            Kolom bertanda <span className="text-red-500">*</span> wajib diisi.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5">
          {!isEdit && !presetScore && (
            <div className="space-y-2">
              <Label className="text-xs font-medium text-foreground sm:text-sm">
                Score <span className="text-red-500">*</span>
              </Label>
              {juriSelectOptions.length > 0 && (
                <Select
                  value={selectedJuri}
                  onValueChange={(value) => {
                    setSelectedJuri(value);
                    handleChange("scoreId", "");
                  }}
                >
                  <SelectTrigger className="h-9 rounded-md border-border text-xs sm:text-sm">
                    <SelectValue placeholder="Filter juri (opsional)" />
                  </SelectTrigger>
                  <SelectContent className="rounded-md border border-border bg-card shadow-md">
                    <SelectItem value="all">Semua juri</SelectItem>
                    {juriSelectOptions.map((juri) => (
                      <SelectItem key={juri.id} value={String(juri.id)}>
                        {juri.username || juri.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <Select
                value={form.scoreId}
                onValueChange={(value) => handleChange("scoreId", value)}
              >
                <SelectTrigger className="h-9 rounded-md border-border text-xs sm:text-sm">
                  <SelectValue placeholder="Pilih score" />
                </SelectTrigger>
                <SelectContent className="rounded-md border border-border bg-card shadow-md">
                  {filteredScores.map((score) => (
                    <SelectItem key={score.id} value={String(score.id)}>
                      {score.peserta?.namaTim || "Tim tidak diketahui"} •{" "}
                      {score.event?.namaEvent || "Event tidak diketahui"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!scoreOptions.length && (
                <p className="text-[11px] text-amber-600">
                  Belum ada score tersedia. Buat score terlebih dahulu.
                </p>
              )}
            </div>
          )}

          {activeScore ? (
            <>
              <div className="rounded-md border border-border bg-muted p-3 text-xs text-muted-foreground">
                Tim:{" "}
                <span className="font-semibold text-foreground">
                  {activeScore.peserta?.namaTim || "Tim tidak diketahui"}
                </span>
                <br />
                Event:{" "}
                <span className="font-semibold text-foreground">
                  {activeScore.event?.namaEvent ||
                    "Event tidak diketahui"}
                </span>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium text-foreground sm:text-sm">
                  Kriteria <span className="text-red-500">*</span>
                </Label>
                <Input
                  required
                  value={form.kriteria}
                  onChange={(e) => handleChange("kriteria", e.target.value)}
                  placeholder="Misal: Teknis, Kreativitas..."
                  className="h-9 rounded-md border-border text-xs placeholder:text-muted-foreground sm:text-sm"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-foreground sm:text-sm">
                    Nilai <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={form.nilai}
                    onChange={(e) => handleChange("nilai", e.target.value)}
                    placeholder="Nilai kriteria"
                    required
                    className="h-9 rounded-md border-border text-xs placeholder:text-muted-foreground sm:text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-medium text-foreground sm:text-sm">
                    Bobot
                  </Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    value={form.bobot}
                    onChange={(e) => handleChange("bobot", e.target.value)}
                    placeholder="Opsional, contoh 0.25"
                    className="h-9 rounded-md border-border text-xs placeholder:text-muted-foreground sm:text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium text-foreground sm:text-sm">
                  Catatan
                </Label>
                <Textarea
                  rows={3}
                  value={form.catatan}
                  onChange={(e) => handleChange("catatan", e.target.value)}
                  placeholder="Catatan tambahan untuk kriteria ini (opsional)"
                  className="rounded-md border-border text-xs placeholder:text-muted-foreground sm:text-sm"
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
                    (!isEdit && !(form.scoreId || presetScore?.id)) ||
                    !activeScore ||
                    !form.kriteria ||
                    form.nilai === ""
                  }
                  className="rounded-md text-xs sm:text-sm"
                >
                  {submitting
                    ? "Menyimpan..."
                    : isEdit
                    ? "Simpan Perubahan"
                    : "Tambah Detail"}
                </Button>
              </div>
            </>
          ) : (
            <p className="text-xs text-muted-foreground">
              {scoreOptions.length
                ? filteredScores.length
                  ? "Pilih score terlebih dahulu untuk menambah detail."
                  : "Tidak ada score untuk juri yang dipilih."
                : "Belum ada score tersedia."}
            </p>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
