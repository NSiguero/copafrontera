import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

const isAdminRoute = createRouteMatcher([
  "/admin(.*)",
  "/en/admin(.*)",
  "/es/admin(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  if (isAdminRoute(request)) {
    const session = await auth();
    if (
      !session.userId ||
      session.sessionClaims?.metadata?.role !== "admin"
    ) {
      const url = new URL("/login", request.url);
      return NextResponse.redirect(url);
    }
  }

  return intlMiddleware(request);
});

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
