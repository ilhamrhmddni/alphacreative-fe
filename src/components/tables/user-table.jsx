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
import {
  BadgeCheck,
  Mail,
  Pencil,
  Trash2,
  UserCheck,
  UserX,
} from "lucide-react";

function roleLabel(role) {
  if (!role) return "-";
  return role.charAt(0).toUpperCase() + role.slice(1);
}

function statusClasses(isActive) {
  return isActive
    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
    : "bg-slate-100 text-slate-600 border border-slate-200";
}

export function UsersTable({
  users,
  loading,
  canEdit,
  onEdit,
  onDelete,
  onToggleStatus,
  canManageUser,
  startIndex = 1,
}) {
  const hasData = users && users.length > 0;

  if (loading) {
    return (
      <div className="px-3 py-4 sm:px-4">
        <TableSkeleton />
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="px-4 py-8 text-center text-sm text-slate-500">
        Belum ada user terdaftar.
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="space-y-3 px-3 py-3 sm:hidden sm:px-4">
        {users.map((rowUser, idx) => {
          const rowCanManage = !canManageUser || canManageUser(rowUser);
          return (
            <div
              key={rowUser.id}
              className="rounded-xl border border-slate-200 bg-white p-3 text-sm shadow-sm transition-all hover:-translate-y-[1px] hover:shadow-md"
            >
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <p className="font-semibold text-base text-slate-900">
                  {rowUser.username}
                </p>
                <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                  <Mail className="h-3.5 w-3.5" />
                  {rowUser.email}
                </span>
                <p className="text-[11px] uppercase tracking-wide text-slate-400">
                  {rowUser.role}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1 text-right">
                <span className="text-[11px] font-semibold text-slate-400">
                  No. {startIndex + idx}
                </span>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] ${statusClasses(
                    rowUser.isActive
                  )}`}
                >
                  <BadgeCheck className="h-3 w-3" />
                  {rowUser.isActive ? "Aktif" : "Nonaktif"}
                </span>
              </div>
            </div>
            {canEdit && rowCanManage && (
              <div className="mt-3 flex flex-wrap justify-end gap-2">
                <Button
                  size="icon"
                  variant="dark"
                  className="h-7 w-7 rounded-full"
                  aria-label={`Edit user ${rowUser.username}`}
                  onClick={() => onEdit?.(rowUser)}
                >
                  <Pencil className="h-3 w-3" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  className="h-7 w-7 rounded-full"
                  aria-label={rowUser.isActive ? "Nonaktifkan user" : "Aktifkan user"}
                  onClick={() => onToggleStatus?.(rowUser)}
                >
                  {rowUser.isActive ? (
                    <UserX className="h-3.5 w-3.5" />
                  ) : (
                    <UserCheck className="h-3.5 w-3.5" />
                  )}
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="icon"
                      variant="dark"
                      className="h-7 w-7 rounded-full"
                      aria-label={`Hapus user ${rowUser.username}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="rounded-xl border border-slate-200 bg-white">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Hapus user?</AlertDialogTitle>
                      <AlertDialogDescription className="text-sm text-slate-600">
                        User <b>{rowUser.username}</b> akan dihapus permanen dan tidak
                        bisa login lagi.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Batal</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={() => onDelete?.(rowUser)}
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
        <div className="w-full overflow-x-auto py-1">
          <Table className="w-full">
            <TableHeader>
              <TableRow className="border-b bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <TableHead className="w-[6%] px-4 py-3 text-center">No</TableHead>
                <TableHead className="w-[30%] px-4 py-3">User</TableHead>
                <TableHead className="w-[24%] px-4 py-3">Email</TableHead>
                <TableHead className="w-[16%] px-4 py-3">Role</TableHead>
                <TableHead className="w-[15%] px-4 py-3 text-center">
                  Status
                </TableHead>
                {canEdit && (
                  <TableHead className="w-[15%] px-4 py-3 text-center">
                    Aksi
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100 bg-white">
              {users.map((rowUser, idx) => {
                const rowCanManage = !canManageUser || canManageUser(rowUser);
                return (
                  <TableRow
                    key={rowUser.id}
                    className="text-sm text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    <TableCell className="px-4 py-3 text-center text-xs font-semibold text-slate-500">
                      {startIndex + idx}
                    </TableCell>
                    <TableCell className="px-4 py-3 align-top">
                      <p className="font-medium text-slate-900">{rowUser.username}</p>
                    </TableCell>
                    <TableCell className="px-4 py-3 align-top text-sm">
                      {rowUser.email}
                    </TableCell>
                    <TableCell className="px-4 py-3 align-top">
                      <span className="text-xs uppercase tracking-wide text-slate-500">
                        {roleLabel(rowUser.role)}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center justify-center gap-1 rounded-full px-2 py-0.5 text-[11px] ${statusClasses(
                          rowUser.isActive
                        )}`}
                      >
                        <BadgeCheck className="h-3 w-3" />
                        {rowUser.isActive ? "Aktif" : "Nonaktif"}
                      </span>
                    </TableCell>
                    {canEdit && rowCanManage && (
                      <TableCell className="px-4 py-3 text-center">
                        <div className="flex justify-center gap-2">
                          <Button
                            size="icon"
                            variant="dark"
                            className="h-8 w-8 rounded-full"
                            aria-label={`Edit user ${rowUser.username}`}
                            onClick={() => onEdit?.(rowUser)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8 rounded-full"
                            aria-label={rowUser.isActive ? "Nonaktifkan user" : "Aktifkan user"}
                            onClick={() => onToggleStatus?.(rowUser)}
                          >
                            {rowUser.isActive ? (
                              <UserX className="h-4 w-4" />
                            ) : (
                              <UserCheck className="h-4 w-4" />
                            )}
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="icon"
                                variant="dark"
                                className="h-8 w-8 rounded-full"
                                aria-label={`Hapus user ${rowUser.username}`}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="rounded-xl border border-slate-200 bg-white">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Hapus user?</AlertDialogTitle>
                                <AlertDialogDescription className="text-sm text-slate-600">
                                  User <b>{rowUser.username}</b> akan dihapus dan tidak
                                  bisa login lagi.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  onClick={() => onDelete?.(rowUser)}
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
      <div className="space-y-3 sm:hidden">
        {rows.map((_, idx) => (
          <div
            key={`users-mobile-skeleton-${idx}`}
            className="space-y-2 rounded-xl border border-slate-100 bg-slate-50 p-3"
          >
            <div className="h-4 w-2/3 rounded bg-slate-200" />
            <div className="h-3 w-1/2 rounded bg-slate-200" />
            <div className="h-3 w-3/4 rounded bg-slate-200" />
          </div>
        ))}
      </div>
      <div className="hidden w-full overflow-x-auto sm:block">
        <table className="w-full">
          <tbody className="divide-y divide-slate-100">
            {rows.map((_, idx) => (
              <tr key={`users-desktop-skeleton-${idx}`} className="animate-pulse">
                {Array.from({ length: 6 }).map((__, colIdx) => (
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
