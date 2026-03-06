-- Migration 6: Storage Buckets

-- Team logos bucket (2MB limit, public read, admin write)
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('team-logos', 'team-logos', true, 2097152);

-- Player photos bucket (5MB limit, public read, admin write)
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('player-photos', 'player-photos', true, 5242880);

-- Storage policies for team-logos
CREATE POLICY "Team logos are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'team-logos');

CREATE POLICY "Admins can upload team logos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'team-logos' AND is_admin());

CREATE POLICY "Admins can update team logos"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'team-logos' AND is_admin());

CREATE POLICY "Admins can delete team logos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'team-logos' AND is_admin());

-- Storage policies for player-photos
CREATE POLICY "Player photos are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'player-photos');

CREATE POLICY "Admins can upload player photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'player-photos' AND is_admin());

CREATE POLICY "Admins can update player photos"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'player-photos' AND is_admin());

CREATE POLICY "Admins can delete player photos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'player-photos' AND is_admin());
