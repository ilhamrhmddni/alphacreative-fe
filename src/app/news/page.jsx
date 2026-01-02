import Link from "next/link";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { NewsListing } from "./news-listing";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
const DEFAULT_PAGE = 1;

const envLimit = Number(process.env.NEWS_PAGE_LIMIT || process.env.NEXT_PUBLIC_NEWS_PAGE_LIMIT);
const DEFAULT_LIMIT = Number.isFinite(envLimit) && envLimit > 0 ? envLimit : 10;

const envRevalidate = Number(process.env.NEWS_PAGE_REVALIDATE);
const SERVER_REVALIDATE_SECONDS = Number.isFinite(envRevalidate) && envRevalidate >= 60 ? envRevalidate : 180;

const envExcerpt = Number(process.env.NEWS_PAGE_EXCERPT);
const EXCERPT_LENGTH = Number.isFinite(envExcerpt) && envExcerpt >= 40 ? envExcerpt : 160;

function mapNewsItem(item) {
  return {
    id: item.id,
    title: item.title || item.judul || "",
    excerpt: item.excerpt || (item.deskripsi ? item.deskripsi.slice(0, EXCERPT_LENGTH) : ""),
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

async function fetchNewsPage(page, limit) {
  const safePage = Math.max(1, Number(page) || DEFAULT_PAGE);
  const safeLimit = Math.max(1, Number(limit) || DEFAULT_LIMIT);
  const fallback = {
    news: [],
    meta: {
      total: 0,
      page: safePage,
      limit: safeLimit,
      totalPages: 1,
    },
  };

  try {
    const params = new URLSearchParams();
    params.set("page", String(safePage));
    if (safeLimit) params.set("limit", String(safeLimit));

    const res = await fetch(`${API_URL}/berita?${params.toString()}`, {
      next: { revalidate: SERVER_REVALIDATE_SECONDS },
    });

    if (!res.ok) {
      return fallback;
    }

    const raw = await res.json();

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

    const rawData = raw?.data || [];
    const rawMeta = raw?.meta || {};

    return {
      news: rawData.map(mapNewsItem),
      meta: {
        total: rawMeta.total ?? rawData.length ?? 0,
        page: rawMeta.page ?? safePage,
        limit: rawMeta.limit ?? safeLimit,
        totalPages: rawMeta.totalPages ?? 1,
      },
    };
  } catch (err) {
    console.error("Error fetching berita:", err);
    return fallback;
  }
}

export const revalidate = SERVER_REVALIDATE_SECONDS;

export default async function NewsPage() {
  const initialData = await fetchNewsPage(DEFAULT_PAGE, DEFAULT_LIMIT);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="pt-16">
        <div className="container mx-auto max-w-6xl px-4 py-10 md:py-16">
          <header className="mb-10">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-bold md:text-3xl">Kabar Terbaru</h1>
                <p className="mt-1 max-w-2xl text-sm text-muted-foreground md:text-base">
                  Informasi resmi seputar kegiatan, acara, dan pengumuman Alpha Creative Nusantara.
                </p>
              </div>
              <Link
                href="/"
                className="inline-flex items-center gap-2 self-start rounded-md border border-border bg-card px-3 py-2 text-xs font-semibold text-primary transition-colors hover:border-primary/40 hover:text-primary md:self-auto md:text-sm"
              >
                ← Kembali ke Beranda
              </Link>
            </div>
          </header>

          <div className="mb-8 rounded-xl border border-border/60 bg-muted/10 px-5 py-4 text-sm text-muted-foreground md:px-6 md:py-5">
            Jelajahi rangkuman berita terbaru. Fitur pencarian dan filter akan segera hadir.
          </div>

          <NewsListing initialData={initialData} defaultLimit={DEFAULT_LIMIT} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
