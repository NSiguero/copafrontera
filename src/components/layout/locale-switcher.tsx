"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const otherLocale = locale === "es" ? "en" : "es";
  const label = locale === "es" ? "EN" : "ES";

  function handleSwitch() {
    router.replace(
      // @ts-expect-error -- pathname may include dynamic segments
      pathname,
      { locale: otherLocale }
    );
  }

  return (
    <button
      onClick={handleSwitch}
      className="border border-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-text-secondary rounded-full transition-colors hover:border-accent hover:text-accent"
    >
      {label}
    </button>
  );
}
