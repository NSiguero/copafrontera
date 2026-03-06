import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { getRegistrations } from "@/lib/queries/registrations";
import { Badge } from "@/components/ui/badge";
import { RegistrationActions } from "./registration-actions";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "registration" });
  return { title: t("registrations") };
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

export default async function AdminRegistrationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "registration" });
  const registrations = await getRegistrations();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold uppercase mb-6">
        {t("registrations")}
      </h1>

      {registrations.length === 0 ? (
        <p className="text-text-muted">{t("noRegistrations")}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="py-3 px-2 font-semibold">{t("teamName")}</th>
                <th className="py-3 px-2 font-semibold">{t("city")}</th>
                <th className="py-3 px-2 font-semibold">{t("captainFirstName")}</th>
                <th className="py-3 px-2 font-semibold">{t("captainEmail")}</th>
                <th className="py-3 px-2 font-semibold">Status</th>
                <th className="py-3 px-2 font-semibold"></th>
              </tr>
            </thead>
            <tbody>
              {registrations.map((reg) => (
                <tr key={reg.id} className="border-b border-border/50">
                  <td className="py-3 px-2 font-medium">{reg.team_name}</td>
                  <td className="py-3 px-2">{reg.city}</td>
                  <td className="py-3 px-2">
                    {reg.captain_first_name} {reg.captain_last_name}
                  </td>
                  <td className="py-3 px-2">{reg.captain_email}</td>
                  <td className="py-3 px-2">
                    <Badge variant={statusBadgeVariant[reg.registration_status]}>
                      {t(statusKey[reg.registration_status])}
                    </Badge>
                  </td>
                  <td className="py-3 px-2">
                    {(reg.registration_status === "paid") && (
                      <RegistrationActions registrationId={reg.id} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
