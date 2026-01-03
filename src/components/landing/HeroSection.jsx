
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, MapPin, Star } from "lucide-react";
import { formatDate } from "@/lib/formatters";
import Countdown from "@/components/landing/Countdown";

export function HeroSection({ heroEvent, stats }) {
  // Gunakan heroEvent langsung jika ada, jika tidak pakai fallback
  const event = heroEvent ? {
    name: heroEvent.name || "Event Unggulan",
    date: heroEvent.date, // jangan override! keep as-is dari backend
    location: heroEvent.location || "-",
    stats: { participantCount: heroEvent.stats?.participantCount || 0 },
    status: heroEvent.status || "upcoming",
    isFeatured: heroEvent.isFeatured,
    categories: Array.isArray(heroEvent.categories) ? heroEvent.categories : [],
  } : {
    name: "Kejuaraan LKBB Nasional 2024",
    date: new Date("2024-12-15").toISOString(), // valid ISO untuk Countdown
    location: "Stadion Utama Gelora Bung Karno, Jakarta",
    stats: { participantCount: 52 },
    status: "open",
    isFeatured: false,
    categories: [],
  };
  
  const statData = stats || {
    totalEvents: 50,
    registeredTeams: 500,
    individualMembers: 10000,
  };

  return (
    <section className="section-white relative flex min-h-[90vh] items-center overflow-hidden px-4 pt-20 sm:px-6">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />
      <div className="absolute right-0 top-1/4 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />

      <div className="container relative z-10 mx-auto max-w-6xl">
        <div className="grid items-center gap-8 sm:gap-12 lg:grid-cols-2">
          <div className="space-y-8">
            <div>
              <span className="mb-6 inline-block rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                Liga Pembaris by Alpha Creative
              </span>
              <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl">
                Kompetisi Baris
                <span className="text-primary"> Berbaris</span>
              </h1>
              <p className="mt-6 max-w-lg text-lg text-muted-foreground">
                Temukan event kompetisi LKBB terkini. Daftar sebagai peserta dan pantau hasil perlombaan secara real-time.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="gap-2" asChild>
                <Link href="/events">
                  Lihat Semua Event
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="gap-2" asChild>
                <Link href="/auth/register">
                  Daftar Sekarang
                </Link>
              </Button>
            </div>

            <div className="flex gap-8 pt-4">
              <div>
                <p className="text-3xl font-bold text-primary">{statData.totalEvents}+</p>
                <p className="text-sm text-muted-foreground">Event Tahun Ini</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-primary">{statData.registeredTeams}+</p>
                <p className="text-sm text-muted-foreground">Tim Terdaftar</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-primary">{statData.individualMembers}+</p>
                <p className="text-sm text-muted-foreground">Peserta</p>
              </div>
            </div>
          </div>

          <div className="relative space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xl">
              <div className="mb-4 flex items-center gap-2">
                  <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-600">
                    {event.status}
                  </span>
                  {event.isFeatured && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-3 py-1 text-xs font-semibold text-yellow-700">
                      <Star className="h-3 w-3 text-yellow-500" />
                      Unggulan
                    </span>
                  )}
                  {!event.isFeatured && (
                    <span className="text-xs text-muted-foreground">Event Unggulan</span>
                  )}
                </div>

              <h3 className="mb-4 text-xl font-bold">{event.name}</h3>

              <div className="mb-6 space-y-3">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 text-primary" />
                  {formatDate(event.date)}
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 text-primary" />
                  {event.location}
                </div>
                {/* Kategori detail disembunyikan di hero karena kurang relevan */}
              </div>

              <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
                <div>
                  <p className="text-2xl font-bold text-primary">{event.stats?.participantCount || 0}</p>
                  <p className="text-xs text-muted-foreground">Tim Terdaftar</p>
                </div>
                <Button size="sm">
                  <Link href="/events">
                    Daftar Sekarang
                  </Link>
                </Button>
              </div>

              <p className="text-center text-xs text-muted-foreground">
                {/* Anda bisa menambahkan info pendaftaran dari event jika ada */}
                Pendaftaran ditutup segera
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-6 shadow-xl">
              <p className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wide">Hitung Mundur</p>
              <Countdown target={event.date} />
            </div>

            <div className="absolute -z-10 left-4 top-4 h-96 w-full rounded-2xl bg-primary/10" />
          </div>
        </div>
      </div>
    </section>
  );
}
