"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

function calculateDetailScore(details) {
  if (!details || !details.length) return null;
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

export function ScoreDetailTable({
  items,
  loading,
  canEdit,
  onEdit,
  onDelete,
  onDeleteScore,
}) {
  const hasData = items && items.length > 0;
  const groupedByScore = groupDetailsByScore(items);

  if (loading) {
    return (
      <div className="px-3 sm:px-4 py-4">
        <TableSkeleton />
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="px-4 py-8 text-center text-sm text-slate-500">
        Belum ada detail penilaian. Tambahkan kriteria untuk score juri.
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="space-y-4">
        {groupedByScore.map((group) => {
          const autoScore = calculateDetailScore(group.details);
          const manualScore = group.score?.nilai;
          const displayScore =
            autoScore != null
              ? autoScore.toFixed(1)
              : manualScore != null
              ? Number(manualScore).toFixed(1)
              : "-";
          const eventDate = group.score?.event?.tanggalEvent;

          return (
            <div
              key={group.scoreId}
              className="rounded-xl border border-slate-200 bg-white shadow-sm"
            >
            <div className="border-b border-slate-100 px-4 py-3">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {group.pesertaName}
                  </p>
                  <p className="text-xs text-slate-500">
                    {group.eventName}
                    {eventDate ? ` • ${formatDate(eventDate)}` : ""}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Juri:{" "}
                    <span className="font-semibold text-slate-600">
                      {group.juriName}
                    </span>
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 font-semibold text-slate-700">
                    <GaugeCircle className="h-3.5 w-3.5 text-slate-500" />
                    {displayScore}
                    {autoScore != null && (
                      <span className="ml-1 text-[10px] font-normal text-emerald-600">
                        otomatis
                      </span>
                    )}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 font-semibold text-slate-600">
                    <ClipboardList className="h-3.5 w-3.5 text-slate-500" />
                    {group.details.length} kriteria
                  </span>
                  {group.score?.createdAt && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 font-semibold text-slate-600">
                      <Calendar className="h-3.5 w-3.5 text-slate-500" />
                      {formatDate(group.score.createdAt)}
                    </span>
                  )}

                  {onDeleteScore && group.score && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 rounded-full border border-slate-200 text-slate-500 hover:bg-slate-100"
                          aria-label={`Hapus score ${group.pesertaName}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="rounded-xl border border-slate-200 bg-white">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Hapus score utama?</AlertDialogTitle>
                          <AlertDialogDescription className="text-sm text-slate-600">
                            Seluruh detail penilaian untuk tim {group.pesertaName} di
                            event {group.eventName} akan ikut terhapus.
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

            <div className="divide-y divide-slate-100">
              {group.details.map((detail, idx) => {
                const contribution =
                  detail.bobot != null
                    ? clamp(Number(detail.nilai) || 0, 0, 100) *
                      clamp(Number(detail.bobot), 0, 1)
                    : null;
                return (
                  <div
                    key={detail.id}
                    className="flex flex-col gap-4 px-4 py-3 text-sm text-slate-700 transition-colors hover:bg-slate-50 sm:flex-row sm:items-stretch sm:justify-between"
                  >
                    <div className="flex flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                        No. {idx + 1}
                      </span>
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">
                          {detail.kriteria}
                        </p>
                        <p className="text-xs text-slate-500">
                          Bobot: {detail.bobot != null ? detail.bobot : "-"}
                          {contribution != null && (
                            <>
                              {" "}
                              • Poin: {" "}
                              <span className="font-semibold">
                                {contribution.toFixed(1)}
                              </span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center sm:justify-end sm:gap-4">
                      <div className="flex flex-col items-center gap-1 text-right sm:items-end">
                        <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
                          Nilai: {detail.nilai}
                        </span>
                        {contribution != null && (
                          <span className="text-[11px] font-semibold text-emerald-600">
                            Poin: {contribution.toFixed(1)}
                          </span>
                        )}
                      </div>

                      <div className="w-full rounded-lg border border-slate-100 bg-white px-3 py-2 text-xs text-slate-600 sm:flex-1 sm:min-w-[260px] sm:max-w-md">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                          Catatan juri
                        </p>
                        {detail.catatan ? (
                          <p className="mt-2 whitespace-pre-wrap text-slate-700">
                            {detail.catatan}
                          </p>
                        ) : (
                          <p className="mt-2 text-slate-400">Tidak ada catatan</p>
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
                            <AlertDialogContent className="rounded-xl border border-slate-200 bg-white">
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Hapus detail score?
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-sm text-slate-600">
                                  Kriteria {detail.kriteria} akan dihapus dari
                                  penilaian {group.pesertaName}.
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
              })}
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
      <div className="sm:hidden space-y-3">
        {rows.map((_, idx) => (
          <div
            key={`mobile-skeleton-${idx}`}
            className="rounded-xl border border-slate-100 bg-slate-50 p-3 space-y-2"
          >
            <div className="h-4 w-2/3 rounded bg-slate-200" />
            <div className="h-3 w-1/2 rounded bg-slate-200" />
            <div className="h-3 w-1/3 rounded bg-slate-200" />
          </div>
        ))}
      </div>

      <div className="hidden w-full overflow-x-auto sm:block">
        <table className="w-full">
          <tbody className="divide-y divide-slate-100">
            {rows.map((_, idx) => (
              <tr key={`desktop-skeleton-${idx}`} className="animate-pulse">
                {Array.from({ length: 4 }).map((__, colIdx) => (
                  <td key={colIdx} className="px-4 py-3">
                    <div className="h-4 rounded bg-slate-200" />
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

function groupDetailsByScore(items) {
  const map = new Map();
  items.forEach((detail) => {
    const scoreId = detail.scoreId || detail.score?.id || `unknown-${detail.id}`;
    if (!map.has(scoreId)) {
      map.set(scoreId, {
        scoreId,
        eventName:
          detail.score?.event?.namaEvent || "Event tidak diketahui",
        pesertaName:
          detail.score?.peserta?.namaTim || "Tim tidak diketahui",
        juriName:
          detail.score?.juri?.username ||
          detail.score?.juri?.email ||
          "Juri tidak diketahui",
        score: detail.score || null,
        details: [],
      });
    }
    map.get(scoreId).details.push(detail);
  });
  return Array.from(map.values());
}

function clamp(value, min, max) {
  if (Number.isNaN(value)) return min;
  return Math.min(Math.max(value, min), max);
}
