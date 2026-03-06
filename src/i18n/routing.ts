import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["es", "en"],
  defaultLocale: "es",
  localePrefix: "as-needed",
  pathnames: {
    "/": "/",
    "/equipos": {
      es: "/equipos",
      en: "/teams",
    },
    "/equipos/[teamSlug]": {
      es: "/equipos/[teamSlug]",
      en: "/teams/[teamSlug]",
    },
    "/calendario": {
      es: "/calendario",
      en: "/calendar",
    },
    "/posiciones": {
      es: "/posiciones",
      en: "/standings",
    },
    "/admin": {
      es: "/admin",
      en: "/admin",
    },
    "/admin/resultados": {
      es: "/admin/resultados",
      en: "/admin/results",
    },
    "/admin/resultados/[matchId]": {
      es: "/admin/resultados/[matchId]",
      en: "/admin/results/[matchId]",
    },
    "/admin/equipos": {
      es: "/admin/equipos",
      en: "/admin/teams",
    },
    "/admin/equipos/[teamId]": {
      es: "/admin/equipos/[teamId]",
      en: "/admin/teams/[teamId]",
    },
    "/admin/estadisticas": {
      es: "/admin/estadisticas",
      en: "/admin/stats",
    },
    "/admin/bracket": {
      es: "/admin/bracket",
      en: "/admin/bracket",
    },
    "/login": {
      es: "/login",
      en: "/login",
    },
    "/registro": {
      es: "/registro",
      en: "/registration",
    },
    "/registro/exito": {
      es: "/registro/exito",
      en: "/registration/success",
    },
    "/admin/registros": {
      es: "/admin/registros",
      en: "/admin/registrations",
    },
  },
});

export type Pathnames = keyof typeof routing.pathnames;
export type Locale = (typeof routing.locales)[number];
