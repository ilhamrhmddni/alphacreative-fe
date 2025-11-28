"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import { del, get, patch, post, put } from "@/lib/api";
import { useToast } from "@/components/ui/toast-provider";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { UsersTable } from "@/components/tables/user-table";
import UserFormDialog from "@/components/form/user-form-dialog";

const ROLE_FILTERS = [
  { value: "all", label: "Semua role" },
  { value: "admin", label: "Admin" },
  { value: "operator", label: "Operator" },
  { value: "juri", label: "Juri" },
  { value: "peserta", label: "Peserta" },
];

const STATUS_FILTERS = [
  { value: "all", label: "Semua status" },
  { value: "active", label: "Aktif" },
  { value: "inactive", label: "Nonaktif" },
];

export default function UsersPage() {
  const router = useRouter();
  const { user, initializing } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();

  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filterText, setFilterText] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    if (!initializing && !user) {
      router.push("/auth/login");
    }
  }, [initializing, user, router]);

  const fetchUsers = useCallback(async () => {
    if (!user || initializing) return;
    try {
      setLoading(true);
      setError("");
      const data = await get("/users");
      setUsers(data);
    } catch (err) {
      console.error(err);
      setError(err.message || "Gagal memuat users");
    } finally {
      setLoading(false);
    }
  }, [user, initializing]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);


  useEffect(() => {
    let data = [...users];

    if (filterText.trim()) {
      const text = filterText.toLowerCase();
      data = data.filter(
        (u) =>
          (u.email || "").toLowerCase().includes(text) ||
          (u.username || "").toLowerCase().includes(text)
      );
    }

    if (roleFilter !== "all") {
      data = data.filter((u) => u.role === roleFilter);
    }

    if (statusFilter !== "all") {
      data = data.filter((u) =>
        statusFilter === "active" ? u.isActive : !u.isActive
      );
    }

    setFiltered(data);
  }, [users, filterText, roleFilter, statusFilter]);

  async function handleDelete(target) {
    if (!operatorCanManage(target)) {
      toastError({
        title: "Akses dibatasi",
        description: operatorLimitMessage,
      });
      return;
    }
    try {
      await del(`/users/${target.id}`);
      setUsers((prev) => prev.filter((u) => u.id !== target.id));
      toastSuccess({
        title: "User dihapus",
        description: target.username || target.email || "User berhasil dihapus",
      });
    } catch (err) {
      toastError({
        title: "Gagal menghapus user",
        description: err.message,
      });
    }
  }

  const isOperator = user?.role === "operator";
  const canManage = user?.role === "admin" || isOperator;
  const operatorLimitMessage = "Operator hanya boleh mengelola user juri.";

  function operatorCanManage(target) {
    if (!isOperator) return true;
    return target?.role === "juri";
  }

  function handleAdd() {
    setEditingUser(null);
    setDialogOpen(true);
  }

  function handleEdit(target) {
    if (!operatorCanManage(target)) {
      toastError({
        title: "Akses dibatasi",
        description: operatorLimitMessage,
      });
      return;
    }
    setEditingUser(target);
    setDialogOpen(true);
  }

  async function handleToggleStatus(target) {
    if (!operatorCanManage(target)) {
      toastError({
        title: "Akses dibatasi",
        description: operatorLimitMessage,
      });
      return;
    }
    try {
      const endpoint = target.isActive
        ? `/users/${target.id}/deactivate`
        : `/users/${target.id}/activate`;
      const response = await patch(endpoint);
      const updated = response.user || response;
      setUsers((prev) =>
        prev.map((u) => (u.id === updated.id ? { ...u, isActive: updated.isActive } : u))
      );
      toastSuccess({
        title: updated.isActive ? "User diaktifkan" : "User dinonaktifkan",
        description: updated.username || updated.email || "Status user diperbarui",
      });
    } catch (err) {
      toastError({
        title: "Gagal mengubah status user",
        description: err.message,
      });
    }
  }

  async function handleSubmitForm(formData) {
    try {
      if (!editingUser && isOperator && formData.role !== "juri") {
        toastError({
          title: "Akses dibatasi",
          description: operatorLimitMessage,
        });
        return;
      }
      if (editingUser) {
        const updated = await put(`/users/${editingUser.id}`, formData);
        setUsers((prev) =>
          prev.map((u) => (u.id === updated.id ? updated : u))
        );
        toastSuccess({
          title: "User diperbarui",
          description: updated.username || updated.email || "Data user disimpan",
        });
      } else {
        const created = await post("/users", formData);
        setUsers((prev) => [created, ...prev]);
        toastSuccess({
          title: "User ditambahkan",
          description: created.username || created.email || "Akun baru berhasil dibuat",
        });
      }

      setEditingUser(null);
      setDialogOpen(false);
    } catch (err) {
      toastError({
        title: "Gagal menyimpan user",
        description: err.message,
      });
    }
  }

  async function handleResetPassword(target) {
    if (!operatorCanManage(target)) {
      toastError({
        title: "Akses dibatasi",
        description: operatorLimitMessage,
      });
      return;
    }
    if (!target) return;
    try {
      await patch(`/users/${target.id}/reset-password`, {
        password: "12345678",
      });
      toastSuccess({
        title: "Password direset",
        description: `${target.username || target.email || "User"} sekarang menggunakan password default.`,
      });
    } catch (err) {
      toastError({
        title: "Gagal mereset password",
        description: err.message,
      });
    }
  }

  const roleOptions = useMemo(
    () => ROLE_FILTERS.filter((option) => option.value === "all" || users.some((u) => u.role === option.value)),
    [users]
  );

  if (initializing || !user) {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-slate-500">
        Memeriksa sesi...
      </div>
    );
  }

  const roleSelectionOptions = isOperator
    ? [{ value: "juri", label: "Juri" }]
    : undefined;
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.isActive).length;
  const adminOps = users.filter(
    (u) => u.role === "admin" || u.role === "operator"
  ).length;

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-3 py-4 sm:px-4 lg:px-2">
        <Card className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <CardHeader className="border-b border-slate-100 px-4 py-4 sm:px-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle className="text-base font-semibold text-slate-900 sm:text-lg">
                  Manajemen User
                </CardTitle>
                <CardDescription className="mt-1 text-xs text-slate-500 sm:text-sm">
                  {totalUsers > 0
                    ? `${totalUsers} akun terdaftar`
                    : "Belum ada user. Tambahkan admin, operator, juri, atau peserta."}
                </CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <StatPill label="Total" value={totalUsers} />
                <StatPill label="Aktif" value={activeUsers} color="emerald" />
                <StatPill label="Admin/Op" value={adminOps} color="amber" />
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 px-4 py-4 sm:px-6 sm:py-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="flex w-full flex-col gap-3">
                <div className="w-full">
                  <Input
                    placeholder="Cari email atau username..."
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    className="h-9 w-full rounded-md border-slate-200 text-xs placeholder:text-slate-400 sm:text-sm"
                  />
                </div>
                <div className="flex w-full flex-wrap gap-2">
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="h-9 w-full rounded-md border-slate-200 text-xs sm:w-[150px] sm:text-sm">
                      <SelectValue placeholder="Semua role" />
                    </SelectTrigger>
                    <SelectContent className="rounded-md border border-slate-200 bg-white shadow-md">
                      {roleOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="h-9 w-full rounded-md border-slate-200 text-xs sm:w-[150px] sm:text-sm">
                      <SelectValue placeholder="Semua status" />
                    </SelectTrigger>
                    <SelectContent className="rounded-md border border-slate-200 bg-white shadow-md">
                      {STATUS_FILTERS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {(filterText || roleFilter !== "all" || statusFilter !== "all") && (
                    <Button
                      type="button"
                      variant="outline"
                      className="h-9 rounded-md text-xs"
                      onClick={() => {
                        setFilterText("");
                        setRoleFilter("all");
                        setStatusFilter("all");
                      }}
                    >
                      Reset
                    </Button>
                  )}
                </div>
              </div>

              {canManage && (
                <Button
                  size="sm"
                  onClick={handleAdd}
                  className="mt-1 h-9 rounded-md md:mt-0"
                >
                  <UserPlus className=" h-4 w-4" />
                  Tambah User
                </Button>
              )}
            </div>

            {error && (
              <p className="text-[11px] text-red-500">{error}</p>
            )}

            {filtered.length !== totalUsers && (
              <p className="text-[11px] text-slate-500">
                Menampilkan{" "}
                <span className="font-medium">{filtered.length}</span> dari{" "}
                <span className="font-medium">{totalUsers}</span> user.
              </p>
            )}

            <UsersTable
              users={filtered}
              loading={loading}
              canEdit={canManage}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleStatus={handleToggleStatus}
              canManageUser={operatorCanManage}
            />
          </CardContent>
        </Card>
      </main>

      <UserFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialData={editingUser}
        onSubmit={handleSubmitForm}
        onResetPassword={handleResetPassword}
        roleOptions={roleSelectionOptions}
      />
    </div>
  );
}

function StatPill({ label, value, color }) {
  let base =
    "inline-flex flex-col justify-center rounded-md border px-2.5 py-1 min-w-[60px]";
  let tone = "bg-slate-50 text-slate-800 border-slate-200";

  if (color === "emerald") {
    tone = "bg-emerald-50 text-emerald-800 border-emerald-200";
  } else if (color === "amber") {
    tone = "bg-amber-50 text-amber-800 border-amber-200";
  }

  return (
    <div className={`${base} ${tone}`}>
      <span className="text-[10px] uppercase tracking-wide opacity-75">
        {label}
      </span>
      <span className="text-sm font-semibold leading-tight">{value}</span>
    </div>
  );
}
