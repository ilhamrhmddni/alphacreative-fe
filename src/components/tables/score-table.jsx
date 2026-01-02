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
import { Calendar, ClipboardList, Pencil, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/formatters";
import {
  calculateDetailScore,
  formatScoreDisplay,
  resolveScoreValue,
  safeDisplayValue,
} from "@/lib/utils";

export function ScoreTable({
  items,
  loading,
  canEdit,
  onEdit,
  onDelete,
  onViewDetails,
  startIndex = 1,
}) {
  const hasData = items && items.length > 0;

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
        Belum ada score. Catat penilaian juri untuk setiap tim.
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* mobile cards */}
      <div className="space-y-3 px-3 py-3 sm:hidden">
        {items.map((score, idx) => {
          const resolvedValue = resolveScoreValue(score);
          const displayValue =
            resolvedValue != null
              ? formatScoreDisplay(resolvedValue)
              : safeDisplayValue(score.nilai);
          const manualUsed = Boolean(
            score.useManualNilai && score.nilai != null && resolvedValue != null
          );
          const detailScore = manualUsed
            ? null
            : calculateDetailScore(score.details);
          const detailUsed = !manualUsed && detailScore != null;
          const criteriaLabel = (score.details || [])
            .map((detail) => detail?.kriteria)
            .filter(Boolean)
            .join(", ");
          const hasDetails = Boolean(score.details?.length);
          const catatanText =
            typeof score.catatan === "string" &&
            score.catatan.trim().toLowerCase() !== "null"
              ? score.catatan
              : null;
          return (
            <div
            key={score.id}
            className="flex flex-col gap-2 rounded-xl border border-border bg-card p-3 text-sm shadow-sm transition-all hover:-translate-y-[1px] hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-0.5">
                <p className="text-base font-semibold text-foreground">
                  {score.peserta?.namaTim || "Tim tidak diketahui"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {score.event?.namaEvent || "Event tidak diketahui"}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1 text-right">
                <span className="text-[11px] font-semibold text-muted-foreground">
                  No. {startIndex + idx}
                </span>
                <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[11px] font-semibold text-foreground">
                  {displayValue}
                  {detailUsed && " (auto)"}
                  {manualUsed && " (manual)"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>{formatDate(score.createdAt)}</span>
            </div>

            <p className="text-xs text-muted-foreground line-clamp-3">
              {catatanText || "Tidak ada catatan."}
            </p>

            {criteriaLabel && (
              <p className="text-[11px] text-muted-foreground">
                {criteriaLabel}
              </p>
            )}

            <div className="flex justify-between text-[11px] text-muted-foreground">
              <span>Juri: {score.juri?.username || score.juri?.email || "-"}</span>
              <span>
                Detail:{" "}
                <span className="font-semibold">
                  {score.details?.length || 0}
                </span>
              </span>
            </div>

            {hasDetails && onViewDetails && (
              <div className="pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  className="w-full rounded-full text-[11px]"
                  onClick={() => onViewDetails?.(score)}
                >
                  Detail & catatan
                </Button>
              </div>
            )}

            {canEdit && (
              <div className="flex justify-end gap-2 pt-1">
                <Button
                  size="icon"
                  variant="dark"
                  className="h-7 w-7 rounded-full"
                  aria-label={`Edit score ${score.id}`}
                  onClick={() => onEdit?.(score)}
                >
                  <Pencil className="h-3 w-3" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="icon"
                      variant="dark"
                      className="h-7 w-7 rounded-full"
                      aria-label={`Hapus score ${score.id}`}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="rounded-xl border border-border bg-card">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Hapus score?</AlertDialogTitle>
                      <AlertDialogDescription className="text-sm text-muted-foreground">
                        Nilai juri {score.juri?.username || score.juri?.email || "-"} untuk{" "}
                        <b>{score.peserta?.namaTim || "Tim tidak diketahui"}</b> akan
                        dihapus.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Batal</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={() => onDelete?.(score)}
                      >
                        Ya, hapus
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
            </div>
          );
        })}
      </div>

      {/* desktop table */}
      <div className="hidden sm:block">
        <div className="w-full overflow-x-auto py-1">
          <Table className="w-full whitespace-nowrap">
            <TableHeader>
              <TableRow className="border-b bg-muted text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <TableHead className="w-[5%] px-4 py-3 text-center">No</TableHead>
                <TableHead className="w-[24%] px-4 py-3">Event</TableHead>
                <TableHead className="w-[24%] px-4 py-3">Tim</TableHead>
                <TableHead className="w-[16%] px-4 py-3 text-center">
                  Nilai
                </TableHead>
                <TableHead className="w-[16%] px-4 py-3">Juri</TableHead>
                <TableHead className="w-[14%] px-4 py-3 text-center">
                  Detail
                </TableHead>
                {canEdit && (
                  <TableHead className="w-[6%] px-4 py-3 text-center">
                    Aksi
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border">
              {items.map((score, idx) => {
                const resolvedValue = resolveScoreValue(score);
                const manualUsed = Boolean(
                  score.useManualNilai &&
                    score.nilai != null &&
                    resolvedValue != null
                );
                const detailScore = manualUsed
                  ? null
                  : calculateDetailScore(score.details);
                const detailUsed = !manualUsed && detailScore != null;
                const displayValue =
                  resolvedValue != null
                    ? formatScoreDisplay(resolvedValue)
                    : safeDisplayValue(score.nilai);
                const criteriaLabel = (score.details || [])
                  .map((detail) => detail?.kriteria)
                  .filter(Boolean)
                  .join(", ");
                const hasDetails = Boolean(score.details?.length);
                const catatanText =
                  typeof score.catatan === "string" &&
                  score.catatan.trim().toLowerCase() !== "null"
                    ? score.catatan
                    : null;
                return (
                  <TableRow
                    key={score.id}
                    className="text-sm text-foreground transition-colors hover:bg-muted"
                  >
                  <TableCell className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground">
                    {startIndex + idx}
                  </TableCell>
                  <TableCell className="px-4 py-3 align-top">
                    <p className="font-semibold text-foreground">
                      {score.event?.namaEvent || "Event tidak diketahui"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(score.createdAt)}
                    </p>
                  </TableCell>
                  <TableCell className="px-4 py-3 align-top">
                    <p className="font-medium text-foreground">
                      {score.peserta?.namaTim || "Tim tidak diketahui"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {score.peserta?.namaPerwakilan || "-"}
                    </p>
                  </TableCell>
                  <TableCell className="px-4 py-3 align-top text-center">
                    <span className="inline-flex items-center justify-center rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold text-foreground">
                      {displayValue}
                    </span>
                    {manualUsed && (
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        Nilai manual digunakan
                      </p>
                    )}
                    {detailUsed && (
                      <p className="mt-1 text-[11px] text-emerald-600">
                        Nilai otomatis dari detail
                      </p>
                    )}
                    {criteriaLabel && (
                      <p className="mt-1 text-[11px] text-muted-foreground line-clamp-2">
                        {criteriaLabel}
                      </p>
                    )}
                    {catatanText && (
                      <p className="mt-2 text-[11px] text-muted-foreground line-clamp-2">
                        {catatanText}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3 align-top text-xs text-muted-foreground">
                    {score.juri?.username || score.juri?.email || "Juri tidak diketahui"}
                  </TableCell>
                  <TableCell className="px-4 py-3 align-top text-center text-xs text-muted-foreground">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={!hasDetails || !onViewDetails}
                      className="inline-flex items-center justify-center rounded-full px-3 py-1 text-[11px]"
                      onClick={() => onViewDetails?.(score)}
                    >
                      <ClipboardList className="mr-1 h-3.5 w-3.5 text-muted-foreground" />
                      {`${score.details?.length || 0} kriteria${
                        hasDetails ? " • Detail & catatan" : ""
                      }`}
                    </Button>
                  </TableCell>
                  {canEdit && (
                    <TableCell className="px-4 py-3 align-top text-center">
                      <div className="flex justify-center gap-2">
                        <Button
                          size="icon"
                          variant="dark"
                          className="h-8 w-8 rounded-full"
                          aria-label={`Edit score ${score.id}`}
                          onClick={() => onEdit?.(score)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="icon"
                              variant="dark"
                              className="h-8 w-8 rounded-full"
                              aria-label={`Hapus score ${score.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="rounded-xl border border-border bg-card">
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Hapus score?
                              </AlertDialogTitle>
                              <AlertDialogDescription className="text-sm text-muted-foreground">
                                Tindakan ini akan menghapus nilai dan seluruh detail terkait.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={() => onDelete?.(score)}
                              >
                                Ya, hapus
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
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
            className="rounded-xl border border-border bg-muted p-3 space-y-2"
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
                {Array.from({ length: 6 }).map((__, colIdx) => (
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
