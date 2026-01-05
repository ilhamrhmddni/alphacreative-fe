"use client";

import { Calendar, MapPin, Users, Pencil, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/formatters";
import { getStatusBadgeClasses } from "@/utils/table";
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

export function SubEventsTable({
  items,
  loading,
  canEdit,
  onEdit,
  onDelete,
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
        Belum ada kategori. Tambahkan kategori pada event untuk menampilkan data di sini.
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="space-y-3 px-3 sm:px-4 py-3 sm:hidden">
        {items.map((item, idx) => (
          <div
            key={item.id}
            className="rounded-xl border border-border bg-card p-3 text-sm flex flex-col gap-2 shadow-sm"
          >
            <div className="flex justify-between items-start gap-2">
              <div className="space-y-1">
                <div className="font-semibold text-base text-foreground line-clamp-2">
                  {item.name || "-"}
                </div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase">
                  {item.eventName || "Event tidak tersedia"}
                </p>
              </div>
              <span className="text-[11px] font-semibold text-muted-foreground">
                No. {startIndex + idx}
              </span>
            </div>

            <div className="space-y-1 pt-1 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>{formatDate(item.eventDate)}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                <span>{item.eventLocation || "Lokasi belum ditentukan"}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                <span>
                  Kuota {item.quota ?? "-"} • Peserta {item.participantCount ?? 0}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 text-xs text-muted-foreground">
              <span
                className={`inline-flex items-center gap-2 rounded-full border px-2 py-0.5 font-semibold capitalize ${getStatusBadgeClasses(
                  item.eventStatus
                ).className}`}
              >
                {item.eventStatus || "-"}
              </span>
              {canEdit && (
                <div className="flex gap-2">
                  <Button
                    size="icon"
                    variant="dark"
                    className="h-7 w-7 rounded-full"
                    aria-label={`Edit sub event ${item.name}`}
                    onClick={() => onEdit?.(item)}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="icon"
                        variant="dark"
                        className="h-7 w-7 rounded-full"
                        aria-label={`Hapus sub event ${item.name}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-xl bg-card border border-border">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Hapus sub event?</AlertDialogTitle>
                        <AlertDialogDescription className="text-sm text-muted-foreground">
                          Sub event <b>{item.name}</b> dari event {item.eventName || "-"} akan dihapus permanen.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          onClick={() => onDelete?.(item)}
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
        ))}
      </div>

      <div className="hidden sm:block">
        <div className="w-full overflow-x-auto py-1">
          <Table className="w-full whitespace-nowrap">
            <TableHeader>
              <TableRow className="text-xs font-semibold tracking-wide text-left text-muted-foreground uppercase border-b bg-muted">
                <TableHead className="px-4 py-3 text-center w-12">No</TableHead>
                <TableHead className="px-4 py-3 text-left w-[28%]">
                  Kategori
                </TableHead>
                <TableHead className="px-4 py-3 text-left w-[32%]">
                  Event Induk
                </TableHead>
                <TableHead className="px-4 py-3 text-center w-[12%]">
                  Kuota
                </TableHead>
                <TableHead className="px-4 py-3 text-center w-[12%]">
                  Peserta
                </TableHead>
                <TableHead className="px-4 py-3 text-center w-[12%]">
                  Status Event
                </TableHead>
                {canEdit && (
                  <TableHead className="px-4 py-3 text-center w-[6rem]">
                    Aksi
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border">
              {items.map((item, idx) => (
                <TableRow
                  key={item.id}
                  className="text-foreground hover:bg-muted transition-colors"
                >
                  <TableCell className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground">
                    {startIndex + idx}
                  </TableCell>
                  <TableCell className="px-4 py-3 align-top">
                    <div className="font-medium text-sm text-foreground">
                      {item.name || "-"}
                    </div>
                    {item.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {item.description}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3 align-top text-sm">
                    <div className="font-medium text-foreground">
                      {item.eventName || "-"}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(item.eventDate)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.eventLocation || "Lokasi belum ditentukan"}
                    </p>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-center align-top text-sm">
                    {item.quota ?? "-"}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-center align-top text-sm">
                    {item.participantCount ?? 0}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-center align-top">
                    <span
                      className={`inline-flex items-center justify-center text-xs px-2 py-0.5 rounded-full border capitalize ${getStatusBadgeClasses(
                        item.eventStatus
                      ).className}`}
                    >
                      {item.eventStatus || "-"}
                    </span>
                  </TableCell>
                  {canEdit && (
                    <TableCell className="px-4 py-3 text-center align-top">
                      <div className="flex justify-center gap-2">
                        <Button
                          size="icon"
                          variant="dark"
                          className="h-8 w-8 rounded-full"
                          aria-label={`Edit sub event ${item.name}`}
                          onClick={() => onEdit?.(item)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="icon"
                              variant="dark"
                              className="h-8 w-8 rounded-full"
                              aria-label={`Hapus sub event ${item.name}`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="rounded-xl bg-card border border-border">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Hapus sub event?</AlertDialogTitle>
                              <AlertDialogDescription className="text-sm text-muted-foreground">
                                Sub event <b>{item.name}</b> dari event {item.eventName || "-"} akan dihapus permanen.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={() => onDelete?.(item)}
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

      <div className="hidden sm:block w-full max-w-full overflow-x-auto">
        <table className="w-full">
          <tbody className="divide-y divide-border">
            {rows.map((_, rowIdx) => (
              <tr key={`desktop-skeleton-${rowIdx}`} className="animate-pulse">
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
