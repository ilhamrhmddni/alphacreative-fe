import Image from "next/image";
import Link from "next/link";
import { formatDate } from "@/lib/formatters";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowLeft, Home } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function NewsDetail({ params }) {
  const routeParams = await params;
  const { id } = routeParams;
  let item = null;
  
  try {
    // Try 127.0.0.1 first (localhost binding)
    const urls = [
      "http://127.0.0.1:4000/api",
      "http://localhost:4000/api",
      process.env.INTERNAL_API_URL || "http://localhost:4000/api"
    ];
    
    for (const apiUrl of urls) {
      try {
        const res = await Promise.race([
          fetch(`${apiUrl}/berita/${id}`, { headers: { 'Accept': 'application/json' } }),
          new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 3000))
        ]);
        
        if (res && res.ok) {
          const data = await res.json();
          item = data;
          console.log(`[news/[id]] Successfully fetched from ${apiUrl}`);
          break;
        }
      } catch (err) {
        console.log(`[news/[id]] Failed with ${apiUrl}: ${err.message}`);
        continue;
      }
    }
  } catch (err) {
    console.error("[news/[id]] All fetch attempts failed:", err.message);
  }

  if (!item) {
    console.error(`[news/[id]] Failed to fetch berita with id=${id}, returning notFound`);
    return notFound();
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="pt-16">
        <div className="container mx-auto px-3 py-6 md:px-4 md:py-12 max-w-3xl">
          <header className="mb-6 md:mb-8 border-b border-border pb-4 md:pb-6">
            <div>
              <span className="inline-block rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary mb-3">{(item.tags && item.tags[0]) || 'Berita'}</span>
              <h1 className="text-2xl md:text-3xl font-bold leading-snug line-clamp-2">{item.title}</h1>
            </div>
            <div className="mt-3 text-xs md:text-sm text-muted-foreground/75 flex flex-wrap items-center gap-2 md:gap-4">
              <span>Dipublikasikan {formatDate(item.tanggal || item.date || item.createdAt)}</span>
              {item.event && (
                <a href={`/events/${item.event.id}`} className="text-primary hover:underline">• Acara: {item.event.name}</a>
              )}
            </div>
          </header>

          <article className="mb-8 md:mb-12">
            {item.photoPath && (
              <div className="mb-6 md:mb-8 w-full relative h-48 md:h-96 rounded overflow-hidden border border-border">
                <Image src={item.photoPath} alt={item.title} fill className="object-cover" unoptimized priority={false} />
              </div>
            )}
            <div className="prose max-w-none prose-sm md:prose-base">
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{item.deskripsi}</p>
            </div>
            {(item.tags && item.tags.length > 0) && (
              <div className="mt-6 md:mt-8 flex flex-wrap gap-2">
                <p className="w-full text-xs font-medium text-muted-foreground">Tags:</p>
                {item.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-primary/20 bg-primary/5 px-3 py-0.5 text-xs font-medium text-primary"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </article>

          <footer className="border-t border-border pt-6 md:pt-8 text-xs text-muted-foreground/60">
            <div className="mb-4 pb-4 border-b border-border/50 space-y-3">
              <p className="font-medium">Lanjutkan membaca</p>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                <Button asChild size="sm" className="w-full sm:w-auto">
                  <Link href="/news">
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                    Kembali ke Daftar Berita
                  </Link>
                </Button>
                <Button asChild size="sm" variant="outline" className="w-full sm:w-auto">
                  <Link href="/">
                    <Home className="h-4 w-4" aria-hidden="true" />
                    Kembali ke Beranda
                  </Link>
                </Button>
              </div>
            </div>
            <div className="flex flex-col gap-1 text-xs text-muted-foreground/50">
              <p>© 2025 AlphaCreative Events</p>
              <p>Terima kasih telah membaca berita kami</p>
            </div>
          </footer>
        </div>
      </main>
      <Footer />
    </div>
  );
}
