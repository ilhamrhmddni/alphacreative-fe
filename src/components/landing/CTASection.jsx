import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, UserPlus, Trophy, Bell } from "lucide-react";

export function CTASection() {
  return (
    <section className="section-gray px-4 py-20 sm:px-6 sm:py-28">
      <div className="container mx-auto max-w-4xl">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-primary p-8 sm:p-12 text-center">
          <div className="pointer-events-none absolute inset-0 opacity-10">
            <div className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-card blur-3xl" style={{ width: 256, height: 256 }} />
            <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 rounded-full bg-card blur-3xl" style={{ width: 256, height: 256 }} />
          </div>

          <div className="relative z-10">
            <p className="mb-3 text-sm font-medium text-primary-foreground">BERGABUNG</p>
            <h2 className="text-3xl font-bold text-primary-foreground md:text-4xl">
              Siap Ikut Kompetisi?
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-primary-foreground/80">
              Daftarkan tim kamu sekarang dan ikuti berbagai kompetisi LKBB di seluruh Indonesia.
            </p>

            <div className="mt-6 mb-8 flex flex-wrap justify-center gap-6 text-sm text-primary-foreground/90">
              <div className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Pendaftaran Online
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Skor Real-time
              </div>
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notifikasi Update
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" className="gap-2 bg-card text-primary hover:bg-card/90">
                <Link href="/auth/register">
                  Daftar Sekarang
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/50 text-primary-foreground bg-transparent hover:bg-card/10"
              >
                <Link href="/events">Lihat Event</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
