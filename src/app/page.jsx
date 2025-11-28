
import { HeroSection } from "@/components/landing/HeroSection";
import { EventsSection } from "@/components/landing/EventsSection";
import { CategoriesSection } from "@/components/landing/CategoriesSection";
import { PreviewSection } from "@/components/landing/PreviewSection";
import { CTASection } from "@/components/landing/CTASection";
import { Footer } from "@/components/landing/Footer";
import { Navbar } from "@/components/landing/Navbar";

export default async function Home() {
  // Gunakan variabel lingkungan `NEXT_PUBLIC_API_URL` jika tersedia,
  // fallback ke http://localhost:4000
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

  let data = {
    heroEvent: null,
    events: [],
    categories: [],
    news: [],
    champions: [],
    stats: null,
  };

  try {
    const res = await fetch(`${API_URL}/public/landing`, { next: { revalidate: 60 } });
    if (res.ok) {
      data = await res.json();
    } else {
      console.error(`Fetch /public/landing failed: ${res.status} ${res.statusText}`);
    }
  } catch (err) {
    console.error("Error fetching landing data:", err);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="pt-16">
        <HeroSection heroEvent={data.heroEvent} stats={data.stats} />
        <EventsSection events={data.events} />
        <CategoriesSection categories={data.categories} />
        <PreviewSection news={data.news} champions={data.champions} />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
