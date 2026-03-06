import Image from "next/image";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Countdown } from "@/components/ui/countdown";

export const revalidate = 60;

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "home" });

  return (
    <main>
      {/* ═══════════════════════════════════════
          HERO — matchday graphic with countdown
          ═══════════════════════════════════════ */}
      <section className="grain-overlay relative flex min-h-[92vh] items-center overflow-hidden bg-bg-dark diagonal-cut-bottom">
        <Image
          src="/images/hero-bg.png"
          alt=""
          fill
          className="object-cover"
          priority
        />
        {/* Multi-layer gradient for depth */}
        <div className="absolute inset-0 bg-gradient-to-r from-bg-dark/95 via-bg-dark/70 to-bg-dark/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-dark via-transparent to-bg-dark/30" />

        {/* Watermark */}
        <div className="watermark-text top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ opacity: 0.015 }}>
          FRONTERA
        </div>

        {/* Hero content — asymmetric layout */}
        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-24 lg:py-32">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-12">

            {/* LEFT: Title block */}
            <div className="lg:w-3/5 space-y-6">
              {/* Small label above title */}
              <div className="flex items-center gap-3 animate-slide-horizontal">
                <div className="h-[2px] w-12 bg-gold" />
                <span className="font-display text-sm tracking-[0.3em] text-gold uppercase">
                  {t("hero.edition")}
                </span>
              </div>

              {/* Main title */}
              <h1 className="animate-fade-in">
                <span className="block font-display text-[clamp(3.5rem,10vw,8rem)] font-extrabold leading-[0.9] tracking-[-0.03em] text-white uppercase">
                  COPA
                </span>
                <span className="block font-display text-[clamp(3.5rem,10vw,8rem)] font-extrabold leading-[0.9] tracking-[-0.03em] text-white uppercase">
                  FRONTERA
                </span>
              </h1>

              {/* Location */}
              <p className="font-display text-lg sm:text-xl tracking-[0.15em] text-white/60 uppercase animate-fade-in delay-200">
                EL PASO &middot; CIUDAD JU&Aacute;REZ
              </p>

              {/* CTA */}
              <div className="animate-fade-in delay-300">
                <Link href="/equipos">
                  <Button variant="gold" size="lg">{t("hero.cta")}</Button>
                </Link>
              </div>
            </div>

            {/* RIGHT: Countdown block */}
            <div className="lg:w-2/5 animate-fade-in delay-400">
              <div className="broadcast-card rounded-[16px] p-6 sm:p-8 text-center">
                <div className="font-display text-sm tracking-[0.2em] text-white/50 uppercase mb-4">
                  {t("hero.subtitle")}
                </div>
                <Countdown targetDate="2026-06-15T00:00:00" />
              </div>
            </div>

          </div>
        </div>

        {/* Bottom accent — gold stripe */}
        <div className="absolute bottom-0 left-0 right-0 z-20 accent-stripe-gold" />
      </section>

      {/* ═══════════════════════════════════════
          TICKER RIBBON
          ═══════════════════════════════════════ */}
      <div className="bg-bg-dark-secondary border-y border-white/10 py-3 overflow-hidden">
        <div className="flex items-center gap-6">
          <div className="flex-shrink-0 bg-gold/20 text-gold px-3 py-1 font-display text-xs tracking-widest uppercase">
            COPA FRONTERA
          </div>
          <div className="ticker-ribbon-inner">
            {[...Array(2)].map((_, i) => (
              <span key={i} className="inline-flex items-center gap-8 px-4 text-white/70 font-display text-sm font-bold uppercase tracking-widest">
                <span>{t("ticker.text1")}</span>
                <span className="text-gold">&bull;</span>
                <span>{t("ticker.text2")}</span>
                <span className="text-gold">&bull;</span>
                <span>{t("ticker.text3")}</span>
                <span className="text-gold">&bull;</span>
                <span>{t("ticker.text1")}</span>
                <span className="text-gold">&bull;</span>
                <span>{t("ticker.text2")}</span>
                <span className="text-gold">&bull;</span>
                <span>{t("ticker.text3")}</span>
                <span className="text-gold">&bull;</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════
          STATS — dark cinematic section with grain
          ═══════════════════════════════════════ */}
      <section className="grain-overlay relative bg-bg-dark py-20 overflow-hidden">
        {/* Subtle radial glow behind stats */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(45,125,210,0.08)_0%,_transparent_70%)]" />

        <div className="relative z-10 mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
            {(["teams", "matches", "groups", "days"] as const).map((key, i) => (
              <div
                key={key}
                className="animate-reveal-up"
                style={{ animationDelay: `${i * 120}ms` }}
              >
                <div className="broadcast-card rounded-[10px] p-6 text-center">
                  <p className="stat-number text-gradient-gold tabular-nums">
                    {t(`stats.${key}`)}
                  </p>
                  <p className="stat-label mt-3 text-white/50 uppercase tracking-wider">
                    {t(`stats.${key}Label`)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          NEXT MATCHES — with editorial section heading
          ═══════════════════════════════════════ */}
      <section className="relative py-20">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="section-heading font-display text-3xl font-bold text-text-primary sm:text-4xl animate-slide-horizontal">
            {t("nextMatches.title")}
          </h2>

          <div className="mt-10">
            {/* Empty state — broadcast card */}
            <div className="broadcast-card rounded-[10px] p-8 text-center">
              <div className="text-gradient-gold font-display text-2xl font-bold uppercase tracking-wider mb-2">
                PROXIMAMENTE
              </div>
              <p className="text-white/50 font-display text-sm uppercase tracking-wider">
                {t("nextMatches.noMatches")}
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link href="/calendario">
              <Button variant="secondary" size="md">{t("nextMatches.viewAll")}</Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
