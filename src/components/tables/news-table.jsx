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
import { Calendar, Images, MapPin, Pencil, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/formatters";

export function NewsTable({
  items,
  loading,
  canEdit,
  onEdit,
  onDelete,
  onSelect,
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
        Belum ada berita. Tambahkan pengumuman baru agar halaman publik
        tetap segar.
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="space-y-2 px-2 sm:px-4 py-2 sm:hidden overflow-x-hidden">
        {items.map((news, idx) => (
          <div
            key={news.id}
            onClick={() => onSelect?.(news)}
            className="flex items-center justify-between gap-1.5 rounded-md border border-border bg-card px-2 py-1.5 text-sm shadow-sm transition-all hover:-translate-y-[0.5px] hover:shadow-md active:touch-pan-y"
          >
            <div className="min-w-0 flex-1">
              <p className="font-medium text-xs text-foreground truncate">
                {news.title}
              </p>
              <span className="text-[9px] text-muted-foreground">
                {formatDate(news.tanggal)}
              </span>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <span className="text-[9px] font-semibold text-muted-foreground">
                No. {startIndex + idx}
              </span>
              {news.photoPath && (
                <span className="inline-flex items-center text-[8px] rounded px-1 py-0.5 text-muted-foreground bg-muted/30 whitespace-nowrap">
                  <Images className="h-2 w-2 mr-0.5" />
                  F
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="hidden sm:block">
        <div className="w-full overflow-x-auto py-1">
          <Table className="w-full whitespace-nowrap">
            <TableHeader>
              <TableRow className="border-b bg-muted text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <TableHead className="w-[6%] px-4 py-3 text-center">No</TableHead>
                <TableHead className="w-[26%] px-4 py-3">Berita</TableHead>
                <TableHead className="w-[12%] px-4 py-3">Tanggal</TableHead>
                <TableHead className="w-[20%] px-4 py-3">Event</TableHead>
                <TableHead className="w-[26%] px-4 py-3">Deskripsi</TableHead>
                <TableHead className="w-[8%] px-4 py-3">Tag</TableHead>
                <TableHead className="w-[8%] px-4 py-3 text-center">
                  Foto
                </TableHead>
                {canEdit && (
                  <TableHead className="w-[8%] px-4 py-3 text-center">
                    Aksi
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border">
              {items.map((news, idx) => (
                <TableRow
                  key={news.id}
                  className="text-sm text-foreground transition-colors hover:bg-muted cursor-pointer"
                  onClick={() => onSelect?.(news)}
                >
                  <TableCell className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground">
                    {startIndex + idx}
                  </TableCell>
                  <TableCell className="px-4 py-3 align-top">
                    <p className="font-medium text-foreground">{news.title}</p>
                  </TableCell>
                  <TableCell className="px-4 py-3 align-top text-sm">
                    {formatDate(news.tanggal)}
                  </TableCell>
                  <TableCell className="px-4 py-3 align-top text-xs text-muted-foreground">
                    {news.event?.namaEvent ? (
                      <div className="flex flex-col text-[13px] text-muted-foreground">
                        <span className="font-medium text-foreground">
                          {news.event.namaEvent}
                        </span>
                        {news.event.tanggalEvent && (
                          <span className="text-xs text-muted-foreground">
                            {formatDate(news.event.tanggalEvent)}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3 align-top text-xs text-muted-foreground">
                    <p className="line-clamp-3">{news.deskripsi}</p>
                  </TableCell>
                  <TableCell className="px-4 py-3 align-top text-xs text-muted-foreground">
                    {Array.isArray(news.tags) && news.tags.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {news.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-border bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-center align-top">
                    {news.photoPath ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground">
                        <Images className="h-3.5 w-3.5" />
                        Ada
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  {canEdit && (
                    <TableCell className="px-4 py-3 text-center align-top">
                      <div className="flex justify-center gap-2">
                        <Button
                          size="icon"
                          variant="dark"
                          className="h-8 w-8 rounded-full"
                          aria-label={`Edit berita ${news.title}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit?.(news);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="icon"
                              variant="dark"
                              className="h-8 w-8 rounded-full"
                              aria-label={`Hapus berita ${news.title}`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="rounded-xl border border-border bg-card">
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Hapus berita?
                              </AlertDialogTitle>
                              <AlertDialogDescription className="text-sm text-muted-foreground">
                                Berita <b>{news.title}</b> akan dihapus dari
                                daftar publikasi.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={() => onDelete?.(news)}
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
            key={`news-mobile-skeleton-${idx}`}
            className="space-y-2 rounded-xl border border-border bg-muted p-3"
          >
            <div className="h-4 w-2/3 rounded bg-muted" />
            <div className="h-3 w-1/2 rounded bg-muted" />
            <div className="h-3 w-5/6 rounded bg-muted" />
          </div>
        ))}
      </div>
      <div className="hidden w-full max-w-full overflow-x-auto sm:block">
        <table className="w-full">
          <tbody className="divide-y divide-border">
            {rows.map((_, idx) => (
              <tr key={`news-desktop-skeleton-${idx}`} className="animate-pulse">
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
