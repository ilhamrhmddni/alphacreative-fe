"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { formatCurrency } from "@/lib/formatters";
import { resolveMediaUrl } from "@/lib/utils";
import { MessageCircle } from "lucide-react";
import { MerchandiseCard } from "./merchandise-card";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
const DEFAULT_LIMIT = 200;

function mapMerchandiseItem(item) {
  if (!item) return null;
  return {
    id: item.id,
    name: item.name || "Produk",
    productCode: item.productCode || "",
    category: item.category || null,
    description: item.description || "",
    price: item.price === undefined ? null : item.price,
    stock: item.stock === undefined ? null : item.stock,
    photoPath: item.photoPath || null,
    createdAt: item.createdAt || null,
  };
}

function sanitizeWhatsapp(number) {
  if (!number) return "";
  if (typeof number !== "string") return String(number);
  return number.replace(/\D+/g, "");
}

function buildWhatsappLink(number, item) {
  if (!number || !item?.productCode || !item?.name) return null;
  const digits = sanitizeWhatsapp(number);
  if (!digits) return null;
  const message = `Halo, saya ingin pesan ${item.name} (Kode: ${item.productCode}).`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

function formatWhatsappDisplay(number) {
  if (!number) return "";
  const trimmed = String(number).trim();
  if (!trimmed) return "";
  const digits = sanitizeWhatsapp(trimmed);
  if (!digits) return trimmed;
  if (digits.startsWith("62")) {
    return `+${digits}`;
  }
  if (digits.startsWith("0")) {
    return digits;
  }
  return `+${digits}`;
}

function buildWhatsappContactLink(number) {
  const digits = sanitizeWhatsapp(number);
  if (!digits) return null;
  return `https://wa.me/${digits}`;
}

async function fetchMerchandise(abortSignal) {
  try {
    const params = new URLSearchParams();
    params.set("limit", String(DEFAULT_LIMIT));
    params.set("published", "true");

    const res = await fetch(`${API_URL}/merchandise?${params.toString()}`, {
      signal: abortSignal,
    });

    if (!res.ok) {
      return { items: [], whatsappNumber: null };
    }

    const payload = await res.json();
    const rawItems = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.data)
        ? payload.data
        : [];
    const whatsappNumber = payload?.contact?.whatsappNumber || null;

    const mapped = rawItems.map(mapMerchandiseItem).filter(Boolean);

    return {
      items: mapped,
      whatsappNumber,
    };
  } catch (err) {
    console.error("Error fetching merchandise:", err);
    return { items: [], whatsappNumber: null };
  }
}

export default function MerchandisePage() {
  const [merchandise, setMerchandise] = useState([]);
  const [whatsappNumber, setWhatsappNumber] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const abortController = new AbortController();

    const loadMerchandise = async () => {
      try {
        const data = await fetchMerchandise(abortController.signal);
        setMerchandise(data.items);
        setWhatsappNumber(data.whatsappNumber);
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error("Failed to load merchandise:", error);
        }
      } finally {
        setLoading(false);
      }
    };

    loadMerchandise();

    return () => abortController.abort();
  }, []);

  const whatsappDisplay = formatWhatsappDisplay(whatsappNumber);
  const whatsappContactLink = buildWhatsappContactLink(whatsappNumber);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="pt-16">
        <div className="container mx-auto max-w-6xl px-4 py-10 md:py-16">
          <header className="mb-10">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-bold md:text-3xl">Katalog Merchandise</h1>
                <p className="mt-1 max-w-2xl text-sm text-muted-foreground md:text-base">
                  Temukan produk resmi Alpha Creative Space. Setiap pembelian mendukung kegiatan dan kompetisi kami.
                </p>
              </div>
              <Link
                href="/"
                className="inline-flex items-center gap-2 self-start rounded-md border border-border bg-card px-3 py-2 text-xs font-semibold text-primary transition-colors hover:border-primary/40 hover:text-primary md:self-auto md:text-sm"
              >
                ← Kembali ke Beranda
              </Link>
            </div>
          </header>

          <div className="mb-8 rounded-xl border border-border/60 bg-muted/10 px-5 py-4 text-sm text-muted-foreground md:px-6 md:py-5">
            Jelajahi katalog merchandise resmi kami. Setiap produk tersedia dalam jumlah terbatas, segera hubungi tim jika ingin memesan.
          </div>

          {merchandise.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/60 bg-muted/10 px-6 py-12 text-center text-sm text-muted-foreground md:text-base">
              Merchandise belum tersedia. Silakan kembali lagi nanti.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 md:gap-6">
              {merchandise.map((item, index) => {
                const orderLink = buildWhatsappLink(whatsappNumber, item);
                const photo = item.photoPath ? resolveMediaUrl(item.photoPath) || item.photoPath : null;
                const priceLabel =
                  item.price === null || item.price === undefined
                    ? "Harga segera diumumkan"
                    : formatCurrency(item.price);
                const stockValue = Number(item.stock);
                let stockLabel = "Stok: -";
                let stockClass = "border-border bg-muted/40 text-muted-foreground";
                if (!Number.isNaN(stockValue)) {
                  if (stockValue <= 0) {
                    stockLabel = "Stok habis";
                    stockClass = "border-rose-200 bg-rose-50 text-rose-600";
                  } else {
                    stockLabel = `Stok: ${stockValue}`;
                    stockClass = "border-emerald-200 bg-emerald-50 text-emerald-600";
                  }
                }

                return (
                  <MerchandiseCard
                    key={item.id ?? `merch-${index}`}
                    item={item}
                    photo={photo}
                    priceLabel={priceLabel}
                    stockLabel={stockLabel}
                    stockClass={stockClass}
                    orderLink={orderLink}
                  />
                );
              })}
            </div>
          )}

          {whatsappDisplay ? (
            <div className="mt-10 rounded-xl border border-primary/30 bg-primary/5 p-4 text-sm text-primary md:flex md:items-center md:justify-between md:gap-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <MessageCircle className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold">Pesan langsung via WhatsApp</p>
                  <p className="text-xs text-primary/80">{whatsappDisplay}</p>
                </div>
              </div>
              {whatsappContactLink ? (
                <a
                  href={whatsappContactLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90 md:mt-0"
                >
                  <MessageCircle className="h-4 w-4" />
                  Buka Chat
                </a>
              ) : null}
            </div>
          ) : null}

          <footer className="mt-10 flex flex-col gap-4 border-t border-border pt-6 md:flex-row md:items-center md:justify-between md:gap-6">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Total merchandise tersedia: {merchandise.length}
              </p>
              {whatsappDisplay ? (
                <p className="text-xs text-muted-foreground/80">
                  Hubungi {whatsappDisplay} untuk informasi pemesanan lebih lanjut.
                </p>
              ) : null}
            </div>
            {whatsappContactLink ? (
              <a
                href={whatsappContactLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-md border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground transition hover:border-primary/40 hover:text-primary"
              >
                Buka katalog WhatsApp →
              </a>
            ) : null}
          </footer>
        </div>
      </main>
      <Footer />
    </div>
  );
}
