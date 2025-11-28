"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Megaphone } from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import { del, get, post, put } from "@/lib/api";
import { useToast } from "@/components/ui/toast-provider";
import { formatDate } from "@/lib/formatters";

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

import { NewsTable } from "@/components/tables/news-table";
import NewsFormDialog from "@/components/form/news-form-dialog";

function normalizeNewsData(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (payload && Array.isArray(payload.data)) {
    return payload.data;
  }

  if (payload && Array.isArray(payload.items)) {
    return payload.items;
  }

  return [];
}

export default function BeritaPage() {
  const router = useRouter();
  const { user, initializing } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();

  const [news, setNews] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedNews, setSelectedNews] = useState(null);
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);

  const [filterText, setFilterText] = useState("");
  const [yearFilter, setYearFilter] = useState("all");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingNews, setEditingNews] = useState(null);

  useEffect(() => {
    if (!initializing && !user) {
      router.push("/auth/login");
    }
  }, [initializing, user, router]);

  const fetchNews = useCallback(async () => {
    if (!user || initializing) return;
    try {
      setLoading(true);
      setError("");
      const data = await get("/berita");
      setNews(normalizeNewsData(data));
    } catch (err) {
      console.error(err);
      setError(err.message || "Gagal memuat berita");
    } finally {
      setLoading(false);
    }
  }, [user, initializing]);

  const fetchEvents = useCallback(async () => {
    if (!user || initializing) return;
    try {
      setEventsLoading(true);
      const data = await get("/events");
      setEvents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setEventsLoading(false);
    }
  }, [user, initializing]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    const source = Array.isArray(news) ? news : [];
    let data = [...source];

    if (filterText.trim()) {
      const text = filterText.toLowerCase();
      data = data.filter(
        (item) =>
          (item.title || "").toLowerCase().includes(text) ||
          (item.deskripsi || "").toLowerCase().includes(text)
      );
    }

    if (yearFilter !== "all") {
      data = data.filter((item) => {
        if (!item.tanggal) return false;
        const year = new Date(item.tanggal).getFullYear().toString();
        return year === yearFilter;
      });
    }

    setFiltered(data);
  }, [news, filterText, yearFilter]);

  useEffect(() => {
    if (!filtered.length) {
      setSelectedNews(null);
      return;
    }
    if (!selectedNews) {
      setSelectedNews(filtered[0]);
      return;
    }
    const exists = filtered.some((item) => item.id === selectedNews.id);
    if (!exists) {
      setSelectedNews(filtered[0]);
    }
  }, [filtered, selectedNews]);

  async function handleDelete(item) {
    try {
      await del(`/berita/${item.id}`);
      setNews((prev) =>
        Array.isArray(prev)
          ? prev.filter((newsItem) => newsItem.id !== item.id)
          : []
      );
      toastSuccess({
        title: "Berita dihapus",
        description: item.title || "Berita berhasil dihapus",
      });
    } catch (err) {
      toastError({
        title: "Gagal menghapus berita",
        description: err.message,
      });
    }
  }

  function handleAdd() {
    setEditingNews(null);
    setDialogOpen(true);
  }

  function handleEdit(item) {
    setEditingNews(item);
    setDialogOpen(true);
  }

  async function handleSubmitForm(formData) {
    try {
      if (editingNews) {
        const updated = await put(`/berita/${editingNews.id}`, formData);
        setNews((prev) =>
          Array.isArray(prev)
            ? prev.map((item) => (item.id === updated.id ? updated : item))
            : [updated]
        );
        toastSuccess({
          title: "Berita diperbarui",
          description: updated.title || "Konten berita disimpan",
        });
      } else {
        const created = await post("/berita", formData);
        setNews((prev) =>
          Array.isArray(prev) ? [created, ...prev] : [created]
        );
        toastSuccess({
          title: "Berita ditambahkan",
          description: created.title || "Berita baru berhasil diterbitkan",
        });
      }

      setDialogOpen(false);
      setEditingNews(null);
    } catch (err) {
      toastError({
        title: editingNews ? "Gagal menyimpan berita" : "Gagal menambah berita",
        description: err.message,
      });
    }
  }

  const yearOptions = useMemo(() => {
    const source = Array.isArray(news) ? news : [];
    const years = new Set();
    source.forEach((item) => {
      if (!item.tanggal) return;
      const year = new Date(item.tanggal).getFullYear();
      if (!Number.isNaN(year)) {
        years.add(year);
      }
    });
    return Array.from(years)
      .sort((a, b) => b - a)
      .map((year) => String(year));
  }, [news]);

  const eventOptions = useMemo(
    () =>
      events.map((event) => ({
        value: String(event.id),
        label: event.namaEvent || `Event #${event.id}`,
      })),
    [events]
  );

  if (initializing || !user) {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-slate-500">
        Memeriksa sesi...
      </div>
    );
  }

  const canManage = user.role === "admin" || user.role === "operator";
  const safeNews = Array.isArray(news) ? news : [];
  const totalNews = safeNews.length;
  const newsThisMonth = safeNews.filter((item) => isSameMonth(item.tanggal)).length;
  const withPhoto = safeNews.filter((item) => !!item.photoPath).length;

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-3 py-4 sm:px-4 lg:px-2">
        <Card className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <CardHeader className="border-b border-slate-100 px-4 py-4 sm:px-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle className="text-base font-semibold text-slate-900 sm:text-lg">
                  Berita & Pengumuman
                </CardTitle>
                <CardDescription className="mt-1 text-xs text-slate-500 sm:text-sm">
                  {totalNews > 0
                    ? `${totalNews} berita tersimpan di database`
                    : "Belum ada berita. Tambahkan informasi untuk publik."}
                </CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <StatPill label="Total" value={totalNews} />
                <StatPill label="Bulan ini" value={newsThisMonth} color="emerald" />
                <StatPill label="Dengan Foto" value={withPhoto} color="amber" />
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 px-4 py-4 sm:px-6 sm:py-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="flex w-full flex-col gap-3">
                <div className="w-full">
                  <Input
                    placeholder="Cari judul atau isi berita..."
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    className="h-9 w-full rounded-md border-slate-200 bg-white text-xs placeholder:text-slate-400 sm:text-sm"
                  />
                </div>
                <div className="flex gap-2 w-full flex-wrap">
                  <Select value={yearFilter} onValueChange={setYearFilter}>
                    <SelectTrigger className="h-9 w-full rounded-md border-slate-200 bg-white text-xs sm:w-[180px] sm:text-sm">
                      <SelectValue placeholder="Semua tahun" />
                    </SelectTrigger>
                    <SelectContent className="rounded-md border border-slate-200 bg-white shadow-md">
                      <SelectItem value="all">Semua tahun</SelectItem>
                      {yearOptions.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {(filterText || yearFilter !== "all") && (
                    <Button
                      type="button"
                      variant="outline"
                      className="h-9 rounded-md text-xs"
                      onClick={() => {
                        setFilterText("");
                        setYearFilter("all");
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
                  <Megaphone className="mr-2 h-4 w-4" />
                  Tambah Berita
                </Button>
              )}
            </div>

            {error && (
              <p className="text-[11px] text-red-500">{error}</p>
            )}

            {filtered.length !== totalNews && (
              <p className="text-[11px] text-slate-500">
                Menampilkan{" "}
                <span className="font-medium">{filtered.length}</span> dari{" "}
                <span className="font-medium">{totalNews}</span> berita.
              </p>
            )}

            <NewsTable
              items={filtered}
              loading={loading}
              canEdit={canManage}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onSelect={setSelectedNews}
            />

            <NewsReader item={selectedNews} loading={loading} />
          </CardContent>
        </Card>
      </main>

      <NewsFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialData={editingNews}
        onSubmit={handleSubmitForm}
        eventOptions={eventOptions}
        eventsLoading={eventsLoading}
      />
    </div>
  );
}

function isSameMonth(dateLike) {
  if (!dateLike) return false;
  const date = new Date(dateLike);
  if (Number.isNaN(date.getTime())) return false;
  const now = new Date();
  return (
    date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
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

function NewsReader({ item, loading }) {
  if (loading) {
    return null;
  }

  if (!item) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
        Pilih salah satu berita untuk melihat isi lengkapnya.
      </div>
    );
  }

  return (
    <article className="rounded-xl border border-slate-200 bg-white px-5 py-5 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-slate-400">
        Dipublikasikan pada {formatDate(item.tanggal)}
      </p>
      <h3 className="mt-1 text-xl font-semibold text-slate-900">
        {item.title}
      </h3>
      {item.event?.namaEvent && (
        <p className="mt-0.5 text-xs text-slate-500">
          Bagian dari event <span className="font-semibold text-slate-800">{item.event.namaEvent}</span>
          {item.event.tanggalEvent
            ? ` • ${formatDate(item.event.tanggalEvent)}`
            : ""}
        </p>
      )}
      {item.photoPath && (
        <div className="mt-3 overflow-hidden rounded-lg border border-slate-100">
          <img
            src={item.photoPath}
            alt={item.title}
            className="h-64 w-full object-cover"
          />
        </div>
      )}
      <p className="mt-4 text-sm leading-relaxed text-slate-700 whitespace-pre-line">
        {item.deskripsi}
      </p>
      {Array.isArray(item.tags) && item.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {item.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
