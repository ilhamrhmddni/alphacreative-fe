"use client";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Calendar, ClipboardList, GaugeCircle, Pencil, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/formatters";
import {
  calculateDetailScore,
  clampScoreValue,
  formatScoreDisplay,
  resolveScoreValue,
  safeDisplayValue,
} from "@/lib/utils";

export function ScoreDetailTable({
  items,
  scores = [],
  loading,
  canEdit,
  onEdit,
  onDelete,
  onDeleteScore,
  onAddDetail,
}) {
  const hasData = (items?.length ?? 0) > 0 || (scores?.length ?? 0) > 0;
  const groupedByScore = groupDetailsByScore(items, scores);

  if (loading) {
    return (
      <div className="px-3 sm:px-4 py-4">
        <TableSkeleton />
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="px-4 py-8 text-center text-sm text-muted-foreground">
        Belum ada detail penilaian. Tambahkan kriteria untuk score juri.
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="space-y-4">
        {groupedByScore.map((group) => {
          const scoreForResolve = group.score
            ? { ...group.score, details: group.details }
            : null;
          const resolvedScore = resolveScoreValue(scoreForResolve);
          const manualUsed = Boolean(
            group.score?.useManualNilai && group.score?.nilai != null
          );
          const autoScore = calculateDetailScore(group.details);
          const detailUsed = !manualUsed && autoScore != null;
          const displayScore =
            resolvedScore != null
              ? formatScoreDisplay(resolvedScore, { decimals: 1 })
              : manualUsed && group.score?.nilai != null
              ? formatScoreDisplay(group.score.nilai, { decimals: 1 })
              : "-";
          const eventDate = group.score?.event?.tanggalEvent;

          return (
            <div
              key={group.scoreId ?? `score-${group.pesertaName}`}
              className="rounded-xl border border-border bg-card shadow-sm"
            >
              <div className="border-b border-border px-4 py-3">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {group.pesertaName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {group.eventName}
                      {eventDate ? ` • ${formatDate(eventDate)}` : ""}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Juri:
                      <span className="font-semibold text-muted-foreground">
                        {group.juriName}
                      </span>
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2.5 py-1 font-semibold text-foreground">
                      <GaugeCircle className="h-3.5 w-3.5 text-muted-foreground" />
                      {displayScore}
                      {detailUsed && (
                        <span className="ml-1 text-[10px] font-normal text-emerald-600">
                          otomatis
                        </span>
                      )}
                      {manualUsed && (
                        <span className="ml-1 text-[10px] font-normal text-muted-foreground">
                          manual
                        </span>
                      )}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 font-semibold text-muted-foreground">
                      <ClipboardList className="h-3.5 w-3.5 text-muted-foreground" />
                      {group.details.length} kriteria
                    </span>
                    {group.score?.createdAt && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 font-semibold text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        {formatDate(group.score.createdAt)}
                      </span>
                    )}

                    {canEdit && onAddDetail && group.score && (
                      <Button
                        type="button"
                        size="sm"
                        className="h-8 rounded-md text-xs font-semibold"
                        onClick={() => onAddDetail?.(group.score)}
                      >
                        Tambah detail
                      </Button>
                    )}

                    {onDeleteScore && group.score && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 rounded-full border border-border text-muted-foreground hover:bg-muted"
                            aria-label={`Hapus score ${group.pesertaName}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rounded-xl border border-border bg-card">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Hapus score utama?</AlertDialogTitle>
                            <AlertDialogDescription className="text-sm text-muted-foreground">
                              Seluruh detail penilaian untuk tim {group.pesertaName} di event {group.eventName} akan ikut terhapus.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              onClick={() => onDeleteScore?.(group.score)}
                            >
                              Ya, hapus score
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
              </div>

              <div className="divide-y divide-border">
                {group.details.length > 0 ? (
                  group.details.map((detail, idx) => {
                    const nilaiClamped = clampScoreValue(detail.nilai);
                    const bobotClamped = clampScoreValue(detail.bobot, 0, 1);
                    const contribution =
                      bobotClamped != null && nilaiClamped != null
                        ? nilaiClamped * bobotClamped
                        : null;
                    const nilaiDisplay = safeDisplayValue(detail.nilai);
                    const catatanText =
                      typeof detail.catatan === "string" &&
                      detail.catatan.trim().toLowerCase() !== "null"
                        ? detail.catatan
                        : null;

                    return (
                      <div
                        key={detail.id}
                        className="flex flex-col gap-4 px-4 py-3 text-sm text-foreground transition-colors hover:bg-muted sm:flex-row sm:items-stretch sm:justify-between"
                      >
                        <div className="flex flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
                          <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                            No. {idx + 1}
                          </span>
                          <div className="flex-1">
                            <p className="font-medium text-foreground">
                              {detail.kriteria}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Bobot: {detail.bobot != null ? detail.bobot : "-"}
                              {contribution != null && (
                                <>
                                  {" "}• Poin: <span className="font-semibold">{contribution.toFixed(1)}</span>
                                </>
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center sm:justify-end sm:gap-4">
                          <div className="flex flex-col items-center gap-1 text-right sm:items-end">
                            <span className="inline-flex rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold text-foreground">
                              Nilai: {nilaiDisplay}
                            </span>
                            {contribution != null && (
                              <span className="text-[11px] font-semibold text-emerald-600">
                                Poin: {contribution.toFixed(1)}
                              </span>
                            )}
                          </div>

                          <div className="w-full rounded-lg border border-border bg-card px-3 py-2 text-xs text-muted-foreground sm:flex-1 sm:min-w-[260px] sm:max-w-md">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                              Catatan juri
                            </p>
                            {catatanText ? (
                              <p className="mt-2 whitespace-pre-wrap text-foreground">
                                {catatanText}
                              </p>
                            ) : (
                              <p className="mt-2 text-muted-foreground">Tidak ada catatan</p>
                            )}
                          </div>

                          {canEdit && (
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="icon"
                                variant="dark"
                                className="h-8 w-8 rounded-full"
                                aria-label={`Edit detail ${detail.id}`}
                                onClick={() => onEdit?.(detail)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    size="icon"
                                    variant="dark"
                                    className="h-8 w-8 rounded-full"
                                    aria-label={`Hapus detail ${detail.id}`}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="rounded-xl border border-border bg-card">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Hapus detail score?</AlertDialogTitle>
                                    <AlertDialogDescription className="text-sm text-muted-foreground">
                                      Kriteria {detail.kriteria} akan dihapus dari penilaian {group.pesertaName}.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                    <AlertDialogAction
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      onClick={() => onDelete?.(detail)}
                                    >
                                      Ya, hapus
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="px-4 py-4 text-sm text-muted-foreground">
                    Belum ada detail penilaian untuk score ini. Tambahkan kriteria penilaian agar nilai otomatis dapat dihitung.
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TableSkeleton() {
  const rows = Array.from({ length: 4 });
  return (
    <div className="space-y-4">
      <div className="space-y-3 sm:hidden">
        {rows.map((_, idx) => (
          <div
            key={`mobile-skeleton-${idx}`}
            className="space-y-2 rounded-xl border border-border bg-muted p-3"
          >
            <div className="h-4 w-2/3 rounded bg-muted" />
            <div className="h-3 w-1/2 rounded bg-muted" />
            <div className="h-3 w-1/3 rounded bg-muted" />
          </div>
        ))}
      </div>

      <div className="hidden w-full overflow-x-auto sm:block">
        <table className="w-full">
          <tbody className="divide-y divide-border">
            {rows.map((_, idx) => (
              <tr key={`desktop-skeleton-${idx}`} className="animate-pulse">
                {Array.from({ length: 4 }).map((__, colIdx) => (
                  <td key={colIdx} className="px-4 py-3">
                    <div className="h-4 rounded bg-muted" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function groupDetailsByScore(items = [], scores = []) {
  const map = new Map();

  scores.forEach((score) => {
    if (!score) return;
    const key = score.id != null ? String(score.id) : `score-${score.peserta?.namaTim ?? Math.random()}`;
    if (!map.has(key)) {
      map.set(key, {
        scoreId: score.id ?? null,
        eventName: score.event?.namaEvent ?? "Event tidak diketahui",
        pesertaName: score.peserta?.namaTim ?? "Tim tidak diketahui",
        juriName: score.juri?.username ?? score.juri?.email ?? "Juri tidak diketahui",
        score,
        details: [],
      });
    }
  });

  items.forEach((detail) => {
    if (!detail) return;
    const scoreRef = detail.score ?? scores.find((score) => score?.id === detail.scoreId) ?? null;
    const scoreId = scoreRef?.id ?? detail.scoreId ?? null;
    const key = scoreId != null ? String(scoreId) : `detail-${detail.id}`;

    if (!map.has(key)) {
      map.set(key, {
        scoreId,
        eventName:
          scoreRef?.event?.namaEvent ?? detail.score?.event?.namaEvent ?? "Event tidak diketahui",
        pesertaName:
          scoreRef?.peserta?.namaTim ?? detail.score?.peserta?.namaTim ?? "Tim tidak diketahui",
        juriName:
          scoreRef?.juri?.username ??
          scoreRef?.juri?.email ??
          detail.score?.juri?.username ??
          detail.score?.juri?.email ??
          "Juri tidak diketahui",
        score: scoreRef ?? detail.score ?? null,
        details: [],
      });
    }

    map.get(key)?.details.push(detail);
  });

  const sorted = Array.from(map.values());
  sorted.sort((a, b) => {
    const nameComparison = a.pesertaName.localeCompare(b.pesertaName);
    if (nameComparison !== 0) return nameComparison;
    const idA = Number(a.scoreId ?? 0);
    const idB = Number(b.scoreId ?? 0);
    return idA - idB;
  });

  return sorted;
}

