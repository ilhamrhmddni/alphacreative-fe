"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

import PageContainer from "@/components/layout/page-container";
import PageHeader from "@/components/layout/page-header";
import { useAuth } from "@/components/auth/auth-provider";
import { useToast } from "@/components/ui/toast-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PartnershipTable } from "@/components/tables/partnership-table";
import PartnershipFormDialog from "@/components/form/partnership-form-dialog";
import { get, post, put, del } from "@/lib/api";
import { resolveMediaUrl } from "@/lib/utils";

function sortItems(items) {
  if (!Array.isArray(items)) return [];
  return [...items].sort((a, b) => {
    const orderDiff = (a.order || 0) - (b.order || 0);
    if (orderDiff !== 0) return orderDiff;
    return (b.createdAt ? new Date(b.createdAt).getTime() : 0) -
      (a.createdAt ? new Date(a.createdAt).getTime() : 0);
  });
}

export default function PartnershipsPage() {
  const { user, initializing } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const sliderRef = useRef(null);

  const canManage = user?.role === "admin" || user?.role === "operator";

  const fetchData = useCallback(async () => {
    if (!canManage) return;
    try {
      setLoading(true);
      const collaborationData = await get("/partnerships?type=collaboration");
      setItems(sortItems(collaborationData || []));
    } catch (err) {
      console.error(err);
      toastError({
        title: "Gagal memuat data",
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  }, [canManage, toastError]);

  useEffect(() => {
    if (!initializing) {
      fetchData();
    }
  }, [initializing, fetchData]);

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
      await del(`/partnerships/${item.id}`);
      setItems((prev) => sortItems(prev.filter((entry) => entry.id !== item.id)));
      toastSuccess({
        title: "Partner dihapus",
        description: item.name,
      });
    } catch (err) {
      toastError({
        title: "Gagal menghapus data",
        description: err.message,
      });
    }
  }

  async function handleSubmit(payload) {
    try {
      if (editingItem?.id) {
        const updated = await put(`/partnerships/${editingItem.id}`, payload);
        setItems((prev) =>
          sortItems([
            ...prev.filter((item) => item.id !== updated.id),
            updated,
          ])
        );
        toastSuccess({
          title: "Partner diperbarui",
          description: updated.name,
        });
      } else {
        const created = await post("/partnerships", payload);
        setItems((prev) => sortItems([created, ...prev]));
        toastSuccess({
          title: "Partner ditambahkan",
          description: created.name,
        });
      }
      setDialogOpen(false);
      setEditingItem(null);
    } catch (err) {
      toastError({
        title: editingItem?.id ? "Gagal memperbarui" : "Gagal menambah",
        description: err.message,
      });
    }
  }

  function scrollSlider(direction) {
    const node = sliderRef.current;
    if (!node) return;
    const scrollStep = 300 * Math.sign(direction || 1);
    const maxScroll = node.scrollWidth - node.clientWidth;
    if (maxScroll <= 0) return;

    const tolerance = 12;
    const atStart = node.scrollLeft <= tolerance;
    const atEnd = node.scrollLeft + node.clientWidth >= node.scrollWidth - tolerance;

    if (direction > 0 && atEnd) {
      node.scrollTo({ left: 0, behavior: "smooth" });
      return;
    }

    if (direction < 0 && atStart) {
      node.scrollTo({ left: maxScroll, behavior: "smooth" });
      return;
    }

    node.scrollBy({ left: scrollStep, behavior: "smooth" });
  }

  const totalCount = Array.isArray(items) ? items.length : 0;

  if (initializing || !user) {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-muted-foreground">
        Memeriksa sesi...
      </div>
    );
  }

  if (!canManage) {
    return (
      <PageContainer>
        <PageHeader
          title="Kolaborasi"
          description="Halaman ini hanya dapat diakses admin atau operator."
        />
        <Card className="mt-4 border border-amber-200 bg-amber-50">
          <CardContent className="py-6 text-sm text-amber-700">
            Anda tidak memiliki akses untuk mengelola data kolaborasi.
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Kolaborasi"
        description="Kelola logo dan informasi partner kolaborasi yang tampil di landing page. Gunakan tombol panah untuk meninjau manual."
      />

      <Card className="mt-4 border border-border bg-card shadow-sm">
        <CardHeader className="border-b border-border px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-foreground sm:text-lg">
                Ringkasan Partner
              </CardTitle>
              <CardDescription className="mt-1 text-xs text-muted-foreground sm:text-sm">
                Tampilkan peran kolaborator utama dengan manual slider.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5 px-4 py-5 sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm text-muted-foreground">
              Menampilkan <span className="font-semibold">{totalCount}</span> partner kolaborasi.
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-full"
                onClick={() => scrollSlider(-1)}
                aria-label="Geser ke kiri"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-full"
                onClick={() => scrollSlider(1)}
                aria-label="Geser ke kanan"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="overflow-hidden">
              <div
                ref={sliderRef}
                className="flex snap-x gap-4 overflow-x-auto pb-2"
              >
                {items.length ? (
                  items.map((item) => (
                    <article
                      key={item.id}
                      className="min-w-[260px] max-w-xs flex-1 snap-start rounded-2xl border border-border bg-card p-5 shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-border bg-muted">
                          {item.logoPath || item.logo ? (
                            <Image
                              src={
                                resolveMediaUrl(item.logoPath || item.logo) ||
                                item.logoPath ||
                                item.logo
                              }
                              alt={item.name}
                              width={48}
                              height={48}
                              className="h-full w-full object-contain"
                              unoptimized
                            />
                          ) : (
                            <span className="text-sm font-semibold text-muted-foreground">
                              {item.name?.[0] || "P"}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-foreground">
                            {item.name}
                          </p>
                          {item.role && (
                            <p className="truncate text-xs text-muted-foreground">
                              {item.role}
                            </p>
                          )}
                        </div>
                      </div>
                      {item.description && (
                        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                          {item.description}
                        </p>
                      )}
                      <div className="mt-4 flex items-center gap-3 text-[11px] uppercase tracking-wide text-muted-foreground">
                        <span>{item.isPublished ? "Publik" : "Nonaktif"}</span>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="flex min-h-[180px] w-full items-center justify-center rounded-2xl border border-dashed border-border bg-muted text-sm text-muted-foreground">
                    Belum ada kolaborasi ditambahkan.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button size="sm" className="h-9 rounded-md" onClick={handleAdd}>
              <Plus className="mr-2 h-4 w-4" /> Tambah Kolaborasi
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6 border border-border bg-card shadow-sm">
        <CardHeader className="border-b border-border px-4 py-4 sm:px-6">
          <CardTitle className="text-base font-semibold text-foreground sm:text-lg">
            Daftar Kolaborasi
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 py-5 sm:px-6">
          <PartnershipTable
            items={items}
            loading={loading}
            canEdit={canManage}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>

      <PartnershipFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialData={editingItem}
        onSubmit={handleSubmit}
      />
    </PageContainer>
  );
}
