"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag } from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import { get } from "@/lib/api";
import { formatCurrency } from "@/lib/formatters";
import { resolveMediaUrl } from "@/lib/utils";
import PageContainer from "@/components/layout/page-container";
import PageHeader from "@/components/layout/page-header";
import { PesertaMerchandiseCard } from "@/components/merchandise/peserta-merchandise-card";

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

export default function PesertaMerchandisePage() {
  const router = useRouter();
  const { user, initializing } = useAuth();
  const [merchandise, setMerchandise] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState(null);

  useEffect(() => {
    if (!initializing && (!user || user.role !== "peserta")) {
      router.push("/auth/login");
      return;
    }
  }, [initializing, user, router]);

  useEffect(() => {
    if (!user || user.role !== "peserta" || initializing) return;

    async function fetchData() {
      try {
        setLoading(true);
        setError("");

        // Fetch merchandise
        const merchData = await get("/merchandise");
        const items = Array.isArray(merchData) ? merchData : Array.isArray(merchData?.data) ? merchData.data : [];
        setMerchandise(items.filter((item) => item.isPublished));

        // Fetch WhatsApp contact from settings
        try {
          const settings = await get("/settings?key=merch.whatsapp");
          const waNum = settings?.value || null;
          setWhatsappNumber(waNum);
        } catch (err) {
          console.warn("Could not fetch WhatsApp number:", err);
          setWhatsappNumber(null);
        }
      } catch (err) {
        console.error("Error fetching merchandise:", err);
        setError(err.message || "Gagal memuat merchandise");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user, initializing]);

  const items = useMemo(() => {
    return merchandise.map((item) => {
      const photo = item.photoPath ? resolveMediaUrl(item.photoPath) || item.photoPath : null;
      const priceLabel =
        item.price === null || item.price === undefined ? "Hubungi kami" : formatCurrency(item.price);
      const stock = Number(item.stock);
      let stockLabel = "Stok: -";
      let stockClass = "border border-border bg-muted/40 text-muted-foreground";

      if (!Number.isNaN(stock)) {
        if (stock <= 0) {
          stockLabel = "Habis";
          stockClass = "border border-rose-200 bg-rose-50 text-rose-700";
        } else {
          stockLabel = `Stok: ${stock}`;
          stockClass = "border border-emerald-200 bg-emerald-50 text-emerald-700";
        }
      }

      const orderLink = buildWhatsappLink(whatsappNumber, item);

      return {
        ...item,
        photo,
        priceLabel,
        stockLabel,
        stockClass,
        orderLink,
      };
    });
  }, [merchandise, whatsappNumber]);

  if (initializing) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Memuat...</p>
      </div>
    );
  }

  if (!user || user.role !== "peserta") {
    return null;
  }

  return (
    <PageContainer>
      <PageHeader
        title="Merchandise"
        description="Jelajahi dan pesan merchandise resmi Alpha Creative langsung melalui WhatsApp"
      />

      <section className="space-y-8">
        {error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-sm text-muted-foreground">Memuat merchandise...</p>
          </div>
        ) : items.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item) => (
              <PesertaMerchandiseCard
                key={item.id}
                item={item}
                photo={item.photo}
                priceLabel={item.priceLabel}
                stockLabel={item.stockLabel}
                stockClass={item.stockClass}
                orderLink={item.orderLink}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 py-12">
            <ShoppingBag className="mb-3 h-12 w-12 text-muted-foreground opacity-40" />
            <p className="text-sm font-medium text-muted-foreground">Belum ada merchandise tersedia</p>
          </div>
        )}
      </section>
    </PageContainer>
  );
}
