import Image from "next/image";
import Link from "next/link";
import { ImageIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { resolveMediaUrl } from "@/lib/utils";

export function GallerySection({ items = [] }) {
  const normalized = Array.isArray(items)
    ? items
        .map((item, index) => ({
          id: item.id ?? index,
          title: item.title || `Foto ${index + 1}`,
          caption: item.caption || "",
          photoUrl: resolveMediaUrl(item.photoPath) || item.photoPath || "",
        }))
        .filter((item) => !!item.photoUrl)
    : [];

  const featured = normalized.slice(0, 4);
  const hasMore = normalized.length > 4;
  const showLink = normalized.length > 0;

  if (!featured.length) {
    return null;
  }

  return (
    <section id="gallery" className="section-gray px-4 py-20 sm:px-6 sm:py-28">
      <span aria-hidden="true" className="-mt-20 block h-0" />
      <div className="container mx-auto max-w-6xl">
        <div className="mb-12 sm:mb-16 text-center">
          <p className="mb-3 text-sm font-medium text-primary">GALERI KEGIATAN</p>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Kilas Momen Alpha Creative
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            Nikmati dokumentasi foto-foto pilihan dari berbagai kegiatan Alpha Creative space.
          </p>
          {showLink && (
            <div className="mt-6">
              <Button asChild variant="outline">
                <Link href="/gallery">Lihat Semua Foto</Link>
              </Button>
            </div>
          )}
        </div>

        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((item) => (
            <figure
              key={item.id}
              className="group overflow-hidden rounded-2xl border border-border bg-background shadow-sm transition-transform hover:-translate-y-1"
            >
              <div className="relative h-52 w-full overflow-hidden">
                <Image
                  src={item.photoUrl}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  unoptimized
                />
              </div>
              <figcaption className="space-y-1 px-5 py-4">
                <p className="text-sm font-semibold text-foreground">{item.title}</p>
                {item.caption && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{item.caption}</p>
                )}
              </figcaption>
            </figure>
          ))}
        </div>

        {hasMore && (
          <div className="mt-10 flex justify-center md:hidden">
            <Button asChild variant="outline">
              <Link href="/gallery">Lihat Semua Foto</Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
