import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";
import type { TeamWithGroup } from "@/lib/queries/teams";

interface TeamCardProps {
  team: TeamWithGroup;
}

export function TeamCard({ team }: TeamCardProps) {
  const isRevealed = team.is_revealed !== false;

  const cardContent = (
    <Card
      accent
      className={`group p-8 transition-all duration-300 hover:bg-bg-card-hover hover:-translate-y-1 glow-accent-hover ${
        isRevealed ? "cursor-pointer" : "cursor-default"
      }`}
    >
      {/* Locked overlay */}
      {!isRevealed && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-[inherit]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-8 h-8 text-white/40"
          >
            <path
              fillRule="evenodd"
              d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}

      <div className={!isRevealed ? "grayscale opacity-40" : ""}>
        {/* Logo */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center group-hover:scale-105 transition-transform duration-300">
          {team.logo_url ? (
            <Image
              src={team.logo_url}
              alt={team.name}
              width={80}
              height={80}
              className="h-full w-full object-contain"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-bg-secondary rounded-[10px] text-2xl font-bold text-text-muted font-display">
              {team.short_name || team.name.slice(0, 3).toUpperCase()}
            </div>
          )}
        </div>

        {/* Gold separator */}
        <div className="mx-auto h-[1px] w-16 bg-gradient-to-r from-transparent via-[var(--color-gold)] to-transparent my-3"></div>

        {/* Name */}
        <h3 className="text-center font-display text-base font-bold uppercase tracking-wide text-text-primary">
          {team.name}
        </h3>

        {/* Group badge */}
        {team.group && (
          <div className="mt-2 flex items-center justify-center gap-2">
            <div className="w-1 h-4 rounded-full bg-accent"></div>
            <Badge variant="accent">{team.group.name}</Badge>
          </div>
        )}

        {/* City */}
        {team.city && (
          <p className="mt-1 text-center text-sm text-text-muted">
            {team.city}
          </p>
        )}
      </div>
    </Card>
  );

  if (!isRevealed) {
    return cardContent;
  }

  return (
    <Link href={{ pathname: "/equipos/[teamSlug]", params: { teamSlug: team.slug } }}>
      {cardContent}
    </Link>
  );
}

interface LockedTeamCardProps {
  comingSoonText: string;
}

export function LockedTeamCard({ comingSoonText }: LockedTeamCardProps) {
  return (
    <Card className="border-dashed border-border/60 bg-bg-secondary/50 p-8">
      {/* Lock icon */}
      <div className="mx-auto flex h-24 w-24 items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-10 w-10 text-text-muted/30"
        >
          <path
            fillRule="evenodd"
            d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z"
            clipRule="evenodd"
          />
        </svg>
      </div>

      {/* Mystery name */}
      <h3 className="mt-4 text-center font-display text-lg font-bold text-text-muted/40">
        ???
      </h3>

      {/* Coming soon */}
      <p className="mt-2 text-center text-sm text-text-muted/50">
        {comingSoonText}
      </p>
    </Card>
  );
}
