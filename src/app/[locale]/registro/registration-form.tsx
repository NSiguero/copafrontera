"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { createRegistration } from "@/lib/actions/registration";
import { stripePromise } from "@/lib/stripe/client";
import { useRouter } from "@/i18n/navigation";

interface RegistrationFormProps {
  clerkUserId: string;
  feeAmount: number;
  feeCurrency: string;
  existingRegistrationId?: string;
}

type Step = "team-info" | "payment";

interface TeamData {
  team_name: string;
  city: string;
  captain_first_name: string;
  captain_last_name: string;
  captain_phone: string;
  captain_email: string;
}

function StepIndicator({ currentStep }: { currentStep: Step }) {
  const t = useTranslations("registration");
  const steps: { key: Step; label: string }[] = [
    { key: "team-info", label: t("stepTeamInfo") },
    { key: "payment", label: t("stepPayment") },
  ];

  return (
    <div className="mb-8 flex items-center justify-center gap-8">
      {steps.map((step, i) => (
        <div key={step.key} className="flex items-center gap-3">
          {i > 0 && (
            <div
              className={`h-px w-8 ${
                currentStep === "payment" ? "bg-accent" : "bg-border"
              }`}
            />
          )}
          <div className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                currentStep === step.key ||
                (currentStep === "payment" && step.key === "team-info")
                  ? "bg-accent text-white"
                  : "bg-bg-secondary text-text-muted"
              }`}
            >
              {currentStep === "payment" && step.key === "team-info" ? (
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                i + 1
              )}
            </div>
            <span
              className={`text-sm font-medium ${
                currentStep === step.key
                  ? "text-text-primary"
                  : "text-text-muted"
              }`}
            >
              {step.label}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function PaymentForm({
  teamData,
  feeAmount,
  feeCurrency,
  onBack,
}: {
  teamData: TeamData;
  feeAmount: number;
  feeCurrency: string;
  onBack: () => void;
}) {
  const t = useTranslations("registration");
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const displayFee = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: feeCurrency,
  }).format(feeAmount / 100);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    const appUrl =
      typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost:3030";

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${appUrl}/registro/exito`,
      },
      redirect: "if_required",
    });

    if (stripeError) {
      setError(stripeError.message ?? t("paymentError"));
      setLoading(false);
    } else {
      // Payment succeeded without redirect (no 3DS)
      router.push("/registro/exito");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Team summary */}
      <div className="rounded-[10px] bg-bg-secondary p-4">
        <h3 className="mb-2 text-sm font-semibold text-text-muted uppercase">
          {t("stepTeamInfo")}
        </h3>
        <p className="font-semibold">{teamData.team_name}</p>
        <p className="text-sm text-text-muted">
          {teamData.city} &mdash; {teamData.captain_first_name}{" "}
          {teamData.captain_last_name}
        </p>
      </div>

      {/* Order summary */}
      <div className="rounded-[10px] border border-border p-4">
        <h3 className="mb-2 text-sm font-semibold text-text-muted uppercase">
          {t("orderSummary")}
        </h3>
        <div className="flex items-center justify-between">
          <span>{t("fee")}</span>
          <span className="font-display text-xl font-bold text-accent">
            {displayFee}
          </span>
        </div>
      </div>

      {/* Stripe Payment Element */}
      <div className="rounded-[10px] border border-border p-4">
        {!ready && <Skeleton className="h-[200px] w-full" />}
        <div className={ready ? "" : "hidden"}>
          <PaymentElement
            onReady={() => setReady(true)}
            options={{
              layout: "tabs",
            }}
          />
        </div>
      </div>

      {error && <p className="text-sm text-error text-center">{error}</p>}

      <p className="text-center text-xs text-text-muted">
        {t("paymentSecure")}
      </p>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="secondary"
          className="flex-1"
          onClick={onBack}
          disabled={loading}
        >
          {t("back")}
        </Button>
        <Button
          type="submit"
          className="flex-1"
          disabled={loading || !stripe || !elements || !ready}
        >
          {loading ? t("processing") : t("payNow", { amount: displayFee })}
        </Button>
      </div>
    </form>
  );
}

