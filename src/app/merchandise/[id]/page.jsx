import Image from "next/image";
import Link from "next/link";
import { formatCurrency } from "@/lib/formatters";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { resolveMediaUrl } from "@/lib/utils";
import { ArrowLeft, Home, MessageCircle, ShoppingBag } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
const envStaticLimit = Number(process.env.MERCH_STATIC_PARAMS_LIMIT);
const STATIC_PARAMS_LIMIT = Number.isFinite(envStaticLimit) && envStaticLimit > 0 ? envStaticLimit : 50;
const envStaticRevalidate = Number(process.env.MERCH_STATIC_PARAMS_REVALIDATE);
const STATIC_PARAMS_REVALIDATE = Number.isFinite(envStaticRevalidate) && envStaticRevalidate >= 60 ? envStaticRevalidate : 300;
const envDetailRevalidate = Number(process.env.MERCH_DETAIL_REVALIDATE);
const DETAIL_REVALIDATE_SECONDS = Number.isFinite(envDetailRevalidate) && envDetailRevalidate >= 60 ? envDetailRevalidate : 60;

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

export async function generateStaticParams() {
  try {
    const res = await fetch(`${API_URL}/merchandise`, {
      next: { revalidate: STATIC_PARAMS_REVALIDATE },
    });
    if (!res.ok) {
      return [];
    }
    const payload = await res.json();
    const items = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.data)
      ? payload.data
      : [];
    return items
      .filter((item) => item?.id != null)
      .slice(0, STATIC_PARAMS_LIMIT)
      .map((item) => ({ id: String(item.id) }));
  } catch (err) {
    console.warn("generateStaticParams merchandise gagal:", err);
    return [];
  }
}

export default async function MerchandiseDetail({ params }) {
  const routeParams = await params;
  const { id } = routeParams;
  let item = null;
  let whatsappNumber = null;

  try {
    const res = await fetch(`${API_URL}/merchandise/${id}`, { 
      next: { revalidate: DETAIL_REVALIDATE_SECONDS } 
    });
    if (res.ok) {
      const data = await res.json();
      item = data;
      whatsappNumber = data.whatsappNumber || null;
    }
  } catch (err) {
    console.error("Error fetching merchandise detail:", err);
  }

  if (!item) {
    return notFound();
  }

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

  const orderLink = buildWhatsappLink(whatsappNumber, item);
  const whatsappDisplay = formatWhatsappDisplay(whatsappNumber);
  
  console.log('[Merch Detail] Final values:', { 
    whatsappNumber, 
    orderLink, 
    whatsappDisplay,
    itemName: item.name,
    itemCode: item.productCode 
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="pt-16">
        <div className="container mx-auto px-3 py-6 md:px-4 md:py-12 max-w-4xl">
          <header className="mb-6 md:mb-8 border-b border-border pb-4 md:pb-6">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
                {item.productCode || "-"}
              </span>
              {item.category && (
                <span className="inline-block rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-medium text-foreground">
                  {item.category}
                </span>
              )}
            </div>
            <h1 className="text-xl md:text-3xl font-bold leading-snug mb-4">{item.name}</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm md:text-base">
              <span className={`rounded-full px-4 py-1.5 text-sm font-medium ${stockClass}`}>
                {stockLabel}
              </span>
              <span className="rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-sm font-semibold text-primary">
                {priceLabel}
              </span>
            </div>
          </header>

          <article className="mb-8 md:mb-12">
            {photo ? (
              <div className="mb-6 md:mb-8 w-full relative h-64 md:h-96 rounded-lg overflow-hidden border border-border">
                <Image 
                  src={photo} 
                  alt={item.name} 
                  fill 
                  className="object-cover" 
                  unoptimized 
                  priority={false} 
                />
              </div>
            ) : (
              <div className="mb-6 md:mb-8 w-full h-64 md:h-96 rounded-lg overflow-hidden border border-dashed border-border bg-muted/20 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <ShoppingBag className="h-12 w-12 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Foto belum tersedia</p>
                </div>
              </div>
            )}

            <div className="prose max-w-none prose-sm md:prose-base mb-8">
              <h2 className="text-lg md:text-xl font-semibold mb-3">Deskripsi Produk</h2>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {item.description || "Belum ada deskripsi untuk produk ini."}
              </p>
            </div>

            {orderLink ? (
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-5">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h3 className="text-base font-semibold text-primary mb-1">Tertarik dengan produk ini?</h3>
                    <p className="text-sm text-primary/80">
                      Pesan sekarang melalui WhatsApp {whatsappDisplay}
                    </p>
                  </div>
                  <a
                    href={orderLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 whitespace-nowrap"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Pesan via WhatsApp
                  </a>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-muted/50 p-5">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <MessageCircle className="h-5 w-5" />
                  <div>
                    <p className="text-sm font-medium">Kontak WhatsApp belum tersedia</p>
                    <p className="text-xs">Silakan hubungi admin untuk informasi lebih lanjut</p>
                  </div>
                </div>
              </div>
            )}
          </article>

          <footer className="border-t border-border pt-6 md:pt-8">
            <div className="mb-4 pb-4 border-b border-border/50 space-y-3">
              <p className="text-sm font-medium text-foreground">Jelajahi lebih banyak</p>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                <Button asChild size="sm" className="w-full sm:w-auto">
                  <Link href="/merchandise">
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                    Kembali ke Katalog
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
              <p>Terima kasih atas minat Anda pada merchandise kami</p>
            </div>
          </footer>
        </div>
      </main>
      <Footer />
    </div>
  );
}
