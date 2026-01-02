"use client";

import Image from "next/image";
import { ShoppingBag, MessageCircle } from "lucide-react";

export function MerchandiseListItem({ item, thumb, waLink, itemPrice }) {
  return (
    <div className="flex gap-2.5 p-3 transition hover:bg-muted/50">
      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-border bg-muted">
        {thumb ? (
          <Image
            src={thumb}
            alt={item.name}
            fill
            className="object-cover"
            sizes="64px"
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
            <ShoppingBag className="h-5 w-5 opacity-30" />
          </div>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="text-sm font-semibold leading-tight text-foreground line-clamp-2">
          {item.name}
        </p>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
            {item.productCode || "-"}
          </span>
          {item.category && (
            <span className="rounded-full border border-border bg-muted/40 px-2 py-0.5 text-[10px] font-medium text-foreground">
              {item.category}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-primary">{itemPrice}</span>
          {waLink ? (
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-md border border-primary bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary transition hover:bg-primary/20"
              onClick={(e) => e.stopPropagation()}
            >
              <MessageCircle className="h-3 w-3" /> Pesan
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}
