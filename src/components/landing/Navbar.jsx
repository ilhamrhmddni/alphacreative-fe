"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const navLinks = [
  // { label: "Event", href: "#events" },
  // { label: "Kategori", href: "#categories" },
  // { label: "Berita", href: "#news" },
  // { label: "Hasil", href: "#results" },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <nav className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2" aria-label="Alpha Creative">
          <div className="relative h-9 w-48 shrink-0 md:h-10 md:w-60">
            <Image
              src="/logo.svg"
              alt="Alpha Creative"
              fill
              sizes="(min-width: 768px) 240px, 180px"
              priority
            />
          </div>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Button variant="ghost" size="md" className="p-2" asChild>
            <Link href="/auth/login">Masuk</Link>
          </Button>
          <Button size="md" className="p-2" asChild>
            <Link href="/auth/register">Daftar Tim</Link>
          </Button>
        </div>

        <button className="p-2 md:hidden" onClick={() => setMobileMenuOpen((prev) => !prev)}>
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {mobileMenuOpen && (
        <div className="border-b border-border bg-background md:hidden">
          <div className="container mx-auto space-y-4 px-6 py-4 border-t border-border ">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="block text-sm text-muted-foreground transition-colors hover:text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="flex gap-3">
              <Button variant="ghost" size="sm" className="flex-1" asChild>
                <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                  Masuk
                </Link>
              </Button>
              <Button size="sm" className="flex-1" asChild>
                <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)}>
                  Daftar Tim
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
