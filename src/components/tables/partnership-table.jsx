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
import { Eye, EyeOff, Pencil, Trash2 } from "lucide-react";

export function PartnershipTable({ items = [], loading, canEdit, onEdit, onDelete }) {
  if (loading) {
    return <PartnershipTableSkeleton />;
  }

  if (!items.length) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted px-4 py-6 text-center text-sm text-muted-foreground">
        Belum ada data. Tambahkan kolaborasi untuk melengkapi landing page.
      </div>
    );
  }

  return (
    <div className="w-full max-w-full overflow-x-auto">
      <Table className="w-full whitespace-nowrap">
        <TableHeader>
          <TableRow className="border-b bg-muted/50 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <TableHead className="w-[18%] px-4 py-3">Logo</TableHead>
            <TableHead className="w-[22%] px-4 py-3">Nama</TableHead>
            <TableHead className="w-[20%] px-4 py-3">Peran</TableHead>
            <TableHead className="w-[26%] px-4 py-3">Deskripsi</TableHead>
            <TableHead className="w-[8%] px-4 py-3 text-center">Status</TableHead>
            <TableHead className="w-[12%] px-4 py-3">Diperbarui</TableHead>
            {canEdit && <TableHead className="w-[14%] px-4 py-3 text-center">Aksi</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-border">
          {items.map((item) => {
            const logoUrl = resolveMediaUrl(item.logoPath || item.logo) || item.logoPath || item.logo;
            return (
              <TableRow key={item.id} className="text-sm text-foreground">
                <TableCell className="px-4 py-3 align-middle">
                  {logoUrl ? (
                    <div className="relative h-14 w-24 overflow-hidden rounded-lg border border-border bg-card">
                      <Image src={logoUrl} alt={item.name} fill className="object-contain p-3" unoptimized />
                    </div>
                  ) : (
                    <span className="inline-flex items-center justify-center rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground">
                      Tanpa Logo
                    </span>
                  )}
                </TableCell>
                <TableCell className="px-4 py-3 align-top text-sm font-medium text-foreground">
                  {item.name}
                </TableCell>
                <TableCell className="px-4 py-3 align-top text-xs text-muted-foreground">
                  {item.role || <span className="text-muted-foreground/60">-</span>}
                </TableCell>
                <TableCell className="px-4 py-3 align-top text-xs text-muted-foreground">
                  {item.description ? (
                    <p className="line-clamp-3">{item.description}</p>
                  ) : (
                    <span className="text-muted-foreground/60">-</span>
                  )}
                </TableCell>
                <TableCell className="px-4 py-3 text-center align-middle text-xs">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold uppercase tracking-wide ${
                      item.isPublished
                        ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
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
                        aria-label={`Edit ${item.name}`}
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
                            aria-label={`Hapus ${item.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rounded-xl border border-border bg-card">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Hapus partner?</AlertDialogTitle>
                            <AlertDialogDescription className="text-sm text-muted-foreground">
                              Data &ldquo;{item.name}&rdquo; akan dihapus dari daftar.
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
  );
}

function PartnershipTableSkeleton() {
  const rows = Array.from({ length: 4 });
  const cols = 7;
  return (
    <div className="w-full max-w-full overflow-x-auto">
      <table className="w-full">
        <tbody className="divide-y divide-border">
          {rows.map((_, idx) => (
            <tr key={`partnership-skeleton-${idx}`} className="animate-pulse">
              {Array.from({ length: cols }).map((__, colIdx) => (
                <td key={colIdx} className="px-4 py-3">
                  <div className="h-4 rounded bg-muted" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
