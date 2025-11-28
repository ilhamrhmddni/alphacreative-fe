import Image from "next/image";
import Link from "next/link";
import { formatDate } from "@/lib/formatters";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export default async function NewsPage({ searchParams }) {
  const page = Number(searchParams?.page || 1);
  const limit = Number(searchParams?.limit || 10);

  let data = { data: [], meta: { total: 0, page, limit, totalPages: 0 } };
  try {
    const params = new URLSearchParams();
    if (page) params.set("page", String(page));
    if (limit) params.set("limit", String(limit));
    const res = await fetch(`${API_URL}/berita?${params.toString()}`, {
      cache: "no-store",
      next: { revalidate: 0 },
    });
    if (res.ok) {
      const json = await res.json();
      // support two shapes: legacy array ([]) or { data: [], meta: {} }
      if (Array.isArray(json)) {
        data = { data: json, meta: { total: json.length, page, limit, totalPages: 1 } };
      } else {
        data = json;
      }
    }
  } catch (err) {
    console.error("Error fetching berita:", err);
  }

  const newsRaw = data.data || [];
  const news = newsRaw.map((item) => ({
    id: item.id,
    title: item.title || item.title,
    excerpt: item.excerpt || (item.deskripsi ? item.deskripsi.slice(0, 160) : ""),
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
  }));
  const meta = data.meta || { total: 0, page, limit, totalPages: 0 };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="pt-16">
        <div className="container mx-auto px-3 py-6 md:px-4 md:py-12">
          <header className="mb-6 md:mb-8">
            <div>
              <h1 className="text-xl md:text-2xl font-bold mb-0.5 md:mb-1">Berita</h1>
              <p className="text-xs md:text-sm text-muted-foreground max-w-xl">Informasi terbaru tentang event dan perlombaan.</p>
            </div>
            <div className="mt-4">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-xs font-semibold text-primary transition-colors hover:text-primary/80 md:text-sm"
              >
                ← Kembali ke Beranda
              </Link>
            </div>
          </header>

          <div className="mb-4 md:mb-6 rounded-lg border border-dashed border-border/60 bg-muted/10 px-4 py-3 text-xs md:text-sm text-muted-foreground">
            <p>
              Daftar berita ditampilkan tanpa fitur pencarian ataupun filter tag. Silakan jelajahi berita yang tersedia di bawah ini.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
            {news.length === 0 && <p className="col-span-full text-xs md:text-sm text-muted-foreground">Belum ada berita.</p>}
            {news.map((item) => (
              <article key={item.id} className="rounded-lg border border-border bg-card overflow-hidden hover:border-primary/50 transition-colors flex flex-col h-full">
                {item.photoPath && (
                  <div className="relative h-40 md:h-48 w-full overflow-hidden">
                    <Image src={item.photoPath} alt={item.title} fill className="object-cover" unoptimized priority={false} />
                  </div>
                )}
                <div className="p-3 md:p-4 flex flex-col flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-1 md:gap-2 text-xs">
                    <span className="rounded-full bg-primary/10 px-1.5 py-0.5 font-medium text-primary">{item.category}</span>
                    <span className="text-muted-foreground/75">{formatDate(item.date)}</span>
                  </div>
                  <h2 className="text-sm md:text-base font-semibold leading-tight line-clamp-2 mb-2">{item.title}</h2>
                  <p className="text-xs text-muted-foreground line-clamp-3 flex-1 mb-3">{item.excerpt}</p>
                  <div className="flex items-center justify-between gap-2 pt-3 border-t border-border/50">
                    <div className="flex flex-wrap gap-1">
                      {(item.tags || []).slice(0, 1).map((t) => (
                        <span
                          key={t}
                          className="rounded-full border border-primary/20 bg-primary/5 px-3 py-0.5 text-xs font-medium text-primary"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                    <Link
                      href={`/news/${item.id}`}
                      className={cn(
                        buttonVariants({ size: "sm" }),
                        "whitespace-nowrap text-xs md:text-sm"
                      )}
                    >
                      Baca Selengkapnya →
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <footer className="mt-8 md:mt-12 border-t border-border pt-6 md:pt-8">
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Menampilkan halaman {meta.page} dari {meta.totalPages}</p>
                <p className="text-xs text-muted-foreground/75">Total {meta.total} berita</p>
              </div>
              <div className="flex gap-2">
                {meta.page > 1 && (
                  <Link
                    href={{
                      pathname: '/news',
                      query: {
                        page: meta.page - 1,
                        ...(limit ? { limit } : {}),
                      },
                    }}
                    className={cn(
                      buttonVariants({ size: "sm", variant: "outline" }),
                      "text-xs md:text-sm"
                    )}
                  >
                    ← Halaman Sebelumnya
                  </Link>
                )}
                {meta.page < meta.totalPages && (
                  <Link
                    href={{
                      pathname: '/news',
                      query: {
                        page: meta.page + 1,
                        ...(limit ? { limit } : {}),
                      },
                    }}
                    className={cn(
                      buttonVariants({ size: "sm", variant: "outline" }),
                      "text-xs md:text-sm"
                    )}
                  >
                    Halaman Selanjutnya →
                  </Link>
                )}
              </div>
            </div>
          </footer>
        </div>
      </main>
      <Footer />
    </div>
  );
}
