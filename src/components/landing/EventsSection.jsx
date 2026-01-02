
import Link from "next/link";
import { Calendar, MapPin, Users, ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/formatters";

const statusConfig = {
  open: { label: "Pendaftaran Dibuka", color: "bg-green-500/10 text-green-600" },
  upcoming: { label: "Segera Dibuka", color: "bg-yellow-500/10 text-yellow-600" },
  closed: { label: "Pendaftaran Ditutup", color: "bg-red-500/10 text-red-600" },
  ongoing: { label: "Sedang Berlangsung", color: "bg-blue-500/10 text-blue-600" },
};

export function EventsSection({ events }) {
  // Fallback jika data tidak ada
  const eventList = events || [];
  return (
    <section id="events" className="section-gray px-4 py-20 sm:px-6 sm:py-28">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-12 sm:mb-16 text-center">
          <p className="mb-3 text-sm font-medium text-primary">EVENT</p>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Event Kompetisi</h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">Temukan dan ikuti kompetisi yang sedang berlangsung</p>
          <div className="mt-6">
            <Button variant="outline" className="gap-2" asChild>
              <Link href="/events">
                Lihat Semua <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
          {eventList.map((event) => {
            const status = statusConfig[event.status] ?? statusConfig.open;
            const categories = Array.isArray(event.categories) ? event.categories : [];
            const primaryCategory = categories[0]?.name || event.category;
            const isOpen = (event.status || "").toLowerCase() === "open";
            return (
              <div
                key={event.id}
                className="group cursor-pointer rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-lg"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      {primaryCategory}
                    </span>
                    {categories.length > 1 && (
                      <span className="rounded-full bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
                        +{categories.length - 1} kategori
                      </span>
                    )}
                    {event.isFeatured && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-2 py-0.5 text-xs font-semibold text-yellow-700">
                        <Star className="h-3 w-3 text-yellow-500" />
                        Unggulan
                      </span>
                    )}
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status.color}`}>
                    {status.label}
                  </span>
                </div>

                <h3 className="mb-4 text-lg font-semibold transition-colors group-hover:text-primary">
                  {event.name}
                </h3>

                {categories.length > 0 && (
                  <div className="mb-4 space-y-1 rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
                    {categories.map((category) => {
                      const quotaValue = category?.quota ?? "-";
                      return (
                        <div key={category?.id || category?.name} className="flex items-center justify-between gap-2">
                          <span className="font-medium text-foreground/80">
                            {category?.name || "Kategori"}
                          </span>
                          <span>Kuota {quotaValue}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="mb-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {formatDate(event.date)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {event.location}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    {event.participantCount > 0 ? `${event.participantCount} Tim Terdaftar` : "Pendaftaran segera dibuka"}
                  </div>
                </div>

                <Button
                  asChild
                  variant={event.status === "open" ? "default" : "outline"}
                  className="w-full"
                >
                  <Link href={event.status === "open" ? "/events" : event.status === "upcoming" ? "/events" : "/champions"}>
                    {event.status === "open"
                      ? "Daftar Sekarang"
                      : event.status === "upcoming"
                      ? "Lihat Detail"
                      : "Lihat Hasil"}
                  </Link>
                </Button>
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Button variant="outline" className="gap-2" asChild>
            <Link href="/events">
              Lihat Semua Event <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
