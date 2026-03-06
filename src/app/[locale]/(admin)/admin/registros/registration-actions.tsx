"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { approveRegistration, rejectRegistration } from "@/lib/actions/registration";

export function RegistrationActions({ registrationId }: { registrationId: string }) {
  const t = useTranslations("registration");

  return (
    <div className="flex gap-2">
      <form action={() => approveRegistration(registrationId)}>
        <Button type="submit" size="sm">
          {t("approve")}
        </Button>
      </form>
      <form action={() => rejectRegistration(registrationId)}>
        <Button type="submit" size="sm" variant="danger">
          {t("reject")}
        </Button>
      </form>
    </div>
  );
}
