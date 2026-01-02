"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";

export function MerchandiseCard({ item, photo, priceLabel, stockLabel, stockClass, orderLink }) {
  const router = useRouter();

  const handleCardClick = (e) => {
    // Don't navigate if clicking the WhatsApp button
    if (e.target.closest('a[target="_blank"]')) {
      return;
    }
    router.push(`/merchandise/${item.id}`);
  };

  return (
    <article
      onClick={handleCardClick}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition hover:-translate-y-[2px] hover:border-primary/40 hover:shadow-md cursor-pointer"
    >
      <div className="relative h-28 w-full overflow-hidden md:h-32">
        {photo ? (
          <Image
            src={photo}
            alt={item.name}
            fill
            className="object-cover transition duration-700 group-hover:scale-105"
            sizes="(min-width: 768px) 50vw, 100vw"
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
            Belum ada foto
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="rounded-full bg-primary/10 px-3 py-1 font-semibold uppercase tracking-wide text-primary">
            {item.productCode || "-"}
          </span>
          {item.category && (
            <span className="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-medium text-foreground">
              {item.category}
            </span>
          )}
          <span className="rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-medium text-primary" title="Harga">
            {priceLabel}
          </span>
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${stockClass}`}>
            {stockLabel}
          </span>
        </div>
        <div>
          <h2 className="text-lg font-semibold leading-snug text-foreground md:text-xl">
            {item.name}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
            {item.description || "Belum ada deskripsi."}
          </p>
        </div>
        <div className="mt-auto pt-2">
          {orderLink ? (
            <a
              href={orderLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-md bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90 w-full"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              Pesan Sekarang
            </a>
          ) : (
            <span className="flex items-center justify-center gap-2 rounded-md bg-muted/50 px-3 py-2 text-xs font-medium text-muted-foreground cursor-not-allowed w-full">
              <MessageCircle className="h-3.5 w-3.5" />
              Kontak Tidak Tersedia
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
