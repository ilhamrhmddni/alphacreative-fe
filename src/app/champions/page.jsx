import Link from "next/link";
import { formatDate } from "@/lib/formatters";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const revalidate = 300;

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export default async function ChampionsPage({ searchParams }) {
  const page = Number(searchParams?.page || 1);
  const limit = Number(searchParams?.limit || 10);

  let payload = { data: [], meta: { total: 0, page, limit, totalPages: 0 } };

  try {
    const params = new URLSearchParams();
    if (page) params.set("page", String(page));
    if (limit) params.set("limit", String(limit));

    const res = await fetch(`${API_URL}/public/champions?${params.toString()}`, {
      next: { revalidate: 300 },
    });

    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json)) {
        payload = { data: json, meta: { total: json.length, page, limit, totalPages: 1 } };
      } else {
        payload = json;
      }
    }
  } catch (error) {
    console.error("Error fetching champions:", error);
  }

  const champions = (payload.data || []).map((item) => ({
    id: item.id,
    rank: item.rank,
    category: item.category,
    evidence: item.evidence,
    updatedAt: item.updatedAt,
    team: item.team
      ? {
          id: item.team.id,
          name: item.team.name,
          number: item.team.number,
        }
      : null,
    event: item.event
      ? {
          id: item.event.id,
          name: item.event.name,
          date: item.event.date,
          location: item.event.location,
        }
      : null,
  }));
  const meta = payload.meta || { total: 0, page, limit, totalPages: 0 };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="pt-16">
        <div className="container mx-auto max-w-5xl px-4 py-10 md:py-16">
          <header className="mb-8 md:mb-12">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary/80">Hasil</p>
            <h1 className="mt-2 text-2xl font-bold md:text-3xl">Hasil Juara LKBB</h1>
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground md:text-base">
              Rekapitulasi peringkat juara pada setiap event LKBB yang diselenggarakan.
            </p>
            <div className="mt-4">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-xs font-semibold text-primary transition-colors hover:text-primary/80 md:text-sm"
              >
                ← Kembali ke Beranda
              </Link>
            </div>
          </header>

          {champions.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border/60 bg-muted/10 p-8 text-center text-sm text-muted-foreground">
              Belum ada data juara yang dapat ditampilkan.
            </div>
          ) : (
            <div className="space-y-4">
              {champions.map((item) => (
                <article
                  key={`${item.id}-${item.rank}`}
                  className="rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/40 hover:shadow-md md:p-6"
                >
                  <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-primary/70">Peringkat</p>
                      <p className="text-xl font-bold md:text-2xl">
                        {String(item.rank).toLowerCase().includes("juara") ? item.rank : `Juara ${item.rank}`}
                      </p>
                    </div>
                    <div className="text-right text-xs text-muted-foreground/80 md:text-sm">
                      <p>Terakhir diperbarui</p>
                      <p className="font-medium text-foreground">
                        {formatDate(item.updatedAt)}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Tim</h2>
                      <p className="text-lg font-semibold text-foreground md:text-xl">
                        {item.team?.name || "-"}
                      </p>
                      <p className="text-xs text-muted-foreground md:text-sm">
                        Nomor Peserta: {item.team?.number || "-"}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Event</h2>
                      <p className="text-lg font-semibold text-foreground md:text-xl">
                        {item.event?.name || "Event belum dicatat"}
                      </p>
                      <p className="text-xs text-muted-foreground md:text-sm">
                        {item.event ? `${formatDate(item.event.date)} • ${item.event.location || "Lokasi menyusul"}` : "-"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2 text-xs md:text-sm">
                    <span className="rounded-full bg-primary/10 px-3 py-1 font-medium text-primary">
                      {item.category}
                    </span>
                    {item.evidence && (
                      <Link
                        href={item.evidence}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-primary hover:text-primary/80"
                      >
                        Lihat Berkas Bukti
                      </Link>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}

          <footer className="mt-10 border-t border-border pt-6 md:mt-14 md:pt-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Menampilkan halaman {meta.page} dari {meta.totalPages}</p>
                <p className="text-xs text-muted-foreground">Total {meta.total} data juara</p>
              </div>
              <div className="flex gap-2">
                {meta.page > 1 && (
                  <Link
                    href={{
                      pathname: "/champions",
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
                      pathname: "/champions",
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

export async function generateStaticParams() {
  try {
    const res = await fetch(`${API_URL}/public/champions`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) {
      return [{}];
    }
    const json = await res.json();
    const list = Array.isArray(json)
      ? json
      : Array.isArray(json?.data)
      ? json.data
      : [];
    const pages = Math.max(1, Math.ceil(list.length / 10));
    return Array.from({ length: pages }, (_, idx) => ({ page: String(idx + 1) }));
  } catch (error) {
    console.warn("generateStaticParams champions gagal:", error);
    return [{}];
  }
}
