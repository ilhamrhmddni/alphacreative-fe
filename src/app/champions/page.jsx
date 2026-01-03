"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { formatDate } from "@/lib/formatters";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function getApiBaseUrl() {
  const raw =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:4000/api";

  return raw.replace(/\/$/, "");
}

export default function ChampionsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [mounted, setMounted] = useState(false);
  const [payload, setPayload] = useState({ data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } });
  const [loading, setLoading] = useState(true);

  // Read URL params only after mounting
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pageParam = Number(params.get("page") || 1);
    const limitParam = Number(params.get("limit") || 10);
    setPage(pageParam);
    setLimit(limitParam);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const fetchChampions = async () => {
      try {
        const params = new URLSearchParams();
        if (page) params.set("page", String(page));
        if (limit) params.set("limit", String(limit));

        const res = await fetch(`${getApiBaseUrl()}/public/champions?${params.toString()}`);

        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json)) {
            setPayload({ data: json, meta: { total: json.length, page, limit, totalPages: 1 } });
          } else {
            setPayload(json);
          }
        }
      } catch (error) {
        console.error("Error fetching champions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChampions();
  }, [page, limit, mounted]);

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

  const groupMap = new Map();
  const groups = [];

  const normalizeRank = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 999;
  };

  champions.forEach((champion) => {
    const eventId = champion.event?.id;
    const key = eventId !== undefined && eventId !== null ? `event-${eventId}` : `event-${groups.length}`;

    if (!groupMap.has(key)) {
      groupMap.set(key, groups.length);
      groups.push({
        event: champion.event || null,
        items: [],
        sortDate: champion.event?.date ? new Date(champion.event.date).getTime() : 0,
      });
    }

    const group = groups[groupMap.get(key)];
    group.items.push(champion);

    const currentEventDate = champion.event?.date ? new Date(champion.event.date).getTime() : 0;
    if (currentEventDate && currentEventDate > (group.sortDate || 0)) {
      group.sortDate = currentEventDate;
      group.event = champion.event;
    }
  });

  groups.forEach((group) => {
    group.items.sort((a, b) => normalizeRank(a.rank) - normalizeRank(b.rank));
  });

  groups.sort((a, b) => (b.sortDate || 0) - (a.sortDate || 0));

  const rankBadgeClass = (rank) => {
    const numericRank = Number(rank);
    if (numericRank === 1) return "bg-yellow-500/20 text-yellow-600";
    if (numericRank === 2) return "bg-gray-300/30 text-gray-600";
    if (numericRank === 3) return "bg-orange-500/20 text-orange-600";
    return "bg-primary/10 text-primary";
  };

  const getRankNumber = (rank) => {
    if (rank === null || rank === undefined) return "-";
    const numeric = Number(rank);
    if (Number.isFinite(numeric)) return String(numeric);
    if (typeof rank === "string") {
      const match = rank.match(/(\d+)/);
      if (match) return match[0];
    }
    return "-";
  };

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

          {groups.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border/60 bg-muted/10 p-8 text-center text-sm text-muted-foreground">
              Belum ada data juara yang dapat ditampilkan.
            </div>
          ) : (
            <div className="space-y-6">
              {groups.map((group, groupIdx) => (
                <section
                  key={group.event?.id || `group-${groupIdx}`}
                  className="rounded-xl border border-border bg-card p-4 shadow-sm md:p-6"
                >
                  <header className="mb-4 rounded-lg bg-primary/10 p-4 text-primary">
                    <p className="text-xs font-semibold uppercase tracking-wider">Event</p>
                    <h2 className="text-lg font-semibold md:text-xl">
                      {group.event?.name || "Event belum dicatat"}
                    </h2>
                    {group.event?.date || group.event?.location ? (
                      <p className="text-xs text-primary/90 md:text-sm">
                        {group.event?.date ? formatDate(group.event.date) : "Tanggal menyusul"}
                        {group.event?.location ? ` • ${group.event.location}` : ""}
                      </p>
                    ) : null}
                  </header>

                  <div className="grid gap-3 md:grid-cols-3">
                    {group.items.map((item, idx) => (
                      <article
                        key={`${item.id || idx}-${item.rank}`}
                        className="flex h-full flex-col rounded-lg border border-border bg-background/60 p-4 transition-all hover:border-primary/30 hover:bg-muted/40"
                      >
                        <div className="mb-4 flex items-center justify-between">
                          <span
                            className={`inline-flex h-12 w-12 flex-col items-center justify-center rounded-full text-center ${rankBadgeClass(
                              item.rank
                            )}`}
                          >
                            <span className="text-[10px] font-semibold uppercase leading-none">Juara</span>
                            <span className="text-sm font-bold leading-tight">{getRankNumber(item.rank)}</span>
                          </span>
                          <div className="text-right text-[11px] text-muted-foreground md:text-xs">
                            <p>Terakhir diperbarui</p>
                            <p className="font-medium text-foreground">{formatDate(item.updatedAt)}</p>
                          </div>
                        </div>

                        <div className="flex flex-1 flex-col gap-3">
                          <div>
                            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tim</h3>
                            <p className="text-base font-semibold text-foreground md:text-lg">
                              {item.team?.name || "-"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Nomor Peserta: {item.team?.number || "-"}
                            </p>
                          </div>
                          <div>
                            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Kategori</h3>
                            <p className="text-sm font-medium text-foreground">{item.category}</p>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between text-xs">
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
                              Lihat Berkas
                            </Link>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
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
