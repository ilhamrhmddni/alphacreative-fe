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
import { Calendar, ExternalLink, IdCard, Pencil, Trash2, UserCircle2, Check } from "lucide-react";
import { formatDate } from "@/lib/formatters";

function Badge({ children, variant = "default" }) {
  const variants = {
    default: "bg-muted text-muted-foreground border-border",
    emerald: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    amber: "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    rose: "bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${variants[variant]}`}
    >
      {children}
    </span>
  );
}

export function PesertaTable({
  items,
  loading,
  canEdit,
  onEdit,
  onDelete,
  onChangeStatus,
  startIndex = 1,
}) {
  const hasData = items && items.length > 0;

  if (loading) {
    return (
      <div className="px-4 py-4">
        <TableSkeleton />
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="px-4 py-8 text-center text-sm text-muted-foreground">
        Belum ada peserta terdaftar. Tambahkan peserta baru atau undang tim
        untuk mengikuti event.
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Mobile cards */}
      <div className="space-y-3 px-3 py-3 sm:hidden">
        {items.map((peserta, idx) => (
          <div
            key={peserta.id}
            className="flex flex-col gap-2 rounded-xl border border-border bg-card p-3 text-sm shadow-sm transition-all hover:-translate-y-[1px] hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <p className="text-base font-semibold text-foreground">
                  {peserta.namaTim}
                </p>
                <span className="text-xs text-muted-foreground">
                  {peserta.event?.namaEvent || "Event tidak diketahui"}
                </span>
                {peserta.eventCategory?.name && (
                  <span className="text-[11px] text-muted-foreground">
                    Kategori: {peserta.eventCategory.name}
                  </span>
                )}
                {peserta.noPeserta && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                    <IdCard className="h-3 w-3" />
                    {peserta.noPeserta}
                  </span>
                )}
              </div>
              <div className="text-right space-y-1">
                <span className="text-[11px] font-semibold text-muted-foreground/60">
                  No. {startIndex + idx}
                </span>
                {renderStatus(peserta.status)}
                {peserta.detailPeserta?.length ? (
                  <Badge variant="emerald">
                    {peserta.detailPeserta.length} anggota
                  </Badge>
                ) : (
                  <Badge>Belum isi anggota</Badge>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-1 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <UserCircle2 className="h-3.5 w-3.5" />
                <span>
                  {peserta.namaPerwakilan || "-"}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>{formatDate(peserta.tanggalPendaftaran)}</span>
              </div>
            </div>
            {peserta.partisipasi?.linkDrive ? (
              <a
                href={peserta.partisipasi.linkDrive}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                <ExternalLink className="h-3 w-3" />
                Buka link drive
              </a>
            ) : (
              <p className="text-[11px] text-muted-foreground/60">Belum ada link drive</p>
            )}
            {canEdit && (
              <div className="flex flex-col gap-3 pt-2">
                {onChangeStatus && (
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/60">
                      Konfirmasi pembayaran
                    </p>
                    <div className="mt-1">
                      {renderStatusActions(peserta, canEdit, onChangeStatus)}
                    </div>
                  </div>
                )}
                <div className="flex justify-end gap-2">
                  <Button
                    size="icon"
                    variant="dark"
                    className="h-7 w-7 rounded-full"
                    aria-label={`Edit peserta ${peserta.namaTim}`}
                    onClick={() => onEdit?.(peserta)}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="icon"
                        variant="dark"
                        className="h-7 w-7 rounded-full"
                        aria-label={`Hapus peserta ${peserta.namaTim}`}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-xl border border-border bg-card">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Hapus peserta?</AlertDialogTitle>
                          <AlertDialogDescription className="text-sm text-muted-foreground">
                          Tim <b>{peserta.namaTim}</b> akan dihapus beserta
                          partisipasi terkait.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          onClick={() => onDelete?.(peserta)}
                        >
                          Ya, hapus
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block">
        <div className="w-full overflow-x-auto py-1">
          <Table className="w-full whitespace-nowrap">
            <TableHeader>
              <TableRow className="border-b bg-muted/50 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <TableHead className="w-[6%] px-4 py-3 text-center">No</TableHead>
                <TableHead className="w-[24%] px-4 py-3">Tim</TableHead>
                <TableHead className="w-[20%] px-4 py-3">Event / Kategori</TableHead>
                <TableHead className="w-[16%] px-4 py-3">Perwakilan</TableHead>
                <TableHead className="w-[14%] px-4 py-3 text-center">
                  Status
                </TableHead>
                  <TableHead className="w-[14%] px-4 py-3 text-center">
                    Anggota
                  </TableHead>
                <TableHead className="w-[10%] px-4 py-3 text-center">
                  Link Drive
                </TableHead>
                <TableHead className="w-[10%] px-4 py-3 text-center">
                  Daftar
                </TableHead>
                {canEdit && (
                  <>
                    <TableHead className="w-[12%] px-4 py-3 text-center">
                      Konfirmasi
                    </TableHead>
                    <TableHead className="w-[8%] px-4 py-3 text-center">
                      Aksi
                    </TableHead>
                  </>
                )}
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border">
              {items.map((peserta, idx) => (
                <TableRow
                  key={peserta.id}
                  className="text-sm text-foreground transition-colors hover:bg-muted/50"
                >
                  <TableCell className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground">
                    {startIndex + idx}
                  </TableCell>
                  <TableCell className="px-4 py-3 align-top">
                    <p className="font-semibold text-foreground">
                      {peserta.namaTim}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {peserta.noPeserta ? `No. ${peserta.noPeserta}` : "-"}
                    </p>
                  </TableCell>
                  <TableCell className="px-4 py-3 align-top text-xs text-muted-foreground">
                    <p className="font-medium text-sm text-foreground">
                      {peserta.event?.namaEvent || "Event tidak diketahui"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {peserta.eventCategory?.name || "Tanpa kategori"}
                    </p>
                  </TableCell>
                  <TableCell className="px-4 py-3 align-top text-xs text-muted-foreground">
                    <p className="font-medium text-foreground">
                      {peserta.namaPerwakilan || "-"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {peserta.user?.username || "-"}
                    </p>
                  </TableCell>
                  <TableCell className="px-4 py-3 align-top text-center text-xs text-muted-foreground">
                    <div className="flex flex-col items-center gap-1">
                      {renderStatus(peserta.status)}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 align-top text-center text-xs text-muted-foreground">
                    {peserta.detailPeserta?.length ? (
                      <Badge variant="emerald">
                        {peserta.detailPeserta.length} anggota
                      </Badge>
                    ) : (
                      <Badge>Belum isi</Badge>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3 align-top text-center text-xs text-muted-foreground">
                    {peserta.partisipasi?.linkDrive ? (
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="h-8 rounded-full text-xs"
                      >
                        <a
                          href={peserta.partisipasi.linkDrive}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="mr-1 inline-block h-3.5 w-3.5" />
                          Buka
                        </a>
                      </Button>
                    ) : (
                      <span className="text-[11px] text-muted-foreground">
                        Belum ada link
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3 align-top text-center text-xs text-muted-foreground">
                    {formatDate(peserta.tanggalPendaftaran)}
                  </TableCell>
                  {canEdit && (
                    <TableCell className="px-4 py-3 align-top text-center">
                      <div className="flex justify-center">
                        {renderStatusActions(peserta, canEdit, onChangeStatus)}
                      </div>
                    </TableCell>
                  )}
                  {canEdit && (
                    <TableCell className="px-4 py-3 align-top text-center">
                      <div className="flex justify-center gap-2">
                        <Button
                          size="icon"
                          variant="dark"
                          className="h-8 w-8 rounded-full"
                          aria-label={`Edit peserta ${peserta.namaTim}`}
                          onClick={() => onEdit?.(peserta)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="icon"
                              variant="dark"
                              className="h-8 w-8 rounded-full"
                              aria-label={`Hapus peserta ${peserta.namaTim}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="rounded-xl border border-border bg-card">
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Hapus peserta?
                              </AlertDialogTitle>
                              <AlertDialogDescription className="text-sm text-muted-foreground">
                                Aksi ini akan menghapus data peserta dari
                                event.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={() => onDelete?.(peserta)}
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
            className="rounded-xl border border-border bg-muted p-3"
          >
            <div className="h-4 w-2/3 rounded bg-muted" />
            <div className="mt-2 h-3 w-1/3 rounded bg-muted" />
            <div className="mt-2 h-3 w-1/2 rounded bg-muted" />
          </div>
        ))}
      </div>

      <div className="hidden w-full overflow-x-auto sm:block">
        <table className="w-full">
          <tbody className="divide-y divide-border">
            {rows.map((_, idx) => (
              <tr key={`desktop-skeleton-${idx}`} className="animate-pulse">
                {Array.from({ length: 9 }).map((__, colIdx) => (
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

function renderStatus(status) {
  const normalized = (status || "pending").toLowerCase();
  const badgeClasses = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
    rejected: "bg-rose-50 text-rose-700 border-rose-200",
    unregistered: "bg-muted text-muted-foreground border-border",
  };
  const labelMap = {
    pending: "Menunggu",
    approved: "Disetujui",
    rejected: "Ditolak",
    unregistered: "Tidak terdaftar",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
        badgeClasses[normalized] || badgeClasses.pending
      }`}
    >
      {labelMap[normalized] || status}
    </span>
  );
}

function renderStatusActions(item, canEdit, onChangeStatus) {
  if (!canEdit || !onChangeStatus) return null;
  const status = (item.status || "pending").toLowerCase();
  const isApproved = status === "approved";
  const nextStatus = isApproved ? "pending" : "approved";
  const label = isApproved ? "Batalkan Konfirmasi" : "Konfirmasi";
  const description = isApproved
    ? `Batalkan konfirmasi pembayaran untuk ${item.namaTim || "peserta"}?`
    : `Konfirmasi pembayaran untuk ${item.namaTim || "peserta"}?`;

  const baseClasses =
    "h-7 rounded-full border text-[12px] font-semibold transition-colors";
  const pendingClasses = "border-emerald-500 text-emerald-600 bg-card hover:bg-emerald-50";
  const approvedClasses = "border-rose-500 text-rose-600 bg-card hover:bg-rose-50";

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          size="sm"
          className={`${baseClasses} ${
            isApproved ? approvedClasses : pendingClasses
          }`}
        >
          {label}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="rounded-xl border border-border bg-card">
        <AlertDialogHeader>
          <AlertDialogTitle>Anda yakin?</AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-muted-foreground">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction
            className={`text-white ${isApproved ? "bg-rose-600 hover:bg-rose-700" : "bg-emerald-600 hover:bg-emerald-700"}`}
            onClick={() => onChangeStatus(item, nextStatus)}
          >
            Ya, {label.toLowerCase()}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
