import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const t = useTranslations("common");

  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="font-display text-9xl font-bold text-accent">404</h1>
      <p className="mt-4 text-xl text-text-secondary">{t("notFound")}</p>
      <Link href="/" className="mt-8">
        <Button>{t("backHome")}</Button>
      </Link>
    </main>
  );
}
