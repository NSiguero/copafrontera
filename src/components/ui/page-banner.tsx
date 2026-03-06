import Image from "next/image";

interface PageBannerProps {
  imageSrc: string;
  title: string;
  objectPosition?: string;
}

export function PageBanner({ imageSrc, title, objectPosition = "center" }: PageBannerProps) {
  return (
    <section className="diagonal-cut-bottom relative flex min-h-[260px] max-h-[340px] h-[35vh] items-end overflow-hidden bg-bg-dark">
      <Image
        src={imageSrc}
        alt=""
        fill
        className="object-cover"
        style={{ objectPosition }}
        priority
      />
      {/* Cinematic gradient — lets image show through */}
      <div className="absolute inset-0 bg-gradient-to-r from-bg-dark/70 via-bg-dark/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-bg-dark/80 via-bg-dark/20 to-bg-dark/10" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-10">
        <div className="flex items-center gap-4">
          <div className="h-10 border-l-4 border-l-[var(--color-gold)]" />
          <h1 className="text-shadow-hero font-display text-5xl font-bold text-white animate-slide-left md:text-6xl lg:text-7xl">
            {title}
          </h1>
        </div>
      </div>

      {/* Bottom accent stripe */}
      <div className="absolute bottom-0 left-0 right-0 z-20 accent-stripe-gold" />
    </section>
  );
}
