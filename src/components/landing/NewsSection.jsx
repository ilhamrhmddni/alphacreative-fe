import Image from "next/image";
import Link from "next/link";
import { Calendar, ArrowRight } from "lucide-react";
import { formatDate } from "@/lib/formatters";
import { resolveMediaUrl } from "@/lib/utils";

export function NewsSection({ news }) {
  const list = Array.isArray(news) ? news.slice(0, 6) : [];
  const highlight = list[0] || null;
  const remaining = highlight ? list.slice(1) : list;
  const highlightImage = highlight?.photoPath
    ? resolveMediaUrl(highlight.photoPath) || highlight.photoPath
    : null;

  return (
    <section id="news" className="section-white px-4 py-20 sm:px-6 sm:py-28">
      <span aria-hidden="true" className="-mt-20 block h-0" />
      <div className="container mx-auto max-w-6xl">
        <div className="mb-12 sm:mb-16 text-center">
          <p className="mb-3 text-sm font-medium text-primary">INFO TERKINI</p>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Berita Terbaru</h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            Ikuti kabar terbaru mengenai kegiatan dan pengumuman Alpha Creative.
          </p>
        </div>

        <div className="grid gap-6 sm:gap-8 lg:grid-cols-[2fr,1fr]">
          {/* Unggulan Besar - Kiri */}
          {highlight ? (
            <Link
              href={`/news/${highlight.id}`}
              className="group block overflow-hidden rounded-xl border border-border bg-card shadow-sm transition hover:shadow-lg"
            >
              {highlightImage ? (
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
                  <Image
                    src={highlightImage}
                    alt={highlight.title}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-105"
                    sizes="(min-width: 1024px) 66vw, 100vw"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5">
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    <Calendar className="h-16 w-16 opacity-20" />
                  </div>
                </div>
              )}
              <div className="p-6">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                    {highlight.category || "Pengumuman"}
                  </span>
                  <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    {highlight.date ? formatDate(highlight.date) : "TBA"}
                  </span>
                </div>
                <h3 className="mb-2 text-2xl font-bold leading-tight text-foreground">
                  {highlight.title || "Tanpa Judul"}
                </h3>
                <p className="mb-4 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                  {highlight.excerpt || "Selengkapnya segera hadir."}
                </p>
                <div className="flex flex-wrap gap-2">
                  {(highlight.tags || []).slice(0, 4).map((tag) => (
                    <span
                      key={`${highlight.id}-tag-${tag}`}
                      className="rounded-md border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-medium text-primary"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ) : (
            <div className="flex items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 p-12 text-muted-foreground">
              <div className="text-center">
                <Calendar className="mx-auto mb-4 h-12 w-12 opacity-20" />
                <p className="text-sm">Belum ada berita unggulan</p>
              </div>
            </div>
          )}

          {/* List Berita - Kanan */}
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <div className="divide-y divide-border">
              {remaining.length ? (
                remaining.map((item, index) => {
                  const photoUrl = item.photoPath ? resolveMediaUrl(item.photoPath) || item.photoPath : null;
                  return (
                    <Link
                      key={item.id ?? `news-${index}`}
                      href={item?.id ? `/news/${item.id}` : "#"}
                      className="flex gap-4 p-5 transition hover:bg-muted/50"
                    >
                      <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-border bg-muted">
                        {photoUrl ? (
                          <Image
                            src={photoUrl}
                            alt={item.title || "Berita"}
                            fill
                            className="object-cover"
                            sizes="80px"
                            unoptimized
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                            <Calendar className="h-6 w-6 opacity-30" />
                          </div>
                        )}
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                        <p className="font-semibold leading-tight text-foreground line-clamp-2">
                          {item.title || "Tanpa Judul"}
                        </p>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {item?.date ? formatDate(item.date) : "TBA"}
                        </span>
                        {item.category && (
                          <span className="w-fit rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                            {item.category}
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })
              ) : (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  {highlight ? "Berita lainnya segera hadir." : "Belum ada berita yang dirilis."}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/news"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary"
          >
            Lihat semua berita
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
