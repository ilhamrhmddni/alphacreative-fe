import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border px-4 py-8 sm:px-6 sm:py-12">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8 sm:mb-12 grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="mb-4 flex items-center">
              <div className="relative h-10 w-56 md:h-12 md:w-64">
                <Image
                  src="/logo.svg"
                  alt="Alpha Creative"
                  fill
                  sizes="(min-width: 768px) 256px, 224px"
                />
              </div>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              Platform manajemen LKBB terintegrasi oleh Alpha Creative space untuk penyelenggara event di seluruh Indonesia.
            </p>
          </div>

          <div>
            <h4 className="mb-4 font-semibold">Feature</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link className="transition-colors hover:text-foreground" href="/news">
                  Berita
                </Link>
              </li>
              <li>
                <Link className="transition-colors hover:text-foreground" href="/events">
                  Event
                </Link>
              </li>
              <li>
                <Link className="transition-colors hover:text-foreground" href="/gallery">
                  Galeri
                </Link>
              </li>
              <li>
                <Link className="transition-colors hover:text-foreground" href="/merchandise">
                  Merchandise
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-semibold">Komunitas</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a className="transition-colors hover:text-foreground" href="#">Tentang Kami</a></li>
              <li><a className="transition-colors hover:text-foreground" href="#">Kontak</a></li>
              <li><a className="transition-colors hover:text-foreground" href="#">Privacy Policy</a></li>
              <li><a className="transition-colors hover:text-foreground" href="#">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-8 text-sm text-muted-foreground md:flex-row">
          <p>© 2024 Liga Pembaris by Alpha Creative. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a className="transition-colors hover:text-foreground" href="https://www.instagram.com/ligapembaris/">
              Instagram
            </a>
            <a className="transition-colors hover:text-foreground" href="#">
              Twitter
            </a>
            <a className="transition-colors hover:text-foreground" href="#">
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
