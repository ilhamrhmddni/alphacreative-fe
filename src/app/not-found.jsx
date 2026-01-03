import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";

import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Halaman Tidak Ditemukan | Alpha Creative space",
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-6 py-24">
        <div className="mx-auto flex max-w-lg flex-col items-center gap-6 text-center">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Compass className="h-6 w-6" />
          </span>
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">404</p>
            <h1 className="text-3xl font-bold md:text-4xl">Halaman tidak ditemukan</h1>
            <p className="text-sm text-muted-foreground">
              Maaf, halaman yang Anda cari tidak tersedia atau sudah dipindahkan. Silakan kembali ke beranda atau lanjutkan ke dashboard.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
                Kembali ke Beranda
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/auth/login">Masuk ke Dashboard</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
