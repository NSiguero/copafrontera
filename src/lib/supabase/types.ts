export type Database = {
  public: {
    Tables: {
      groups: {
        Row: {
          id: string;
          name: string;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          display_order?: number;
        };
        Update: {
          name?: string;
          display_order?: number;
        };
        Relationships: [];
      };
      teams: {
        Row: {
          id: string;
          name: string;
          slug: string;
          short_name: string | null;
          logo_url: string | null;
          group_id: string | null;
          city: string | null;
          is_revealed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          short_name?: string | null;
          logo_url?: string | null;
          group_id?: string | null;
          city?: string | null;
          is_revealed?: boolean;
        };
        Update: {
          name?: string;
          slug?: string;
          short_name?: string | null;
          logo_url?: string | null;
          group_id?: string | null;
          city?: string | null;
          is_revealed?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "teams_group_id_fkey";
            columns: ["group_id"];
            isOneToOne: false;
            referencedRelation: "groups";
            referencedColumns: ["id"];
          }
        ];
      };
      players: {
        Row: {
          id: string;
          team_id: string;
          first_name: string;
          last_name: string;
          dorsal: number | null;
          position: "goalkeeper" | "defender" | "midfielder" | "forward" | null;
          photo_url: string | null;
          date_of_birth: string | null;
          is_captain: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          team_id: string;
          first_name: string;
          last_name: string;
          dorsal?: number | null;
          position?: "goalkeeper" | "defender" | "midfielder" | "forward" | null;
          photo_url?: string | null;
          date_of_birth?: string | null;
          is_captain?: boolean;
        };
        Update: {
          team_id?: string;
          first_name?: string;
          last_name?: string;
          dorsal?: number | null;
          position?: "goalkeeper" | "defender" | "midfielder" | "forward" | null;
          photo_url?: string | null;
          date_of_birth?: string | null;
          is_captain?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "players_team_id_fkey";
            columns: ["team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          }
        ];
      };
      matches: {
        Row: {
          id: string;
          team_a_id: string;
          team_b_id: string;
          score_a: number | null;
          score_b: number | null;
          penalty_a: number | null;
          penalty_b: number | null;
          group_id: string | null;
          stage: "group" | "round_of_32" | "round_of_16" | "quarterfinal" | "semifinal" | "third_place" | "final";
          status: "scheduled" | "in_progress" | "completed" | "postponed" | "cancelled";
          match_date: string | null;
          venue: string | null;
          round: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          team_a_id: string;
          team_b_id: string;
          score_a?: number | null;
          score_b?: number | null;
          penalty_a?: number | null;
          penalty_b?: number | null;
          group_id?: string | null;
          stage?: "group" | "round_of_32" | "round_of_16" | "quarterfinal" | "semifinal" | "third_place" | "final";
          status?: "scheduled" | "in_progress" | "completed" | "postponed" | "cancelled";
          match_date?: string | null;
          venue?: string | null;
          round?: number | null;
        };
        Update: {
          team_a_id?: string;
          team_b_id?: string;
          score_a?: number | null;
          score_b?: number | null;
          penalty_a?: number | null;
          penalty_b?: number | null;
          group_id?: string | null;
          stage?: "group" | "round_of_32" | "round_of_16" | "quarterfinal" | "semifinal" | "third_place" | "final";
          status?: "scheduled" | "in_progress" | "completed" | "postponed" | "cancelled";
          match_date?: string | null;
          venue?: string | null;
          round?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "matches_team_a_id_fkey";
            columns: ["team_a_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "matches_team_b_id_fkey";
            columns: ["team_b_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "matches_group_id_fkey";
            columns: ["group_id"];
            isOneToOne: false;
            referencedRelation: "groups";
            referencedColumns: ["id"];
          }
        ];
      };
      player_match_stats: {
        Row: {
          id: string;
          player_id: string;
          match_id: string;
          goals: number;
          assists: number;
          yellow_cards: number;
          red_cards: number;
          is_mvp: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          player_id: string;
          match_id: string;
          goals?: number;
          assists?: number;
          yellow_cards?: number;
          red_cards?: number;
          is_mvp?: boolean;
        };
        Update: {
          goals?: number;
          assists?: number;
          yellow_cards?: number;
          red_cards?: number;
          is_mvp?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "player_match_stats_player_id_fkey";
            columns: ["player_id"];
            isOneToOne: false;
            referencedRelation: "players";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "player_match_stats_match_id_fkey";
            columns: ["match_id"];
            isOneToOne: false;
            referencedRelation: "matches";
            referencedColumns: ["id"];
          }
        ];
      };
      team_registrations: {
        Row: {
          id: string;
          team_name: string;
          city: string;
          captain_first_name: string;
          captain_last_name: string;
          captain_phone: string;
          captain_email: string;
          clerk_user_id: string;
          registration_status: "pending_payment" | "paid" | "approved" | "rejected";
          stripe_session_id: string | null;
          stripe_payment_intent_id: string | null;
          amount_paid: number | null;
          registered_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          team_name: string;
          city: string;
          captain_first_name: string;
          captain_last_name: string;
          captain_phone: string;
          captain_email: string;
          clerk_user_id: string;
          registration_status?: "pending_payment" | "paid" | "approved" | "rejected";
          stripe_session_id?: string | null;
          stripe_payment_intent_id?: string | null;
          amount_paid?: number | null;
        };
        Update: {
          team_name?: string;
          city?: string;
          captain_first_name?: string;
          captain_last_name?: string;
          captain_phone?: string;
          captain_email?: string;
          registration_status?: "pending_payment" | "paid" | "approved" | "rejected";
          stripe_session_id?: string | null;
          stripe_payment_intent_id?: string | null;
          amount_paid?: number | null;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      group_standings: {
        Row: {
          group_id: string;
          group_name: string;
          team_id: string;
          team_name: string;
          team_slug: string;
          logo_url: string | null;
          pj: number;
          pg: number;
          pe: number;
          pp: number;
          gf: number;
          gc: number;
          dg: number;
          pts: number;
        };
        Relationships: [];
      };
      top_scorers: {
        Row: {
          player_id: string;
          first_name: string;
          last_name: string;
          team_id: string;
          team_name: string;
          team_slug: string;
          total_goals: number;
        };
        Relationships: [];
      };
      top_assists: {
        Row: {
          player_id: string;
          first_name: string;
          last_name: string;
          team_id: string;
          team_name: string;
          team_slug: string;
          total_assists: number;
        };
        Relationships: [];
      };
    };
    Functions: Record<string, never>;
    Enums: {
      match_stage: "group" | "round_of_32" | "round_of_16" | "quarterfinal" | "semifinal" | "third_place" | "final";
      match_status: "scheduled" | "in_progress" | "completed" | "postponed" | "cancelled";
      player_position: "goalkeeper" | "defender" | "midfielder" | "forward";
    };
    CompositeTypes: Record<string, never>;
  };
};

export type Group = Database["public"]["Tables"]["groups"]["Row"];
export type Team = Database["public"]["Tables"]["teams"]["Row"];
export type Player = Database["public"]["Tables"]["players"]["Row"];
export type Match = Database["public"]["Tables"]["matches"]["Row"];
export type PlayerMatchStats = Database["public"]["Tables"]["player_match_stats"]["Row"];
export type GroupStanding = Database["public"]["Views"]["group_standings"]["Row"];
export type TopScorer = Database["public"]["Views"]["top_scorers"]["Row"];
export type TopAssist = Database["public"]["Views"]["top_assists"]["Row"];
export type TeamRegistration = Database["public"]["Tables"]["team_registrations"]["Row"];

export type MatchWithTeams = Match & {
  team_a: Team;
  team_b: Team;
  group: Group | null;
};

export type PlayerWithTeam = Player & {
  team: Team;
};

export type PlayerStatsWithPlayer = PlayerMatchStats & {
  player: PlayerWithTeam;
};
