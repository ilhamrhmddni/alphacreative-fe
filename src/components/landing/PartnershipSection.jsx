"use client";

import { useMemo, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { resolveMediaUrl } from "@/lib/utils";

const DEFAULT_PARTNERS = [
  {
    name: "Alpha Creative space",
    role: "Event Partner",
    description: "Kolaborasi program pelatihan dan showcase baris berbaris lintas daerah.",
    logo: null,
  },
  {
    name: "Marching Innovators",
    role: "Community",
    description: "Pengembangan kurikulum kompetisi dan juri independen.",
    logo: null,
  },
  {
    name: "Sanggar space",
    role: "Creative Studio",
    description: "Produksi materi visual dan dokumentasi event nasional.",
    logo: null,
  },
  {
    name: "TNI AL Muda",
    role: "Pembina",
    description: "Pendampingan disiplin baris-berbaris dan protokol upacara.",
    logo: null,
  },
];

function normalizeItems(items = []) {
  return items
    .map((item, idx) => {
      const rawLogo = item.logoPath || item.logo;
      const imageSrc = resolveMediaUrl(rawLogo) || rawLogo || null;
      return {
        id: item.id || `${item.name || "item"}-${idx}`,
        name: item.name || "Partner",
        role: item.role || "",
        description: item.description || "",
        logo: imageSrc,
        fallback: item.name?.[0] || "A",
      };
    })
    .filter(Boolean);
}

export function PartnershipSection({ collaborations, sponsors }) {
  const sliderRef = useRef(null);

  const items = useMemo(() => {
    const merged = [
      ...(Array.isArray(collaborations) ? collaborations : []),
      ...(Array.isArray(sponsors) ? sponsors : []),
    ];
    const source = merged.length ? merged : DEFAULT_PARTNERS;
    return normalizeItems(source);
  }, [collaborations, sponsors]);

  function handleScroll(direction) {
    const node = sliderRef.current;
    if (!node) return;

    const scrollStep = 280 * Math.sign(direction || 1);
    const maxScroll = node.scrollWidth - node.clientWidth;
    if (maxScroll <= 0) return;

    const tolerance = 12;
    const atStart = node.scrollLeft <= tolerance;
    const atEnd = node.scrollLeft + node.clientWidth >= node.scrollWidth - tolerance;

    if (direction > 0 && atEnd) {
      node.scrollTo({ left: 0, behavior: "smooth" });
      return;
    }

    if (direction < 0 && atStart) {
      node.scrollTo({ left: maxScroll, behavior: "smooth" });
      return;
    }

    node.scrollBy({ left: scrollStep, behavior: "smooth" });
  }

  if (!items.length) {
    return null;
  }

  return (
    <section id="partnership" className="section-white px-4 py-20 sm:px-6 sm:py-28">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-12 sm:mb-16 text-center">
          <p className="mb-3 text-sm font-medium text-primary">KOLABORASI</p>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Bergerak Bersama Mewujudkan Kompetisi Terbaik
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            Mitra yang mendukung penyelenggaraan dan pengembangan program LKBB,
            menghadirkan dukungan nyata dalam bentuk fasilitas, teknologi, dan
            kolaborasi strategis.
          </p>
        </div>

        <div className="mt-8 flex items-center justify-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-full"
            onClick={() => handleScroll(-1)}
            aria-label="Geser ke kiri"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-full"
            onClick={() => handleScroll(1)}
            aria-label="Geser ke kanan"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        <div className="relative mt-10">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background via-background/70 to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background via-background/70 to-transparent" />

          <div
            ref={sliderRef}
            className="flex gap-4 overflow-x-hidden pb-2 pr-1"
          >
            {items.map((item) => (
              <article
                key={item.id}
                className="flex min-w-[260px] max-w-sm flex-col gap-3 rounded-2xl border border-border bg-card/90 p-5 shadow-sm backdrop-blur-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-16 w-24 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted">
                    {item.logo ? (
                      <Image
                        src={item.logo}
                        alt={item.name}
                        width={120}
                        height={72}
                        className="h-full w-auto object-contain"
                      />
                    ) : (
                      <span className="text-sm font-semibold text-muted-foreground">
                        {item.fallback}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {item.name}
                    </p>
                    {item.role && (
                      <p className="truncate text-xs text-muted-foreground">
                        {item.role}
                      </p>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-muted-foreground">
          Tertarik menjadi mitra? Hubungi kami untuk paket kolaborasi yang sesuai
          kebutuhan Anda.
        </div>
      </div>
    </section>
  );
}
