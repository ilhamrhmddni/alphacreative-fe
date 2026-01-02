"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ShoppingBag, Plus, MessageCircle } from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import { get, post, put, del } from "@/lib/api";
import { useToast } from "@/components/ui/toast-provider";
import { formatCurrency } from "@/lib/formatters";
import { resolveMediaUrl } from "@/lib/utils";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import MerchandiseFormDialog from "@/components/form/merchandise-form-dialog";
import { MerchandiseTable } from "@/components/tables/merchandise-table";
import { PesertaMerchandiseCard } from "@/components/merchandise/peserta-merchandise-card";

function normalizeMerchandisePayload(payload) {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.items)) return payload.items;
  return [];
}

function sortMerchandise(list) {
  return [...list].sort((a, b) => {
    const orderA = Number(a?.order ?? 0);
    const orderB = Number(b?.order ?? 0);
    if (!Number.isNaN(orderA) && !Number.isNaN(orderB) && orderA !== orderB) {
      return orderA - orderB;
    }
    const timeA = new Date(a?.createdAt || a?.updatedAt || 0).getTime();
    const timeB = new Date(b?.createdAt || b?.updatedAt || 0).getTime();
    return timeB - timeA;
  });
}

export default function MerchandisePage() {
  const router = useRouter();
  const { user, initializing } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();

  const [items, setItems] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterText, setFilterText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [whatsappNumber, setWhatsappNumber] = useState(null);
  const [whatsappLoading, setWhatsappLoading] = useState(true);

  useEffect(() => {
    if (!initializing && !user) {
      router.push("/auth/login");
    }
  }, [initializing, user, router]);

  const fetchMerchandise = useCallback(async () => {
    if (!user || initializing) return;
    try {
      setLoading(true);
      setError("");
      const data = await get("/merchandise?limit=200");
      const normalized = normalizeMerchandisePayload(data);
      setItems(sortMerchandise(normalized));
    } catch (err) {
      console.error(err);
      setError(err.message || "Gagal memuat merchandise");
    } finally {
      setLoading(false);
    }
  }, [user, initializing]);

  useEffect(() => {
    fetchMerchandise();
  }, [fetchMerchandise]);

  useEffect(() => {
    const source = Array.isArray(items) ? items : [];
    let result = [...source];

    if (filterText.trim()) {
      const text = filterText.toLowerCase();
      result = result.filter((item) => {
        const name = (item.name || "").toLowerCase();
        const desc = (item.description || "").toLowerCase();
        return name.includes(text) || desc.includes(text);
      });
    }

    if (statusFilter !== "all") {
      const shouldPublished = statusFilter === "published";
      result = result.filter((item) => Boolean(item.isPublished) === shouldPublished);
    }

    setFiltered(result);
  }, [items, filterText, statusFilter]);

  useEffect(() => {
    if (!selected) {
      setSelected(filtered[0]);
      return;
    }
    const exists = filtered.some((item) => item.id === selected.id);
    if (!exists) {
      setSelected(filtered[0]);
    }
  }, [filtered, selected]);

  useEffect(() => {
    async function fetchWhatsapp() {
      try {
        const settings = await get("/settings?key=merch.whatsapp");
        setWhatsappNumber(settings?.value || null);
      } catch (err) {
        console.warn("Could not fetch WhatsApp:", err);
      } finally {
        setWhatsappLoading(false);
      }
    }
    fetchWhatsapp();
  }, []);

  const canManage = user && (user.role === "admin" || user.role === "operator");

  const sanitizeWhatsapp = useCallback((number) => {
    if (!number) return "";
    if (typeof number !== "string") return String(number);
    return number.replace(/\D+/g, "");
  }, []);

  const buildWhatsappLink = useCallback((number, item) => {
    if (!number || !item?.productCode || !item?.name) return null;
    const digits = sanitizeWhatsapp(number);
    if (!digits) return null;
    const message = `Halo, saya ingin pesan ${item.name} (Kode: ${item.productCode}).`;
    return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
  }, [sanitizeWhatsapp]);

  const pesertaItems = useMemo(() => {
    return filtered.map((item) => {
      const photo = item.photoPath ? resolveMediaUrl(item.photoPath) || item.photoPath : null;
      const priceLabel =
        item.price === null || item.price === undefined ? "Hubungi kami" : formatCurrency(item.price);
      const stock = Number(item.stock);
      let stockLabel = "Stok: -";
      let stockClass = "border border-border bg-muted/40 text-muted-foreground";

      if (!Number.isNaN(stock)) {
        if (stock <= 0) {
          stockLabel = "Habis";
          stockClass = "border border-rose-200 bg-rose-50 text-rose-700";
        } else {
          stockLabel = `Stok: ${stock}`;
          stockClass = "border border-emerald-200 bg-emerald-50 text-emerald-700";
        }
      }

      const orderLink = buildWhatsappLink(whatsappNumber, item);

      return {
        ...item,
        photo,
        priceLabel,
        stockLabel,
        stockClass,
        orderLink,
      };
    });
  }, [filtered, whatsappNumber, buildWhatsappLink]);
  const safeItems = Array.isArray(items) ? items : [];
  const totalItems = safeItems.length;
  const publishedCount = safeItems.filter((item) => item.isPublished).length;
  const outOfStock = safeItems.filter((item) => {
    const stock = Number(item.stock);
    if (Number.isNaN(stock)) return false;
    return stock <= 0;
  }).length;

  function handleAdd() {
    setEditing(null);
    setDialogOpen(true);
  }

  function handleEdit(item) {
    setEditing(item);
    setDialogOpen(true);
  }

  async function handleDelete(item) {
    try {
      await del(`/merchandise/${item.id}`);
      setItems((prev) => prev.filter((entry) => entry.id !== item.id));
      toastSuccess({
        title: "Merchandise dihapus",
        description: item.name,
      });
    } catch (err) {
      toastError({
        title: "Gagal menghapus merchandise",
        description: err.message,
      });
    }
  }

  async function handleTogglePublish(item) {
    try {
      const updated = await put(`/merchandise/${item.id}`, {
        isPublished: !item.isPublished,
      });
      setItems((prev) => sortMerchandise(prev.map((entry) => (entry.id === updated.id ? updated : entry))));
      toastSuccess({
        title: updated.isPublished ? "Merchandise ditampilkan" : "Merchandise disembunyikan",
        description: updated.name,
      });
    } catch (err) {
      toastError({
        title: "Gagal memperbarui status",
        description: err.message,
      });
    }
  }

  async function handleSubmitForm(formData) {
    try {
      if (editing) {
        const updated = await put(`/merchandise/${editing.id}`, formData);
        setItems((prev) => sortMerchandise(prev.map((entry) => (entry.id === updated.id ? updated : entry))));
        toastSuccess({
          title: "Merchandise diperbarui",
          description: updated.name,
        });
      } else {
        const created = await post("/merchandise", formData);
        setItems((prev) => sortMerchandise([created, ...prev]));
        toastSuccess({
          title: "Merchandise ditambahkan",
          description: created.name,
        });
      }
      setDialogOpen(false);
      setEditing(null);
    } catch (err) {
      toastError({
        title: editing ? "Gagal menyimpan perubahan" : "Gagal menambahkan merchandise",
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

  // Peserta view - card-based layout
  if (user.role === "peserta") {
    return (
      <div className="min-h-screen">
        <main className="container mx-auto px-3 py-4 sm:px-4 lg:px-2">
          <Card className="w-full overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <CardHeader className="border-b border-border px-4 py-4 sm:px-6">
              <div>
                <CardTitle className="text-base font-semibold text-foreground sm:text-lg">
                  Merchandise
                </CardTitle>
                <CardDescription className="mt-1 text-xs text-muted-foreground sm:text-sm">
                  Jelajahi dan pesan merchandise resmi Alpha Creative langsung melalui WhatsApp
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-5 px-4 py-5 sm:px-6">
              <div className="flex flex-col gap-3 md:flex-row md:items-end">
                <Input
                  placeholder="Cari nama produk..."
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  className="h-9 rounded-md border-border text-xs sm:text-sm md:w-72"
                />
                {filterText && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9 rounded-md"
                    onClick={() => setFilterText("")}
                  >
                    Reset
                  </Button>
                )}
              </div>

              {error && <p className="text-[11px] text-red-500">{error}</p>}

              {loading || whatsappLoading ? (
                <div className="flex items-center justify-center py-12">
                  <p className="text-sm text-muted-foreground">Memuat merchandise...</p>
                </div>
              ) : pesertaItems.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {pesertaItems.map((item) => (
                    <PesertaMerchandiseCard
                      key={item.id}
                      item={item}
                      photo={item.photo}
                      priceLabel={item.priceLabel}
                      stockLabel={item.stockLabel}
                      stockClass={item.stockClass}
                      orderLink={item.orderLink}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted py-12">
                  <ShoppingBag className="mb-3 h-12 w-12 text-muted-foreground/40" />
                  <p className="text-sm font-medium text-muted-foreground">Belum ada merchandise tersedia</p>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // Admin/Operator view - table-based management
  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-3 py-4 sm:px-4 lg:px-2">
        <Card className="w-full overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <CardHeader className="border-b border-border px-4 py-4 sm:px-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle className="text-base font-semibold text-foreground sm:text-lg">
                  Katalog Merchandise
                </CardTitle>
                <CardDescription className="mt-1 text-xs text-muted-foreground sm:text-sm">
                  Kelola produk resmi Alpha Creative yang tampil di landing page.
                </CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <StatPill label="Total" value={totalItems} />
                <StatPill label="Tampil" value={publishedCount} color="emerald" />
                <StatPill label="Stok habis" value={outOfStock} color="rose" />
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-5 px-4 py-5 sm:px-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div className="flex w-full flex-col gap-3 md:flex-row">
                <Input
                  placeholder="Cari nama atau deskripsi produk..."
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  className="h-9 rounded-md border-border text-xs sm:text-sm md:w-72"
                />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-9 w-full rounded-md border-border text-xs sm:w-48 sm:text-sm">
                    <SelectValue placeholder="Semua status" />
                  </SelectTrigger>
                  <SelectContent className="rounded-md border border-border bg-card shadow-md">
                    <SelectItem value="all">Semua status</SelectItem>
                    <SelectItem value="published">Tampil</SelectItem>
                    <SelectItem value="hidden">Tersembunyi</SelectItem>
                  </SelectContent>
                </Select>
                {(filterText || statusFilter !== "all") && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9 rounded-md md:ml-2"
                    onClick={() => {
                      setFilterText("");
                      setStatusFilter("all");
                    }}
                  >
                    Reset
                  </Button>
                )}
              </div>

              {canManage && (
                <Button size="sm" className="h-9 rounded-md md:w-auto" onClick={handleAdd}>
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah Merchandise
                </Button>
              )}
            </div>

            {error && <p className="text-[11px] text-red-500">{error}</p>}

            <MerchandiseTable
              items={filtered}
              loading={loading}
              canEdit={canManage}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onTogglePublish={handleTogglePublish}
              onSelect={setSelected}
            />

            <MerchandiseInfo item={selected} loading={loading} />
          </CardContent>
        </Card>
      </main>

      <MerchandiseFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialData={editing}
        onSubmit={handleSubmitForm}
      />
    </div>
  );
}

function StatPill({ label, value, color }) {
  let tone = "bg-muted text-foreground border-border";
  if (color === "emerald") {
    tone = "bg-emerald-50 text-emerald-700 border-emerald-200";
  } else if (color === "rose") {
    tone = "bg-rose-50 text-rose-700 border-rose-200";
  }

  return (
    <div className={`inline-flex min-w-[64px] flex-col justify-center rounded-md border px-2.5 py-1 ${tone}`}>
      <span className="text-[10px] uppercase tracking-wide opacity-75">{label}</span>
      <span className="text-sm font-semibold leading-tight">{value}</span>
    </div>
  );
}

function MerchandiseInfo({ item, loading }) {
  if (loading) {
    return null;
  }

  if (!item) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted px-4 py-5 text-sm text-muted-foreground">
        Pilih salah satu merchandise untuk melihat detailnya.
      </div>
    );
  }

  const photo = item.photoPath ? resolveMediaUrl(item.photoPath) || item.photoPath : null;
  const stock = Number(item.stock);
  const priceLabel = item.price === null || item.price === undefined ? "Belum ditentukan" : formatCurrency(item.price);

  return (
    <div className="grid gap-4 rounded-xl border border-border bg-card px-4 py-5 sm:grid-cols-[240px_1fr]">
      {photo ? (
        <div className="relative h-48 w-full overflow-hidden rounded-lg border border-border">
          <Image src={photo} alt={item.name} fill className="object-cover" unoptimized />
        </div>
      ) : (
        <div className="flex h-48 w-full items-center justify-center rounded-lg border border-dashed border-border bg-muted text-xs text-muted-foreground">
          Tidak ada foto merchandise
        </div>
      )}
      <div className="space-y-3 text-sm">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ShoppingBag className="h-4 w-4" />
          </span>
          <div>
            <p className="text-base font-semibold text-foreground">{item.name}</p>
            <p className="text-xs text-muted-foreground">Harga: {priceLabel}</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{item.description || "Belum ada deskripsi."}</p>
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="rounded-full border border-border bg-muted px-3 py-1">
            Stok: {Number.isNaN(stock) ? "-" : stock}
          </span>
          <span
            className={`rounded-full px-3 py-1 font-medium ${
              item.isPublished
                ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border border-border bg-muted text-muted-foreground"
            }`}
          >
            {item.isPublished ? "Ditampilkan" : "Disembunyikan"}
          </span>
          <span className="rounded-full border border-border bg-muted px-3 py-1">
            Urutan: {item.order ?? 0}
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Terakhir diperbarui: {item.updatedAt ? new Date(item.updatedAt).toLocaleString("id-ID") : "-"}
        </p>
      </div>
    </div>
  );
}
