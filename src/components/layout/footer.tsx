import Image from "next/image";
import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations("footer");
  const year = new Date().getFullYear();

  return (
    <footer className="diagonal-cut-top relative overflow-hidden bg-bg-dark">
      <Image
        src="/images/footer-bg.png"
        alt=""
        fill
        className="object-cover opacity-40"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-bg-dark via-bg-dark/90 to-bg-dark/70" />

      {/* Top accent stripe */}
      <div className="relative z-10 accent-stripe-gold" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 pt-16 pb-8">
        <div className="flex flex-col items-center text-center">
          <Image
            src="/images/logo.png"
            alt="Copa Frontera"
            width={64}
            height={64}
            className="h-16 w-auto"
          />
          <p className="mt-4 font-display text-3xl font-bold text-white sm:text-4xl">
            Copa Frontera
          </p>
          <p className="mt-2 font-display text-sm font-semibold uppercase tracking-[0.2em] text-white/30">
            El Paso &bull; Ciudad Juarez
          </p>
          <p className="mt-4 text-base text-white/50">
            {t("madeWith")}
          </p>
        </div>

        {/* Divider */}
        <div className="mx-auto mt-12 mb-6 h-px w-full max-w-md bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <p className="text-center text-sm text-white/30">
          &copy; {year} Copa Frontera. {t("rights")}.
        </p>
      </div>
    </footer>
  );
}
