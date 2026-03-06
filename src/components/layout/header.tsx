"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { LocaleSwitcher } from "./locale-switcher";
import { MobileNav } from "./mobile-nav";
import { cn } from "@/lib/utils/cn";

const navLinks = [
  { href: "/" as const, key: "home" },
  { href: "/equipos" as const, key: "teams" },
  { href: "/calendario" as const, key: "calendar" },
  { href: "/posiciones" as const, key: "standings" },
] as const;

export function Header() {
  const t = useTranslations("nav");
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40">
      {/* ── Top Ticker Bar ── */}
      <div className="hidden md:block h-7 bg-bg-dark-secondary overflow-hidden whitespace-nowrap">
        <div className="ticker-ribbon-inner h-full flex items-center gap-8 font-display text-xs font-semibold uppercase tracking-widest text-white/50">
          {/* Duplicate content for seamless loop */}
          {[0, 1].map((i) => (
            <span key={i} className="flex items-center gap-8 px-4">
              <span>Copa Frontera 2026</span>
              <span className="text-gold/60">&middot;</span>
              <span>El Paso — Ciudad Ju&aacute;rez</span>
              <span className="text-gold/60">&middot;</span>
              <span>16 Equipos</span>
              <span className="text-gold/60">&middot;</span>
              <span>4 Grupos</span>
              <span className="text-gold/60">&middot;</span>
              <span>Copa Frontera 2026</span>
              <span className="text-gold/60">&middot;</span>
              <span>El Paso — Ciudad Ju&aacute;rez</span>
              <span className="text-gold/60">&middot;</span>
              <span>16 Equipos</span>
              <span className="text-gold/60">&middot;</span>
              <span>4 Grupos</span>
              <span className="text-gold/60">&middot;</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── Main Nav Bar ── */}
      <div className="bg-bg-dark/95 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-3 group">
            <Image
              src="/images/logo.png"
              alt="Copa Frontera"
              width={44}
              height={44}
              className="h-11 w-auto transition-transform duration-300 group-hover:scale-105"
              priority
            />
            <span className="hidden font-display text-xl font-bold text-white sm:inline">
              Copa Frontera
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.key}
                href={link.href}
                className={cn(
                  "relative px-4 py-2 font-display text-sm font-semibold uppercase tracking-wider transition-colors hover:text-white",
                  pathname === link.href
                    ? "text-white"
                    : "text-white/50"
                )}
              >
                {t(link.key)}
                {/* Active indicator */}
                {pathname === link.href && (
                  <span className="absolute bottom-0 left-1/2 h-[2px] w-6 -translate-x-1/2 bg-accent rounded-full" />
                )}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/registro"
              className="hidden md:inline-flex items-center px-5 py-2 bg-gold text-bg-dark font-display text-sm font-bold uppercase tracking-wider rounded-[10px] hover:bg-gold-light transition-all duration-300 hover:shadow-[0_4px_16px_rgba(212,160,23,0.3)]"
            >
              {t("register")}
            </Link>
            <LocaleSwitcher />
            <MobileNav />
          </div>
        </div>
      </div>

      {/* ── Bottom Accent Line ── */}
      <div className="accent-stripe-gold" />
    </header>
  );
}
