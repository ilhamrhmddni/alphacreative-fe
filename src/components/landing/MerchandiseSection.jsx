import { ShoppingBag, ArrowRight } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/formatters";
import { resolveMediaUrl } from "@/lib/utils";
import { MerchandiseHighlight } from "./MerchandiseHighlight";
import { MerchandiseListItem } from "./MerchandiseListItem";

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

export function MerchandiseSection({ merchandise, merchandiseContact }) {
  const list = Array.isArray(merchandise) ? merchandise.slice(0, 5) : [];
  const highlight = list[0] || null;
  const remaining = highlight ? list.slice(1, 5) : list.slice(0, 4);
  const whatsappNumber = merchandiseContact?.whatsappNumber || null;
  const highlightImage = highlight?.photoPath
    ? resolveMediaUrl(highlight.photoPath) || highlight.photoPath
    : null;

  const highlightPrice = highlight?.price !== null && highlight?.price !== undefined 
    ? formatCurrency(highlight.price) 
    : "Segera diumumkan";

  const highlightLink = buildWhatsappLink(whatsappNumber, highlight);

  return (
    <section id="merchandise" className="section-gray px-4 py-20 sm:px-6 sm:py-28">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-12 sm:mb-16 text-center">
          <p className="mb-3 text-sm font-medium text-primary">MERCHANDISE</p>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Temukan Produk Kami</h2>
          <p className="mx-auto max-w-xl text-muted-foreground">
            Pilih merchandise favorit dan pesan langsung melalui WhatsApp resmi Alpha Creative.
          </p>
        </div>

        <div className="grid gap-6 sm:gap-8 lg:grid-cols-[2fr,1fr]">
          {/* Unggulan Besar - Kiri */}
          {highlight ? (
            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
              <MerchandiseHighlight
                highlight={highlight}
                highlightImage={highlightImage}
                highlightPrice={highlightPrice}
                highlightLink={highlightLink}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 p-12 text-muted-foreground">
              <div className="text-center">
                <ShoppingBag className="mx-auto mb-4 h-12 w-12 opacity-20" />
                <p className="text-sm">Belum ada merchandise unggulan</p>
              </div>
            </div>
          )}

          {/* List Merchandise - Kanan */}
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <div className="divide-y divide-border">
              {remaining.length ? (
                remaining.map((item) => {
                  const thumb = item.photoPath ? resolveMediaUrl(item.photoPath) || item.photoPath : null;
                  const waLink = buildWhatsappLink(whatsappNumber, item);
                  const itemPrice = item.price !== null && item.price !== undefined 
                    ? formatCurrency(item.price) 
                    : "Segera diumumkan";
                  return (
                    <MerchandiseListItem
                      key={item.id}
                      item={item}
                      thumb={thumb}
                      waLink={waLink}
                      itemPrice={itemPrice}
                    />
                  );
                })
              ) : (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  {highlight ? "Produk merchandise lainnya segera hadir." : "Belum ada merchandise yang tersedia."}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/merchandise"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary"
          >
            Lihat semua merchandise
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
