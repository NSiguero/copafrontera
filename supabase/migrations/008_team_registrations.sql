CREATE TABLE team_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_name TEXT NOT NULL,
  city TEXT NOT NULL,
  captain_first_name TEXT NOT NULL,
  captain_last_name TEXT NOT NULL,
  captain_phone TEXT NOT NULL,
  captain_email TEXT NOT NULL,
  clerk_user_id TEXT NOT NULL,
  registration_status TEXT NOT NULL DEFAULT 'pending_payment'
    CHECK (registration_status IN ('pending_payment', 'paid', 'approved', 'rejected')),
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  amount_paid INTEGER,
  registered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE team_registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public insert" ON team_registrations FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read" ON team_registrations FOR SELECT USING (true);
