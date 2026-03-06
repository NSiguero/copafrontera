import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { auth } from "@clerk/nextjs/server";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getRegistrationByUserId } from "@/lib/queries/registrations";
import { RegistrationForm } from "./registration-form";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "registration" });
  return { title: t("title") };
}

const statusBadgeVariant: Record<string, "warning" | "accent" | "success" | "error"> = {
  pending_payment: "warning",
  paid: "accent",
  approved: "success",
  rejected: "error",
};

const statusKey: Record<string, string> = {
  pending_payment: "statusPending",
  paid: "statusPaid",
  approved: "statusApproved",
  rejected: "statusRejected",
};

export default async function RegistrationPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "registration" });
  const { userId } = await auth();

  // Not signed in — prompt
  if (!userId) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center px-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <h1 className="font-display text-2xl font-bold uppercase">{t("title")}</h1>
            <p className="mt-2 text-text-muted">{t("signInPrompt")}</p>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center gap-4">
              <SignInButton mode="modal">
                <Button variant="primary">{t("signIn")}</Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button variant="secondary">{t("signUp")}</Button>
              </SignUpButton>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  // Signed in — check for existing registration
  const existing = await getRegistrationByUserId(userId);

  if (existing) {
    // If pending_payment, let user resume the payment flow
    if (existing.registration_status === "pending_payment") {
      const feeAmount = parseInt(process.env.REGISTRATION_FEE_AMOUNT || "10000", 10);
      const feeCurrency = process.env.REGISTRATION_FEE_CURRENCY || "usd";

      return (
        <main className="mx-auto max-w-2xl px-4 py-12">
          <div className="mb-8 text-center">
            <h1 className="font-display text-3xl font-bold uppercase">{t("title")}</h1>
            <p className="mt-2 text-text-muted">{t("resumePayment")}</p>
          </div>
          <RegistrationForm
            clerkUserId={userId}
            feeAmount={feeAmount}
            feeCurrency={feeCurrency}
            existingRegistrationId={existing.id}
          />
        </main>
      );
    }

    return (
      <main className="flex min-h-[60vh] items-center justify-center px-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <h1 className="font-display text-2xl font-bold uppercase">{t("title")}</h1>
            <p className="mt-2 text-text-muted">{t("alreadyRegistered")}</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="font-semibold text-lg">{existing.team_name}</p>
              <Badge variant={statusBadgeVariant[existing.registration_status]}>
                {t(statusKey[existing.registration_status])}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  // No registration yet — show form
  const feeAmount = parseInt(process.env.REGISTRATION_FEE_AMOUNT || "10000", 10);
  const feeCurrency = process.env.REGISTRATION_FEE_CURRENCY || "usd";

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="font-display text-3xl font-bold uppercase">{t("title")}</h1>
        <p className="mt-2 text-text-muted">{t("subtitle")}</p>
      </div>
      <RegistrationForm
        clerkUserId={userId}
        feeAmount={feeAmount}
        feeCurrency={feeCurrency}
      />
    </main>
  );
}
