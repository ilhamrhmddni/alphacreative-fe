"use client";

import Image from "next/image";
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
import { formatCurrency } from "@/lib/formatters";
import { resolveMediaUrl } from "@/lib/utils";
import { Pencil, Trash2, Eye, EyeOff, PackageOpen } from "lucide-react";

function displayPrice(value) {
  if (value === null || value === undefined) return "Belum ditentukan";
  if (!Number.isFinite(Number(value))) return "Belum ditentukan";
  return formatCurrency(Number(value));
}

function displayStock(value) {
  if (value === null || value === undefined) return "-";
  if (!Number.isFinite(Number(value))) return "-";
  return Number(value);
}

export function MerchandiseTable({
  items,
  loading,
  canEdit,
  onEdit,
  onDelete,
  onTogglePublish,
  onSelect,
}) {
  if (loading) {
    return <TableSkeleton />;
  }

  if (!items || items.length === 0) {
    return (
      <div className="px-4 py-10 text-center text-sm text-muted-foreground">
        Belum ada merchandise. Tambahkan produk baru untuk katalog.
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="space-y-3 px-3 py-3 sm:hidden">
        {items.map((item) => {
          const photo = item.photoPath ? resolveMediaUrl(item.photoPath) || item.photoPath : null;
          const stock = displayStock(item.stock);
          return (
            <div
              key={item.id}
              onClick={() => onSelect?.(item)}
              className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3 text-sm shadow-sm transition hover:-translate-y-[1px] hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-base text-foreground">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{displayPrice(item.price)}</p>
                </div>
                <span className="text-[11px] font-semibold text-muted-foreground">#{item.order ?? 0}</span>
              </div>

              {photo ? (
                <div className="relative h-32 w-full overflow-hidden rounded-lg border border-border">
                  <Image src={photo} alt={item.name} fill className="object-cover" unoptimized />
                </div>
              ) : null}

              <p className="text-xs text-muted-foreground line-clamp-4">{item.description || "Belum ada deskripsi."}</p>

              <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5">
                  <PackageOpen className="h-3.5 w-3.5" /> Stok: {stock}
                </span>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 ${
                    item.isPublished
                      ? "border-green-200 bg-green-50 text-green-700"
                      : "border-border bg-muted text-muted-foreground"
                  }`}
                >
                  {item.isPublished ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                  {item.isPublished ? "Tampil" : "Tersembunyi"}
                </span>
              </div>

              {canEdit && (
                <div className="flex justify-end gap-2">
                  <Button
                    size="icon"
                    variant="dark"
                    className="h-8 w-8 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit?.(item);
                    }}
                    aria-label={`Edit ${item.name}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-8 w-8 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      onTogglePublish?.(item);
                    }}
                    aria-label={item.isPublished ? `Sembunyikan ${item.name}` : `Tampilkan ${item.name}`}
                  >
                    {item.isPublished ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="icon"
                        variant="dark"
                        className="h-8 w-8 rounded-full"
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`Hapus ${item.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-xl border border-border bg-card">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Hapus merchandise?</AlertDialogTitle>
                        <AlertDialogDescription className="text-sm text-muted-foreground">
                          Produk <b>{item.name}</b> akan dihapus permanen dari katalog.
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
          );
        })}
      </div>

      <div className="hidden sm:block">
        <div className="w-full overflow-x-auto">
          <Table className="w-full whitespace-nowrap">
            <TableHeader>
              <TableRow className="border-b bg-muted text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <TableHead className="w-[6%] px-4 py-3 text-center">No</TableHead>
                <TableHead className="w-[28%] px-4 py-3">Produk</TableHead>
                <TableHead className="w-[16%] px-4 py-3">Harga</TableHead>
                <TableHead className="w-[12%] px-4 py-3 text-center">Stok</TableHead>
                <TableHead className="w-[12%] px-4 py-3 text-center">Status</TableHead>
                <TableHead className="w-[10%] px-4 py-3 text-center">Urutan</TableHead>
                <TableHead className="w-[16%] px-4 py-3 text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border">
              {items.map((item, index) => {
                const photo = item.photoPath ? resolveMediaUrl(item.photoPath) || item.photoPath : null;
                return (
                  <TableRow
                    key={item.id}
                    className="cursor-pointer text-sm text-foreground transition-colors hover:bg-muted"
                    onClick={() => onSelect?.(item)}
                  >
                    <TableCell className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground">
                      {index + 1}
                    </TableCell>
                    <TableCell className="px-4 py-3 align-top">
                      <div className="flex items-start gap-3">
                        {photo ? (
                          <div className="relative h-12 w-12 overflow-hidden rounded-md border border-border">
                            <Image src={photo} alt={item.name} fill className="object-cover" unoptimized />
                          </div>
                        ) : null}
                        <div className="space-y-1">
                          <p className="font-medium text-foreground">{item.name}</p>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {item.description || "Belum ada deskripsi."}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 align-top text-sm">{displayPrice(item.price)}</TableCell>
                    <TableCell className="px-4 py-3 text-center align-top text-sm">
                      {displayStock(item.stock)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-center align-top">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
                          item.isPublished
                            ? "border border-green-200 bg-green-50 text-green-700"
                            : "border border-border bg-muted text-muted-foreground"
                        }`}
                      >
                        {item.isPublished ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        {item.isPublished ? "Tampil" : "Tersembunyi"}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-center align-top text-sm">
                      {item.order ?? 0}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-center align-top">
                      {canEdit ? (
                        <div className="flex justify-center gap-2">
                          <Button
                            size="icon"
                            variant="dark"
                            className="h-8 w-8 rounded-full"
                            aria-label={`Edit ${item.name}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              onEdit?.(item);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8 rounded-full"
                            aria-label={item.isPublished ? `Sembunyikan ${item.name}` : `Tampilkan ${item.name}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              onTogglePublish?.(item);
                            }}
                          >
                            {item.isPublished ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="icon"
                                variant="dark"
                                className="h-8 w-8 rounded-full"
                                onClick={(e) => e.stopPropagation()}
                                aria-label={`Hapus ${item.name}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="rounded-xl border border-border bg-card">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Hapus merchandise?</AlertDialogTitle>
                                <AlertDialogDescription className="text-sm text-muted-foreground">
                                  Produk <b>{item.name}</b> akan dihapus dari katalog.
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
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>
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
            key={`merch-mobile-skeleton-${idx}`}
            className="space-y-2 rounded-xl border border-border bg-muted p-3"
          >
            <div className="h-4 w-2/3 rounded bg-muted" />
            <div className="h-3 w-1/2 rounded bg-muted" />
            <div className="h-24 rounded bg-muted" />
          </div>
        ))}
      </div>
      <div className="hidden w-full max-w-full overflow-x-auto sm:block">
        <table className="w-full">
          <tbody className="divide-y divide-border">
            {rows.map((_, idx) => (
              <tr key={`merch-desktop-skeleton-${idx}`} className="animate-pulse">
                {Array.from({ length: 7 }).map((__, colIdx) => (
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
