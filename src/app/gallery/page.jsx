"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ImageIcon } from "lucide-react";

import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { resolveMediaUrl } from "@/lib/utils";

function getApiBaseUrl() {
  const raw =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:4000/api";

  return raw.replace(/\/$/, "");
}

export default function GalleryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGallery = async () => {
      const API_BASE_URL = getApiBaseUrl();
      const formatter = new Intl.DateTimeFormat("id-ID", { dateStyle: "long" });

      try {
        let rawItems = [];
        
        try {
          const response = await fetch(`${API_BASE_URL}/public/gallery`);
          if (response.ok) {
            const payload = await response.json();
            rawItems = Array.isArray(payload?.data) ? payload.data : [];
          }
        } catch (error) {
          console.error("Error fetching gallery data:", error);
        }

        // Fallback to landing data if no gallery
        if (rawItems.length === 0) {
          try {
            const response = await fetch(`${API_BASE_URL}/public/landing`);
            if (response.ok) {
              const payload = await response.json();
              if (payload && Array.isArray(payload.gallery)) {
                rawItems = payload.gallery;
              }
            }
          } catch (error) {
            console.error("Error fetching fallback landing data:", error);
          }
        }

        const processedItems = rawItems
          .map((item, index) => {
            const photoUrl = resolveMediaUrl(item.photoPath) || item.photoPath || "";
            if (!photoUrl) {
              return null;
            }

            let uploadedAt = null;
            if (item.createdAt) {
              try {
                uploadedAt = formatter.format(new Date(item.createdAt));
              } catch (error) {
                console.error("Failed to format gallery date", error);
              }
            }

            return {
              id: item.id ?? index,
              title: item.title || `Dokumentasi ${index + 1}`,
              caption: item.caption || null,
              photoUrl,
              uploadedAt,
            };
          })
          .filter(Boolean);

        setItems(processedItems);
      } finally {
        setLoading(false);
      }
    };

    fetchGallery();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="pt-16">
        <section className="bg-muted/40 px-6 py-16">
          <div className="container mx-auto flex max-w-5xl flex-col gap-6">
            <div className="flex items-center gap-3 text-sm font-medium text-primary">
              <ImageIcon className="h-4 w-4" />
              Galeri Kegiatan
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                Galeri Foto Alpha Creative Nusantara
              </h1>
              <p className="mt-3 max-w-3xl text-sm text-muted-foreground">
                Lihat dokumentasi terbaik dari berbagai kegiatan Alpha Creative Nusantara. Setiap momen kami abadikan untuk menginspirasi dan mengenang perjalanan komunitas.
              </p>
            </div>
            <div>
              <Button asChild variant="ghost" className="gap-2 pl-0 text-primary">
                <Link href="/">
                  <ArrowLeft className="h-4 w-4" />
                  Kembali ke Beranda
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="px-6 py-16">
          <div className="container mx-auto max-w-6xl">
            {items.length ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {items.map((item, index) => (
                  <figure
                    key={item.id}
                    className="group overflow-hidden rounded-2xl border border-border bg-background shadow-sm transition-transform hover:-translate-y-1"
                  >
                    <div className="relative h-56 w-full overflow-hidden sm:h-64">
                      <Image
                        src={item.photoUrl}
                        alt={item.title}
                        fill
                        sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        priority={index < 2}
                        unoptimized
                      />
                    </div>
                    <figcaption className="space-y-2 px-5 py-4">
                      <p className="text-sm font-semibold text-foreground">{item.title}</p>
                      {item.caption && (
                        <p className="text-xs text-muted-foreground">{item.caption}</p>
                      )}
                      {item.uploadedAt && (
                        <p className="text-xs text-muted-foreground/80">Diunggah {item.uploadedAt}</p>
                      )}
                    </figcaption>
                  </figure>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border bg-muted/20 px-10 py-16 text-center">
                <ImageIcon className="h-10 w-10 text-muted-foreground" />
                <div>
                  <h2 className="text-lg font-semibold">Belum ada dokumentasi tersedia</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Tim kami sedang menyiapkan dokumentasi terbaik. Silakan cek kembali nanti atau jelajahi informasi lainnya di beranda.
                  </p>
                </div>
                <Button asChild>
                  <Link href="/">Kembali ke Beranda</Link>
                </Button>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