export function RegistrationForm({
  clerkUserId,
  feeAmount,
  feeCurrency,
  existingRegistrationId,
}: RegistrationFormProps) {
  const t = useTranslations("registration");
  const locale = useLocale();
  const [step, setStep] = useState<Step>(
    existingRegistrationId ? "payment" : "team-info"
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [registrationId, setRegistrationId] = useState<string | null>(
    existingRegistrationId ?? null
  );
  const [teamData, setTeamData] = useState<TeamData>({
    team_name: "",
    city: "",
    captain_first_name: "",
    captain_last_name: "",
    captain_phone: "",
    captain_email: "",
  });

  // Legal checkboxes
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptRefund, setAcceptRefund] = useState(false);
  const [acceptWaiver, setAcceptWaiver] = useState(false);

  const displayFee = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: feeCurrency,
  }).format(feeAmount / 100);

  // If resuming with existingRegistrationId but no clientSecret yet, fetch it
  async function initPaymentIntent(regId: string) {
    const res = await fetch("/api/stripe/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ registrationId: regId }),
    });

    const result = await res.json();

    if (!res.ok) {
      throw new Error(result.error || "Failed to create payment intent");
    }

    return result.clientSecret as string;
  }

  // On mount, if resuming, fetch clientSecret
  useState(() => {
    if (existingRegistrationId && !clientSecret) {
      initPaymentIntent(existingRegistrationId)
        .then(setClientSecret)
        .catch((err) =>
          setError(err instanceof Error ? err.message : "An error occurred")
        );
    }
  });

  async function handleTeamSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    try {
      const data: TeamData = {
        team_name: formData.get("team_name") as string,
        city: formData.get("city") as string,
        captain_first_name: formData.get("captain_first_name") as string,
        captain_last_name: formData.get("captain_last_name") as string,
        captain_phone: formData.get("captain_phone") as string,
        captain_email: formData.get("captain_email") as string,
      };

      setTeamData(data);

      // Create registration in DB
      const regId = await createRegistration({
        ...data,
        clerk_user_id: clerkUserId,
      });
      setRegistrationId(regId);

      // Create PaymentIntent
      const secret = await initPaymentIntent(regId);
      setClientSecret(secret);

      setStep("payment");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  const legalValid = acceptTerms && acceptRefund && acceptWaiver;

  const stripeAppearance = {
    theme: "stripe" as const,
    variables: {
      colorPrimary: "#2D7DD2",
      borderRadius: "10px",
      fontFamily: "Inter, system-ui, sans-serif",
      colorBackground: "#FFFFFF",
      colorText: "#0A0A0A",
    },
  };

  return (
    <>
      <StepIndicator currentStep={step} />

      <Card>
        <CardContent className="pt-6">
          {step === "team-info" && (
            <form action={handleTeamSubmit} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <Input
                  id="team_name"
                  name="team_name"
                  label={t("teamName")}
                  placeholder="CF Tigres del Norte"
                  required
                />
                <Input
                  id="city"
                  name="city"
                  label={t("city")}
                  placeholder="El Paso"
                  required
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <Input
                  id="captain_first_name"
                  name="captain_first_name"
                  label={t("captainFirstName")}
                  required
                />
                <Input
                  id="captain_last_name"
                  name="captain_last_name"
                  label={t("captainLastName")}
                  required
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <Input
                  id="captain_phone"
                  name="captain_phone"
                  type="tel"
                  label={t("captainPhone")}
                  placeholder="+1 (915) 555-0123"
                  required
                />
                <Input
                  id="captain_email"
                  name="captain_email"
                  type="email"
                  label={t("captainEmail")}
                  placeholder="captain@email.com"
                  required
                />
              </div>

              <div className="rounded-[10px] bg-bg-secondary p-4 text-center">
                <p className="text-sm text-text-muted">{t("fee")}</p>
                <p className="mt-1 font-display text-2xl font-bold text-accent">
                  {displayFee}
                </p>
              </div>

              {/* Legal checkboxes */}
              <div className="space-y-3 rounded-[10px] border border-border p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-border accent-accent"
                  />
                  <span className="text-sm">{t("acceptTerms")}</span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptRefund}
                    onChange={(e) => setAcceptRefund(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-border accent-accent"
                  />
                  <span className="text-sm">{t("acceptRefund")}</span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptWaiver}
                    onChange={(e) => setAcceptWaiver(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-border accent-accent"
                  />
                  <span className="text-sm">{t("acceptWaiver")}</span>
                </label>
              </div>

              {error && (
                <p className="text-sm text-error text-center">{error}</p>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={loading || !legalValid}
              >
                {loading ? t("processing") : t("continueToPayment")}
              </Button>
            </form>
          )}

          {step === "payment" && clientSecret && (
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: stripeAppearance,
                locale: locale === "es" ? "es" : "en",
              }}
            >
              <PaymentForm
                teamData={teamData}
                feeAmount={feeAmount}
                feeCurrency={feeCurrency}
                onBack={() => {
                  if (!existingRegistrationId) {
                    setStep("team-info");
                  }
                }}
              />
            </Elements>
          )}

          {step === "payment" && !clientSecret && (
            <div className="space-y-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-[200px] w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
