"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils/cn";

const navLinks = [
  { href: "/" as const, key: "home" },
  { href: "/equipos" as const, key: "teams" },
  { href: "/calendario" as const, key: "calendar" },
  { href: "/posiciones" as const, key: "standings" },
  { href: "/registro" as const, key: "register" },
] as const;

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const t = useTranslations("nav");
  const pathname = usePathname();

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex h-10 w-10 flex-col items-center justify-center gap-1.5"
        aria-label="Toggle menu"
      >
        <span
          className={cn(
            "h-0.5 w-6 bg-white transition-all duration-300",
            open && "translate-y-2 rotate-45"
          )}
        />
        <span
          className={cn(
            "h-0.5 w-6 bg-white transition-all duration-300",
            open && "opacity-0"
          )}
        />
        <span
          className={cn(
            "h-0.5 w-6 bg-white transition-all duration-300",
            open && "-translate-y-2 -rotate-45"
          )}
        />
      </button>

      {open && (
        <div className="grain-overlay fixed inset-0 top-[81px] z-50 bg-bg-dark/98 backdrop-blur-sm">
          <nav className="relative z-10 flex flex-col items-center gap-6 pt-16">
            {navLinks.map((link, i) => (
              <Link
                key={link.key}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "animate-fade-in font-display text-3xl font-bold uppercase tracking-wider transition-colors",
                  pathname === link.href
                    ? "text-accent-light"
                    : "text-white/60 hover:text-white"
                )}
                style={{ animationDelay: `${i * 80}ms` }}
              >
                {t(link.key)}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}
