"use client";

import { Calendar, MapPin, Pencil, Tag, Trash2, Star, StarOff } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { getStatusBadgeClasses } from "@/utils/table";
import { EVENT_STATUS_LABELS } from "@/constants";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

function formatCategoryLabel(event) {
  const categories = Array.isArray(event?.categories) ? event.categories : [];

  if (!categories.length) {
    return "Tanpa kategori";
  }

  return categories
    .map((category) => {
      const name = category?.name || "Kategori";
      const quota = category?.quota;
      if (quota === null || quota === undefined) {
        return `${name} (Kuota -)`;
      }
      return `${name} (Kuota ${quota})`;
    })
    .join(", ");
}

export function EventsTable({
  events,
  loading,
  canEdit,
  onFeature,
  selectedEventId,
  onSelect,
  onEdit,
  onDelete,
  startIndex = 1,
}) {
  const hasData = events && events.length > 0;

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
        Belum ada event terdaftar. Tambahkan event baru untuk mulai mengisi
        kalender.
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* MOBILE: cards */}
      <div className="space-y-3 px-3 sm:px-4 py-3 sm:hidden">
        {events.map((ev, idx) => (
          <div
            key={ev.id}
            onClick={() => onSelect?.(ev)}
            className={`rounded-xl border border-border bg-card p-3 text-sm flex flex-col gap-2 cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-[1px] transition-all ${
              ev.id === selectedEventId ? "ring-2 ring-slate-200" : ""
            }`}
          >
            <div className="flex justify-between items-start gap-2">
              <div className="space-y-1">
                <div className="font-semibold text-base line-clamp-2 text-foreground">
                  {ev.namaEvent || "-"}
                </div>
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{formatDate(ev.tanggalEvent)}</span>
                </div>
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{ev.tempatEvent || "-"}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 text-right">
                <span className="text-[11px] font-semibold text-muted-foreground">
                  No. {startIndex + idx}
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full border capitalize ${getStatusBadgeClasses(
                    ev.status
                  ).className}`}
                >
                  {ev.status || "draft"}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground pt-1">
              <span className="inline-flex items-center gap-1">
                <span className="font-medium">{formatCategoryLabel(ev)}</span>
              </span>
              <span>
                Kuota: <span className="font-medium">{ev.kuota ?? 0}</span>
              </span>
              <span>
                <span className="inline-flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  <span className="font-medium">
                    {formatCurrency(ev.biaya)}
                  </span>
                </span>
              </span>
            </div>

            {canEdit && (
              <div className="flex justify-end gap-2 pt-1">
                <Button
                  size="icon"
                  variant={ev.isFeatured ? "default" : "ghost"}
                  onClick={(e) => {
                    e.stopPropagation();
                    onFeature?.(ev);
                  }}
                  aria-label={ev.isFeatured ? "Unset featured" : "Set as featured"}
                  className="rounded-full h-7 w-7"
                >
                  {ev.isFeatured ? (
                    <Star className="h-3 w-3 text-yellow-500" />
                  ) : (
                    <StarOff className="h-3 w-3" />
                  )}
                </Button>
                <Button
                  size="icon"
                  variant="dark"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit?.(ev);
                  }}
                  aria-label={`Edit event ${ev.namaEvent}`}
                  className="rounded-full h-7 w-7"
                >
                  <Pencil className="h-3 w-3" />
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="icon"
                      variant="dark"
                      aria-label={`Hapus event ${ev.namaEvent}`}
                      className="rounded-full h-7 w-7 "
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="rounded-xl bg-card border border-border">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Hapus event?</AlertDialogTitle>
                      <AlertDialogDescription className="text-sm text-muted-foreground">
                        Event <b>{ev.namaEvent}</b> akan dihapus permanen
                        beserta partisipasi yang terkait (jika ada). Tindakan
                        ini tidak bisa dibatalkan.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Batal</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={() => onDelete?.(ev)}
                      >
                        Ya, hapus
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* DESKTOP: table */}
      <div className="hidden sm:block">
        <div className="w-full overflow-x-auto py-1">
          <Table className="w-full whitespace-nowrap">
            <TableHeader>
              <TableRow className="text-xs font-semibold tracking-wide text-left text-muted-foreground uppercase border-b bg-muted">
                <TableHead className="px-4 py-3 text-center w-12">
                  No
                </TableHead>
                <TableHead className="px-4 py-3 text-left w-[30%]">
                  Event
                </TableHead>
                <TableHead className="px-4 py-3 text-left w-[26%]">
                  Tanggal & Lokasi
                </TableHead>
                <TableHead className="px-4 py-3 text-center w-[14%]">
                  Status
                </TableHead>
                <TableHead className="px-4 py-3 text-center w-[10%]">
                  Kuota
                </TableHead>
                <TableHead className="px-4 py-3 text-center w-[16%]">
                  Biaya
                </TableHead>
                {canEdit && (
                  <TableHead className="px-4 py-3 text-center w-[6rem]">
                    Aksi
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border">
              {events.map((ev, idx) => (
                <TableRow
                  key={ev.id}
                  onClick={() => onSelect?.(ev)}
                  className="text-foreground hover:bg-muted cursor-pointer transition-colors"
                >
                  <TableCell className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground">
                    {startIndex + idx}
                  </TableCell>
                  <TableCell className="px-4 py-3 align-top">
                    <div className="font-medium text-sm text-foreground">
                      {ev.namaEvent || "-"}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatCategoryLabel(ev)}
                    </p>
                  </TableCell>

                  <TableCell className="px-4 py-3 text-sm align-top">
                    <div>{formatDate(ev.tanggalEvent)}</div>
                    <p className="text-xs text-muted-foreground">
                      {ev.tempatEvent || "-"}
                    </p>
                  </TableCell>

                  <TableCell className="px-4 py-3 text-center align-top">
                    <span
                      className={`inline-flex items-center justify-center text-xs px-2 py-0.5 rounded-full border capitalize ${getStatusBadgeClasses(
                        ev.status
                      ).className}`}
                    >
                      {ev.status || "-"}
                    </span>
                  </TableCell>

                  <TableCell className="px-4 py-3 text-center align-top text-sm">
                    {ev.kuota ?? 0}
                  </TableCell>

                  <TableCell className="px-4 py-3 text-center align-top text-sm">
                    {formatCurrency(ev.biaya)}
                  </TableCell>

                  {canEdit && (
                    <TableCell className="px-4 py-3 text-center align-top">
                      <div className="flex justify-center gap-2">
                        <Button
                          size="icon"
                          variant={ev.isFeatured ? "default" : "ghost"}
                          onClick={(e) => {
                            e.stopPropagation();
                            onFeature?.(ev);
                          }}
                          aria-label={ev.isFeatured ? "Unset featured" : "Set as featured"}
                          className="h-8 w-8 rounded-full"
                        >
                          {ev.isFeatured ? (
                            <Star className="h-4 w-4 text-yellow-500" />
                          ) : (
                            <StarOff className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="icon"
                          variant="dark"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit?.(ev);
                          }}
                          aria-label={`Edit event ${ev.namaEvent}`}
                          className="h-8 w-8 rounded-full"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="icon"
                              variant="dark"
                              className="h-8 w-8 rounded-full"
                              aria-label={`Hapus event ${ev.namaEvent}`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="rounded-xl bg-card border border-border">
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Hapus event?
                              </AlertDialogTitle>
                              <AlertDialogDescription className="text-sm text-muted-foreground">
                                Event <b>{ev.namaEvent}</b> akan dihapus
                                permanen beserta partisipasi yang terkait
                                (jika ada). Tindakan ini tidak bisa
                                dibatalkan.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={() => onDelete?.(ev)}
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
              ))}
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
      {/* mobile skeleton */}
      <div className="sm:hidden space-y-3">
        {rows.map((_, idx) => (
          <div
            key={`mobile-skeleton-${idx}`}
            className="rounded-xl border border-border p-3 space-y-2 animate-pulse bg-muted"
          >
            <div className="h-4 bg-muted rounded w-2/3" />
            <div className="h-3 bg-muted rounded w-1/2" />
            <div className="h-3 bg-muted rounded w-3/4" />
          </div>
        ))}
      </div>

      {/* desktop skeleton */}
      <div className="hidden sm:block w-full max-w-full overflow-x-auto">
        <table className="w-full">
          <tbody className="divide-y divide-border">
            {rows.map((_, idx) => (
              <tr key={`desktop-skeleton-${idx}`} className="animate-pulse">
                {Array.from({ length: 6 }).map((__, colIdx) => (
                  <td key={colIdx} className="px-4 py-3">
                    <div className="h-4 bg-muted rounded" />
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
