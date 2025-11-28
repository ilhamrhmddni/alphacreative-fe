import Image from "next/image";
import Link from "next/link";
import { Calendar, MapPin, Users, Ticket, Star } from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { formatDate, formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";

export const revalidate = 300;

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

const statusMap = {
  open: { label: "Pendaftaran Dibuka", tone: "bg-emerald-500/10 text-emerald-600" },
  upcoming: { label: "Segera Dibuka", tone: "bg-amber-500/10 text-amber-600" },
  ongoing: { label: "Sedang Berlangsung", tone: "bg-sky-500/10 text-sky-600" },
  closed: { label: "Pendaftaran Ditutup", tone: "bg-slate-400/20 text-slate-600" },
};

function normalizeStatus(status) {
  if (!status) return "upcoming";
  return String(status).toLowerCase();
}

function getCta(event) {
  const status = normalizeStatus(event.status);
  if (status === "open") {
    return { href: "/auth/register", label: "Daftar Sekarang", variant: "default", disabled: false };
  }
  if (status === "ongoing") {
    return { href: "/auth/login", label: "Pantau Hasil", variant: "outline", disabled: false };
  }
  if (status === "closed") {
    return { href: "/auth/login", label: "Lihat Rekap", variant: "outline", disabled: false };
  }
  return { href: "/auth/login", label: "Lihat Detail", variant: "outline", disabled: false };
}

export default async function EventsPage() {
  let events = [];

  try {
    const res = await fetch(`${API_URL}/events`, {
      next: { revalidate: 300 },
    });

    if (res.ok) {
      const raw = await res.json();
      events = (Array.isArray(raw) ? raw : []).map((item) => ({
        id: item.id,
        name: item.namaEvent || item.name || "Event Tanpa Nama",
        description: item.deskripsiEvent || item.description || "",
        date: item.tanggalEvent || item.date || null,
        location: item.tempatEvent || item.location || "Lokasi belum ditentukan",
        venue: item.venue || null,
        status: normalizeStatus(item.status),
        category: item.kategori || item.category || "Event Lainnya",
        isFeatured: Boolean(item.isFeatured),
        photoPath: item.photoPath || item.cover || null,
        kuota: item.kuota ?? null,
        biaya: item.biaya ?? null,
        participantCount: item.participantCount ?? item._count?.peserta ?? 0,
      }));
    }
  } catch (error) {
    console.error("Failed to fetch events:", error);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="pt-16">
        <div className="container mx-auto max-w-6xl px-4 py-10 md:py-16">
          <header className="mb-8 md:mb-12">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary/80">Event</p>
            <h1 className="mt-2 text-2xl font-bold md:text-3xl">Semua Event Kompetisi</h1>
            <p className="mt-3 max-w-3xl text-sm text-muted-foreground md:text-base">
              Temukan rangkaian kompetisi LKBB terbaru. Pilih event yang sesuai dan segera daftar bersama tim Anda.
            </p>
            <div className="mt-4 flex">
              <Button variant="ghost" size="sm" asChild className="gap-2">
                <Link href="/">
                  ← Kembali ke Beranda
                </Link>
              </Button>
            </div>
          </header>

          {events.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border/60 bg-muted/10 p-8 text-center text-sm text-muted-foreground">
              Belum ada event yang dapat ditampilkan saat ini. Silakan kembali lagi nanti.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 md:gap-6">
              {events.map((event) => {
                const status = statusMap[event.status] ?? statusMap["upcoming"];
                const cta = getCta(event);
                return (
                  <article
                    key={event.id}
                    className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-md"
                  >
                    {event.photoPath && (
                      <div className="relative h-44 w-full overflow-hidden">
                        <Image src={event.photoPath} alt={event.name} fill className="object-cover" sizes="(min-width: 768px) 50vw, 100vw" />
                      </div>
                    )}

                    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
                      <div className="flex flex-col gap-3">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                              {event.category}
                            </span>
                            {event.isFeatured && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-3 py-1 text-xs font-semibold text-yellow-700">
                                <Star className="h-3.5 w-3.5 text-yellow-500" />
                                Unggulan
                              </span>
                            )}
                          </div>
                          <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", status.tone)}>
                            {status.label}
                          </span>
                        </div>

                        <div>
                          <h2 className="text-lg font-semibold md:text-xl">{event.name}</h2>
                          {event.description && (
                            <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                              {event.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-primary" />
                          <span>{formatDate(event.date)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-primary" />
                          <span>
                            {event.location}
                            {event.venue ? ` • ${event.venue}` : ""}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-primary" />
                          <span>
                            {event.participantCount > 0
                              ? `${event.participantCount} tim terdaftar`
                              : "Menunggu peserta"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Ticket className="h-4 w-4 text-primary" />
                          <span>
                            {event.biaya == null ? "Gratis" : formatCurrency(event.biaya)}
                            {event.kuota ? ` • Kuota ${event.kuota} tim` : ""}
                          </span>
                        </div>
                      </div>

                      <div className="mt-auto pt-2">
                        <Button asChild size="sm" variant={cta.variant} className="w-full" disabled={cta.disabled}>
                          <Link href={cta.href}>
                            {cta.label}
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
