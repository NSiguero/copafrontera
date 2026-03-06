import { ClerkProvider } from "@clerk/nextjs";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

// Root layout — ClerkProvider wraps everything, next-intl handles [locale]
export default function RootLayout({ children }: Props) {
  return <ClerkProvider>{children}</ClerkProvider>;
}
