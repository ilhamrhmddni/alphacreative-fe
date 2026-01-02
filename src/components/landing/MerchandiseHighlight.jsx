"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag, MessageCircle } from "lucide-react";

export function MerchandiseHighlight({ highlight, highlightImage, highlightPrice, highlightLink }) {
  const router = useRouter();

  const handleCardClick = (e) => {
    // Don't navigate if clicking the WhatsApp button
    if (e.target.closest('a[target="_blank"]')) {
      return;
    }
    router.push(`/merchandise/${highlight.id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group block cursor-pointer transition hover:bg-muted/30"
    >
      <div className="grid gap-0 md:grid-cols-2">
        {highlightImage ? (
          <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted md:aspect-auto md:h-full">
            <Image
              src={highlightImage}
              alt={highlight.name}
              fill
              className="object-cover transition duration-500 group-hover:scale-105"
              sizes="(min-width: 768px) 50vw, 100vw"
              unoptimized
            />
          </div>
        ) : (
          <div className="relative aspect-[16/10] w-full overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 md:aspect-auto md:h-full">
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <ShoppingBag className="h-16 w-16 opacity-20" />
            </div>
          </div>
        )}
        <div className="flex flex-col justify-between gap-6 p-6 md:p-8">
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                UNGGULAN
              </span>
              <span className="rounded-md border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
                {highlight.productCode || "-"}
              </span>
            </div>
            <h3 className="mb-3 text-2xl font-bold leading-tight text-foreground md:text-3xl">
              {highlight.name}
            </h3>
            <p className="mb-4 text-sm leading-relaxed text-muted-foreground line-clamp-3 md:text-base">
              {highlight.description || "Merchandise resmi Alpha Creative berkualitas premium."}
            </p>
            <div className="inline-flex items-baseline gap-2">
              <span className="text-3xl font-bold text-primary">
                {highlightPrice}
              </span>
              {highlight.category && (
                <span className="text-sm text-muted-foreground">• {highlight.category}</span>
              )}
            </div>
          </div>
          {highlightLink && (
            <a
              href={highlightLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 md:w-auto"
            >
              <MessageCircle className="h-4 w-4" />
              Pesan via WhatsApp
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
