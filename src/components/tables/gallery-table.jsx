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
import { formatDate } from "@/lib/formatters";
import { resolveMediaUrl } from "@/lib/utils";
import { Camera, Eye, EyeOff, Pencil, Trash2 } from "lucide-react";

export function GalleryTable({ items = [], loading, canEdit, onEdit, onDelete }) {
  if (loading) {
    return <GalleryTableSkeleton />;
  }

  if (!items.length) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted px-4 py-6 text-center text-sm text-muted-foreground">
        Belum ada foto galeri. Tambahkan beberapa momen terbaik agar landing page lebih hidup.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3 sm:hidden">
        {items.map((item) => {
          const photoUrl = resolveMediaUrl(item.photoPath) || item.photoPath;
          return (
            <div
              key={item.id}
              className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-foreground">{item.title}</p>
                  {item.caption && (
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-3">{item.caption}</p>
                  )}
                </div>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                    item.isPublished
                      ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                      : "bg-muted text-muted-foreground border border-border"
                  }`}
                >
                  {item.isPublished ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                  {item.isPublished ? "Publik" : "Nonaktif"}
                </span>
              </div>

              {photoUrl ? (
                <div className="relative h-44 w-full overflow-hidden rounded-lg border border-border">
                  <Image src={photoUrl} alt={item.title} fill className="object-cover" unoptimized />
                </div>
              ) : (
                <div className="flex h-36 items-center justify-center rounded-lg border border-dashed border-border bg-muted text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Camera className="h-4 w-4" />
                    Tidak ada foto
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Urutan: {item.order ?? 0}</span>
                {item.updatedAt && <span>Diperbarui {formatDate(item.updatedAt)}</span>}
              </div>

              {canEdit && (
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="outline" onClick={() => onEdit?.(item)}>
                    <Pencil className="mr-1 h-4 w-4" /> Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="destructive">
                        <Trash2 className="mr-1 h-4 w-4" /> Hapus
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-xl border border-border bg-card">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Hapus foto galeri?</AlertDialogTitle>
                        <AlertDialogDescription className="text-sm text-muted-foreground">
                          Foto &ldquo;{item.title}&rdquo; akan dihapus dari daftar galeri.
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
        <div className="w-full max-w-full overflow-x-auto">
          <Table className="w-full whitespace-nowrap">
            <TableHeader>
              <TableRow className="border-b bg-muted text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <TableHead className="w-[8%] px-4 py-3 text-left">Urutan</TableHead>
                <TableHead className="w-[18%] px-4 py-3">Preview</TableHead>
                <TableHead className="w-[24%] px-4 py-3">Judul</TableHead>
                <TableHead className="w-[28%] px-4 py-3">Caption</TableHead>
                <TableHead className="w-[10%] px-4 py-3 text-center">Status</TableHead>
                <TableHead className="w-[12%] px-4 py-3">Diperbarui</TableHead>
                {canEdit && <TableHead className="w-[10%] px-4 py-3 text-center">Aksi</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border">
              {items.map((item) => {
                const photoUrl = resolveMediaUrl(item.photoPath) || item.photoPath;
                return (
                  <TableRow key={item.id} className="text-sm text-foreground">
                    <TableCell className="px-4 py-3 align-middle text-sm font-semibold text-muted-foreground">
                      {item.order ?? 0}
                    </TableCell>
                    <TableCell className="px-4 py-3 align-middle">
                      {photoUrl ? (
                        <div className="relative h-16 w-28 overflow-hidden rounded-lg border border-border">
                          <Image src={photoUrl} alt={item.title} fill className="object-cover" unoptimized />
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground">
                          <Camera className="h-3.5 w-3.5" /> Tidak ada
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="px-4 py-3 align-top text-sm font-medium text-foreground">
                      {item.title}
                    </TableCell>
                    <TableCell className="px-4 py-3 align-top text-xs text-muted-foreground">
                      {item.caption ? <p className="line-clamp-3">{item.caption}</p> : <span className="text-muted-foreground">-</span>}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-center align-middle text-xs">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold uppercase tracking-wide ${
                          item.isPublished
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                            : "bg-muted text-muted-foreground border border-border"
                        }`}
                      >
                        {item.isPublished ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                        {item.isPublished ? "Publik" : "Nonaktif"}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3 align-middle text-xs text-muted-foreground">
                      {item.updatedAt ? formatDate(item.updatedAt) : "-"}
                    </TableCell>
                    {canEdit && (
                      <TableCell className="px-4 py-3 text-center align-middle">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            size="icon"
                            variant="dark"
                            className="h-8 w-8 rounded-full"
                            aria-label={`Edit ${item.title}`}
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
                                aria-label={`Hapus ${item.title}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="rounded-xl border border-border bg-card">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Hapus foto galeri?</AlertDialogTitle>
                                <AlertDialogDescription className="text-sm text-muted-foreground">
                                  Foto &ldquo;{item.title}&rdquo; akan dihapus dari daftar galeri.
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
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

function GalleryTableSkeleton() {
  const rows = Array.from({ length: 4 });
  return (
    <div className="space-y-4">
      <div className="sm:hidden space-y-3">
        {rows.map((_, idx) => (
          <div key={`gallery-mobile-skeleton-${idx}`} className="space-y-3 rounded-xl border border-border bg-muted p-3">
            <div className="h-4 w-2/3 rounded bg-muted" />
            <div className="h-3 w-1/2 rounded bg-muted" />
            <div className="h-32 rounded bg-muted" />
          </div>
        ))}
      </div>
      <div className="hidden w-full max-w-full overflow-x-auto sm:block">
        <table className="w-full">
          <tbody className="divide-y divide-border">
            {rows.map((_, idx) => (
              <tr key={`gallery-desktop-skeleton-${idx}`} className="animate-pulse">
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
