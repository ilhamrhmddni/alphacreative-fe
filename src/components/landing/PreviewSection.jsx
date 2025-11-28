
import { Trophy, Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/formatters";

export function PreviewSection({ news, champions }) {
  const newsList = news || [];
  const championList = champions || [];
  return (
    <section id="news" className="px-6 py-24">
      <span id="results" aria-hidden="true" className="-mt-20 block h-0" />
      <div className="container mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-medium text-primary">INFO TERKINI</p>
          <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
            Berita & Hasil Kompetisi
          </h2>
          <p className="mx-auto max-w-xl text-muted-foreground">
            Pantau perkembangan terbaru dan hasil kompetisi dari berbagai event.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Berita Terbaru</h3>
              <Link href="/news" variant="ghost" className="text-primary inline-flex items-center gap-2 text-sm font-medium">
                Lihat Semua
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="space-y-4">
              {newsList.map((item) => (
                <Link key={item.id} href={`/news/${item.id}`} className="block">
                  <div className="grid grid-cols-1 gap-4 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-md md:grid-cols-4">
                    {item.photoPath ? (
                      <div className="col-span-1 hidden md:block">
                        <div className="h-20 w-full overflow-hidden rounded">
                          <img src={item.photoPath} alt={item.title} className="h-full w-full object-cover" />
                        </div>
                      </div>
                    ) : null}
                    <div className="col-span-1 md:col-span-3">
                      <div className="mb-2 flex items-center gap-3">
                        <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                          {item.category}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {formatDate(item.date)}
                        </span>
                      </div>
                      <h4 className="mb-1 text-sm font-semibold leading-tight">{item.title}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2">{item.excerpt}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {(item.tags || []).slice(0,3).map((t) => (
                          <span key={t} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">{t}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Juara Terbaru</h3>
              <Link href="/champions" variant="ghost" size="sm" className="inline-flex gap-2 text-primary text-sm font-medium items-center">
                Lihat Semua <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="overflow-hidden rounded-xl border border-border bg-card">
              <div className="bg-gradient-primary p-4">
                <div className="flex items-center gap-3 text-primary-foreground">
                  <Trophy className="h-6 w-6" />
                  <div>
                    <p className="font-semibold">{championList[0]?.event?.name || "Kompetisi Terbaru"}</p>
                    <p className="text-sm opacity-80">{formatDate(championList[0]?.event?.date) || ""}</p>
                  </div>
                </div>
              </div>
              <div className="divide-y divide-border">
                {championList.map((champion, idx) => (
                  <div
                    key={champion.id || idx}
                    className="flex items-center gap-4 p-4 transition-colors hover:bg-muted/50"
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${
                        champion.rank === 1
                          ? "bg-yellow-500/20 text-yellow-600"
                          : champion.rank === 2
                          ? "bg-gray-300/30 text-gray-600"
                          : "bg-orange-500/20 text-orange-600"
                      }`}
                    >
                      #{champion.rank || idx + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{champion.team}</p>
                      <p className="text-xs text-muted-foreground">{champion.event?.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">{champion.score || '-'}</p>
                      <p className="text-xs text-muted-foreground">Skor</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
