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
import { Calendar, Pencil, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/formatters";

function Badge({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-border bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
      {children}
    </span>
  );
}

export function DetailPesertaTable({
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
        Belum ada detail peserta. Tambahkan anggota tim agar data profil
        lengkap.
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* mobile cards */}
      <div className="space-y-3 px-3 py-3 sm:hidden">
        {items.map((detail, idx) => {
          return (
            <div
              key={detail.id}
              className="flex flex-col gap-2 rounded-xl border border-border bg-card p-3 text-sm shadow-sm transition-all hover:-translate-y-[1px] hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5">
                  <p className="text-base font-semibold text-foreground">
                    {detail.namaDetail}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {detail.peserta?.namaTim || "Tim tidak diketahui"}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {detail.peserta?.event?.namaEvent || "Event tidak tersedia"}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 text-right">
                  <span className="text-[11px] font-semibold text-muted-foreground">
                    No. {startIndex + idx}
                  </span>
                  {detail.umur != null && <Badge>{detail.umur} th</Badge>}
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <span>{formatDate(detail.tanggalLahir)}</span>
              </div>

              {canEdit && (
                <div className="flex justify-end gap-2 pt-1">
                  <Button
                    size="icon"
                    variant="dark"
                    className="h-7 w-7 rounded-full"
                    aria-label={`Edit detail untuk ${detail.namaDetail}`}
                    onClick={() => onEdit?.(detail)}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="icon"
                        variant="dark"
                        className="h-7 w-7 rounded-full"
                        aria-label={`Hapus detail ${detail.namaDetail}`}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-xl border border-border bg-card">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Hapus anggota?</AlertDialogTitle>
                        <AlertDialogDescription className="text-sm text-muted-foreground">
                          {detail.namaDetail} akan dihapus dari tim{" "}
                          <b>{detail.peserta?.namaTim || ""}</b>.
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
          );
        })}
      </div>

      {/* desktop table */}
      <div className="hidden sm:block">
        <div className="w-full overflow-x-auto py-1">
          <Table className="w-full whitespace-nowrap">
            <TableHeader>
              <TableRow className="border-b bg-muted text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <TableHead className="w-[6%] px-4 py-3 text-center">No</TableHead>
                <TableHead className="w-[24%] px-4 py-3">Anggota</TableHead>
                <TableHead className="w-[26%] px-4 py-3">Tim & Event</TableHead>
                <TableHead className="w-[15%] px-4 py-3 text-center">
                  Tanggal Lahir
                </TableHead>
                <TableHead className="w-[8%] px-4 py-3 text-center">
                  Umur
                </TableHead>
                <TableHead className="w-[22%] px-4 py-3">Kontak</TableHead>
                {canEdit && (
                  <TableHead className="w-[8%] px-4 py-3 text-center">
                    Aksi
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border">
              {items.map((detail, idx) => (
                <TableRow
                  key={detail.id}
                  className="text-sm text-foreground transition-colors hover:bg-muted"
                >
                  <TableCell className="px-4 py-3 align-top text-center text-xs font-semibold text-muted-foreground">
                    {startIndex + idx}
                  </TableCell>
                  <TableCell className="px-4 py-3 align-top">
                    <p className="font-semibold text-foreground">
                      {detail.namaDetail}
                    </p>
                  </TableCell>
                  <TableCell className="px-4 py-3 align-top text-xs text-muted-foreground">
                    <p className="font-medium text-sm text-foreground">
                      {detail.peserta?.namaTim || "Tim tidak diketahui"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {detail.peserta?.event?.namaEvent || "Event tidak tersedia"}
                    </p>
                  </TableCell>
                  <TableCell className="px-4 py-3 align-top text-center text-xs text-muted-foreground">
                    {formatDate(detail.tanggalLahir)}
                  </TableCell>
                  <TableCell className="px-4 py-3 align-top text-center text-xs text-muted-foreground">
                    {detail.umur != null ? `${detail.umur} th` : "-"}
                  </TableCell>
                  <TableCell className="px-4 py-3 align-top text-xs text-muted-foreground">
                    {detail.peserta?.namaPerwakilan || "-"}
                    <br />
                    <span className="text-[11px] text-muted-foreground">
                      {detail.peserta?.user?.email || "-"}
                    </span>
                  </TableCell>
                  {canEdit && (
                    <TableCell className="px-4 py-3 align-top text-center">
                      <div className="flex justify-center gap-2">
                        <Button
                          size="icon"
                          variant="dark"
                          className="h-8 w-8 rounded-full"
                          aria-label={`Edit detail ${detail.namaDetail}`}
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
                              aria-label={`Hapus detail ${detail.namaDetail}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="rounded-xl border border-border bg-card">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Hapus anggota?</AlertDialogTitle>
                              <AlertDialogDescription className="text-sm text-muted-foreground">
                                Data anggota ini akan dihapus permanen.
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
