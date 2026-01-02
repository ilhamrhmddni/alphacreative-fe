
import { Music, Flag, Drum, Award } from "lucide-react";

const iconMap = {
  "LKBB": Music,
  "Color Guard": Flag,
  "Drum Corps": Drum,
  "Festival & Exhibition": Award,
  "Event Lainnya": Award,
};

export function CategoriesSection({ categories }) {
  // Fallback jika data tidak ada
  const categoryList = categories || [];
  return (
    <section id="categories" className="section-white px-4 py-20 sm:px-6 sm:py-28">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-12 sm:mb-16 text-center">
          <p className="mb-3 text-sm font-medium text-primary">KATEGORI</p>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Jenis Kompetisi</h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            Berbagai kategori kompetisi yang dikelola dalam Liga Pembaris
          </p>
        </div>

        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categoryList.map((category) => {
            const Icon = iconMap[category.name] || Award;
            return (
              <div
                key={category.name}
                className="group cursor-pointer rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-lg"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="h-6 w-6 text-primary group-hover:text-primary-foreground" />
                </div>
                <h3 className="mb-2 font-semibold">{category.name}</h3>
                <p className="mb-4 text-sm text-muted-foreground">Kategori kompetisi {category.name}</p>
                <p className="text-sm font-medium text-primary">{category.total} Event Aktif</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
