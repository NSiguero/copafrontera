export const SITE_NAME = "Copa Frontera";
export const SITE_DESCRIPTION = "Torneo de fútbol con 16 equipos";
export const SITE_URL = "https://copafrontera.com";

export const MATCH_STAGES = [
  "group",
  "round_of_32",
  "round_of_16",
  "quarterfinal",
  "semifinal",
  "third_place",
  "final",
] as const;

export const MATCH_STATUSES = [
  "scheduled",
  "in_progress",
  "completed",
  "postponed",
  "cancelled",
] as const;

export const PLAYER_POSITIONS = [
  "goalkeeper",
  "defender",
  "midfielder",
  "forward",
] as const;

export type MatchStage = (typeof MATCH_STAGES)[number];
export type MatchStatus = (typeof MATCH_STATUSES)[number];
export type PlayerPosition = (typeof PLAYER_POSITIONS)[number];
