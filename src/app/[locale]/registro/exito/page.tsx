import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "registration" });
  return { title: t("successTitle") };
}

export default async function RegistrationSuccessPage({
  params,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ payment_intent_client_secret?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "registration" });

  return (
    <main className="flex min-h-[60vh] items-center justify-center px-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
            <svg
              className="h-8 w-8 text-success"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="font-display text-2xl font-bold uppercase">
            {t("successTitle")}
          </h1>
        </CardHeader>
        <CardContent>
          <p className="text-text-muted">{t("successMessage")}</p>
          <div className="mt-6">
            <Link href="/">
              <Button variant="secondary">{t("backHome")}</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
