"use client";

import Image from "next/image";
import { MessageCircle } from "lucide-react";

export function PesertaMerchandiseCard({ item, photo, priceLabel, stockLabel, stockClass, orderLink }) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm transition hover:shadow-md">
      {/* Image */}
      <div className="relative h-36 w-full overflow-hidden bg-muted">
        {photo ? (
          <Image
            src={photo}
            alt={item.name}
            fill
            className="object-cover transition duration-300 hover:scale-110"
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
            Belum ada foto
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        {/* Title & Description */}
        <div className="min-h-14">
          <h3 className="text-sm font-semibold leading-tight text-foreground line-clamp-2">
            {item.name}
          </h3>
        </div>

        {/* Price & Stock */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
              {priceLabel}
            </span>
            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${stockClass}`}>
              {stockLabel}
            </span>
          </div>
        </div>

        {/* Buy Button */}
        <div className="mt-auto pt-2">
          {orderLink ? (
            <a
              href={orderLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-3 py-2.5 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90 active:scale-95"
            >
              <MessageCircle className="h-4 w-4" />
              Beli via WhatsApp
            </a>
          ) : (
            <div className="flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-border bg-muted/30 px-3 py-2.5 text-xs font-medium text-muted-foreground">
              <MessageCircle className="h-4 w-4" />
              Kontak belum tersedia
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
