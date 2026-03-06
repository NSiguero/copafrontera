import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { SignIn } from "@clerk/nextjs";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admin" });
  return { title: t("login") };
}

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="flex min-h-[80vh] items-center justify-center px-4">
      <SignIn
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "bg-bg-card border border-border shadow-lg rounded-[16px]",
            headerTitle: "font-display text-accent",
            headerSubtitle: "text-text-muted",
            formButtonPrimary:
              "bg-accent hover:bg-accent-light text-white font-bold rounded-[10px]",
            formFieldInput:
              "border-border bg-bg-secondary rounded-[10px] focus:border-accent focus:ring-accent",
            footerActionLink: "text-accent hover:text-accent-light",
          },
        }}
        fallbackRedirectUrl="/admin/resultados"
      />
    </main>
  );
}
