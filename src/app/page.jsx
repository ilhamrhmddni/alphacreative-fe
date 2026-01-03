
"use client";

import { useEffect, useState } from "react";
import { HeroSection } from "@/components/landing/HeroSection";
import { EventsSection } from "@/components/landing/EventsSection";
import { CategoriesSection } from "@/components/landing/CategoriesSection";
import { GallerySection } from "@/components/landing/GallerySection";
import { NewsSection } from "@/components/landing/NewsSection";
import { MerchandiseSection } from "@/components/landing/MerchandiseSection";
import { PartnershipSection } from "@/components/landing/PartnershipSection";
import { CTASection } from "@/components/landing/CTASection";
import { Footer } from "@/components/landing/Footer";
import { Navbar } from "@/components/landing/Navbar";

const defaultData = {
  heroEvent: null,
  events: [],
  categories: [],
  news: [],
  merchandise: [],
  merchandiseContact: null,
  champions: [],
  gallery: [],
  collaborations: [],
  stats: null,
};

export default function Home() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
  const [data, setData] = useState(defaultData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_URL}/public/landing`);
        if (res.ok) {
          const payload = await res.json();
          setData({ ...defaultData, ...payload });
        } else {
          console.error(`Fetch /public/landing failed: ${res.status} ${res.statusText}`);
        }
      } catch (err) {
        console.error("Error fetching landing data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [API_URL]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="pt-16">
        <HeroSection heroEvent={data.heroEvent} stats={data.stats} />
        <EventsSection events={data.events} />
        <CategoriesSection categories={data.categories} />
        <GallerySection items={data.gallery} />
        <NewsSection news={data.news} />
        <MerchandiseSection
          merchandise={data.merchandise}
          merchandiseContact={data.merchandiseContact}
        />
        <PartnershipSection collaborations={data.collaborations} />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
