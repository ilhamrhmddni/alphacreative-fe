"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import { get, post, put, del } from "@/lib/api";
import { useToast } from "@/components/ui/toast-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GalleryTable } from "@/components/tables/gallery-table";
import GalleryFormDialog from "@/components/form/gallery-form-dialog";

function sortGalleryItems(items) {
  if (!Array.isArray(items)) return [];
  return [...items].sort((a, b) => {
    const orderDiff = (a.order || 0) - (b.order || 0);
    if (orderDiff !== 0) return orderDiff;
    return (b.createdAt ? new Date(b.createdAt).getTime() : 0) - (a.createdAt ? new Date(a.createdAt).getTime() : 0);
  });
}

export default function GalleryPage() {
  const router = useRouter();
  const { user, initializing } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterText, setFilterText] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    if (!initializing && !user) {
      router.push("/auth/login");
    }
  }, [initializing, user, router]);

  const fetchGallery = useCallback(async () => {
    if (!user || initializing) return;
    try {
      setLoading(true);
      setError("");
      const data = await get("/gallery");
      setItems(sortGalleryItems(data));
    } catch (err) {
      console.error(err);
      setError(err.message || "Gagal memuat galeri");
    } finally {
      setLoading(false);
    }
  }, [user, initializing]);

  useEffect(() => {
    fetchGallery();
  }, [fetchGallery]);

  const filteredItems = useMemo(() => {
    if (!Array.isArray(items)) return [];
    if (!filterText.trim()) {
      return items;
    }
    const keyword = filterText.toLowerCase();
    return items.filter((item) => {
      const title = (item.title || "").toLowerCase();
      const caption = (item.caption || "").toLowerCase();
      return title.includes(keyword) || caption.includes(keyword);
    });
  }, [items, filterText]);

  const publishedCount = useMemo(
    () => (Array.isArray(items) ? items.filter((item) => item.isPublished).length : 0),
    [items]
  );

  function handleAdd() {
    setEditingItem(null);
    setDialogOpen(true);
  }

  function handleEdit(item) {
    setEditingItem(item);
    setDialogOpen(true);
  }

  async function handleDelete(item) {
    try {
      await del(`/gallery/${item.id}`);
      setItems((prev) => sortGalleryItems(prev.filter((entry) => entry.id !== item.id)));
      toastSuccess({
        title: "Item galeri dihapus",
        description: item.title,
      });
    } catch (err) {
      toastError({
        title: "Gagal menghapus galeri",
        description: err.message,
      });
    }
  }

  async function handleSubmit(formData) {
    try {
      if (editingItem) {
        const updated = await put(`/gallery/${editingItem.id}`, formData);
        setItems((prev) =>
          sortGalleryItems(
            prev.map((item) => (item.id === updated.id ? updated : item))
          )
        );
        toastSuccess({
          title: "Galeri diperbarui",
          description: updated.title,
        });
      } else {
        const created = await post("/gallery", formData);
        setItems((prev) => sortGalleryItems([created, ...(prev || [])]));
        toastSuccess({
          title: "Galeri ditambahkan",
          description: created.title,
        });
      }
      setDialogOpen(false);
      setEditingItem(null);
    } catch (err) {
      toastError({
        title: editingItem ? "Gagal memperbarui galeri" : "Gagal menambah galeri",
        description: err.message,
      });
    }
  }

  if (initializing || !user) {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-muted-foreground">
        Memeriksa sesi...
      </div>
    );
  }

  const canManage = user.role === "admin" || user.role === "operator";
  const totalItems = Array.isArray(items) ? items.length : 0;

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-3 py-4 sm:px-4 lg:px-2">
        <Card className="w-full overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <CardHeader className="border-b border-border px-4 py-4 sm:px-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle className="text-base font-semibold text-foreground sm:text-lg">
                  Galeri Landing Page
                </CardTitle>
                <CardDescription className="mt-1 text-xs text-muted-foreground sm:text-sm">
                  Kelola foto yang tampil pada landing page. Maksimal 10 foto akan ditampilkan.
                </CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <StatPill label="Total" value={totalItems} />
                <StatPill label="Publik" value={publishedCount} color="emerald" />
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-5 px-4 py-4 sm:px-6 sm:py-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="w-full md:max-w-xs">
                <Input
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  placeholder="Cari judul atau caption..."
                  className="h-9 rounded-md border-border bg-card text-xs placeholder:text-muted-foreground sm:text-sm"
                />
              </div>
              {canManage && (
                <Button size="sm" className="h-9 rounded-md" onClick={handleAdd}>
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah Foto
                </Button>
              )}
            </div>

            {error && <p className="text-[11px] text-red-500">{error}</p>}

            <GalleryTable
              items={filteredItems}
              loading={loading}
              canEdit={canManage}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </CardContent>
        </Card>
      </main>

      <GalleryFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialData={editingItem}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

function StatPill({ label, value, color }) {
  let tone = "bg-muted text-foreground border border-border";
  if (color === "emerald") {
    tone = "bg-emerald-50 text-emerald-700 border border-emerald-200";
  } else if (color === "amber") {
    tone = "bg-amber-50 text-amber-700 border border-amber-200";
  }

  return (
    <div className={`inline-flex min-w-[64px] flex-col items-center rounded-md px-2.5 py-1 text-xs ${tone}`}>
      <span className="uppercase tracking-wide opacity-70">{label}</span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}
