"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { formatDate } from "@/lib/formatters";
import { resolveMediaUrl } from "@/lib/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
const envExcerpt = Number(process.env.NEXT_PUBLIC_NEWS_PAGE_EXCERPT);
const CLIENT_EXCERPT_LENGTH = Number.isFinite(envExcerpt) && envExcerpt >= 40 ? envExcerpt : 160;

function mapNewsItem(item) {
  return {
    id: item.id,
    title: item.title || item.judul || "",
    excerpt: item.excerpt || (item.deskripsi ? item.deskripsi.slice(0, CLIENT_EXCERPT_LENGTH) : ""),
    date: item.date || item.tanggal || item.createdAt || null,
    category: (item.tags && item.tags[0]) || item.category || "Pengumuman",
    tags: item.tags || [],
    photoPath: item.photoPath || null,
    event: item.event
      ? {
          id: item.event.id,
          name: item.event.namaEvent || item.event.name,
          date: item.event.tanggalEvent || item.event.date,
        }
      : null,
  };
}

function normalizeResponse(raw, fallbackPage, fallbackLimit, defaultLimit) {
  const safePage = fallbackPage && fallbackPage > 0 ? fallbackPage : 1;
  const safeLimit = fallbackLimit && fallbackLimit > 0 ? fallbackLimit : defaultLimit;

  if (Array.isArray(raw)) {
    return {
      news: raw.map(mapNewsItem),
      meta: {
        total: raw.length,
        page: safePage,
        limit: safeLimit,
        totalPages: raw.length > 0 ? Math.ceil(raw.length / safeLimit) : 1,
      },
    };
  }

  const safeMeta = raw?.meta || {};
  const rawData = raw?.data || [];
  return {
    news: rawData.map(mapNewsItem),
    meta: {
      total: safeMeta.total ?? rawData.length ?? 0,
      page: safeMeta.page ?? safePage,
      limit: safeMeta.limit ?? safeLimit,
      totalPages: safeMeta.totalPages ?? 1,
    },
  };
}

export function NewsListing({ initialData, defaultLimit }) {
  const searchParams = useSearchParams();
  const initialMeta = useMemo(() => {
    const rawMeta = initialData.meta || {};
    const safePage = rawMeta.page && rawMeta.page > 0 ? rawMeta.page : 1;
    const safeLimit = rawMeta.limit && rawMeta.limit > 0 ? rawMeta.limit : defaultLimit;
    const safeTotalPages = rawMeta.totalPages && rawMeta.totalPages > 0 ? rawMeta.totalPages : 1;
    const safeTotal = Number.isFinite(rawMeta.total) && rawMeta.total >= 0 ? rawMeta.total : (initialData.news?.length || 0);
    return {
      total: safeTotal,
      page: safePage,
      limit: safeLimit,
      totalPages: safeTotalPages,
    };
  }, [initialData.meta, initialData.news, defaultLimit]);
  const initialNews = useMemo(() => initialData.news || [], [initialData.news]);

  const [news, setNews] = useState(initialNews);
  const [meta, setMeta] = useState(initialMeta);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const parsedPage = Number(searchParams.get("page"));
  const parsedLimit = Number(searchParams.get("limit"));

  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : initialMeta.page || 1;
  const limit = Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : initialMeta.limit || defaultLimit;

  useEffect(() => {
    const isInitial = page === initialMeta.page && limit === initialMeta.limit;
    if (isInitial) {
      setNews(initialNews);
      setMeta(initialMeta);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        params.set("page", String(page));
        if (limit) params.set("limit", String(limit));

        const res = await fetch(`${API_URL}/berita?${params.toString()}`);
        if (!res.ok) {
          throw new Error(`Gagal mengambil berita (status ${res.status})`);
        }
        const raw = await res.json();
        const normalized = normalizeResponse(raw, page, limit || defaultLimit, defaultLimit);
        if (!cancelled) {
          setNews(normalized.news);
          setMeta(normalized.meta);
        }
      } catch (err) {
        console.error("Error fetching berita:", err);
        if (!cancelled) {
          setError("Tidak dapat memuat berita saat ini.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [page, limit, initialMeta.page, initialMeta.limit, initialMeta, initialNews, defaultLimit]);

  const isEmpty = !loading && news.length === 0;

  const buildPageLink = (targetPage) => {
    const params = new URLSearchParams();
    if (targetPage && targetPage !== 1) {
      params.set("page", String(targetPage));
    }
    if (limit && limit !== defaultLimit) {
      params.set("limit", String(limit));
    }
    const queryString = params.toString();
    return queryString ? `/news?${queryString}` : `/news`;
  };

  return (
    <div>
      {loading && (
        <div className="mb-4 rounded-lg border border-border/60 bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
          Memuat berita...
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-xs text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {isEmpty && (
          <p className="text-xs text-muted-foreground md:text-sm">Belum ada berita.</p>
        )}
        {news.map((item, index) => {
          const photoUrl = item.photoPath ? resolveMediaUrl(item.photoPath) || item.photoPath : null;
          return (
            <article
              key={item.id ?? `news-${index}`}
              className="overflow-hidden rounded-xl border border-border bg-card transition hover:-translate-y-[2px] hover:border-primary/40 hover:shadow-md"
            >
              <Link href={item?.id ? `/news/${item.id}` : "#"} className="flex flex-col gap-4 p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-6">
                  <div className="relative h-36 w-full overflow-hidden rounded-lg border border-border bg-muted md:h-32 md:w-56">
                    {photoUrl ? (
                      <Image
                        src={photoUrl}
                        alt={item.title || "Berita"}
                        fill
                        className="object-cover transition duration-700 group-hover:scale-105"
                        sizes="(min-width: 1024px) 224px, 100vw"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                        Tidak ada foto
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-3">
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="rounded-full bg-primary/10 px-2 py-1 font-medium text-primary">
                        {item.category}
                      </span>
                      <span>{item?.date ? formatDate(item.date) : "TBA"}</span>
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
                        {item.title || "Tanpa Judul"}
                      </h2>
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
                        {item.excerpt || "Selengkapnya segera hadir."}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-primary">
                      {(item.tags || []).slice(0, 3).map((tag) => (
                        <span
                          key={`${item?.id ?? `news-${index}`}-tag-${tag}`}
                          className="rounded-full bg-primary/10 px-3 py-1 font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-end text-xs font-semibold text-primary">
                  Baca selengkapnya →
                </div>
              </Link>
            </article>
          );
        })}
      </div>

      <footer className="mt-10 flex flex-col gap-4 border-t border-border pt-6 md:flex-row md:items-center md:justify-between md:gap-6">
        <div>
          <p className="text-xs font-medium text-muted-foreground">
            Menampilkan halaman {meta.page} dari {meta.totalPages}
          </p>
          <p className="text-xs text-muted-foreground/80">Total {meta.total} berita</p>
        </div>
        <div className="flex gap-2">
          {meta.page > 1 && (
            <Link
              href={buildPageLink(meta.page - 1)}
              className="inline-flex items-center rounded-md border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground transition hover:border-primary/40 hover:text-primary"
            >
              ← Sebelumnya
            </Link>
          )}
          {meta.page < meta.totalPages && (
            <Link
              href={buildPageLink(meta.page + 1)}
              className="inline-flex items-center rounded-md border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground transition hover:border-primary/40 hover:text-primary"
            >
              Selanjutnya →
            </Link>
          )}
        </div>
      </footer>
    </div>
  );
}
