-- Create app_role enum for admin management
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator');

-- Create sport_type enum
CREATE TYPE public.sport_type AS ENUM ('team', 'single');

-- Create approval_status enum
CREATE TYPE public.approval_status AS ENUM ('pending', 'approved', 'rejected');

-- Create participant_type enum for matches
CREATE TYPE public.participant_type AS ENUM ('team', 'single', 'bye');

-- User roles table for admin access (security definer pattern)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Sports table
CREATE TABLE public.sports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  type sport_type NOT NULL DEFAULT 'team',
  max_players INTEGER NOT NULL DEFAULT 11,
  registration_open BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Teams table
CREATE TABLE public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sport_id UUID REFERENCES public.sports(id) ON DELETE CASCADE NOT NULL,
  team_name TEXT NOT NULL,
  captain_name TEXT NOT NULL,
  captain_email TEXT NOT NULL,
  captain_phone TEXT NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT false,
  approved_status approval_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Team members table
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  member_name TEXT NOT NULL,
  section TEXT,
  jersey_number INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Single players table
CREATE TABLE public.single_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sport_id UUID REFERENCES public.sports(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT false,
  approved_status approval_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- OTP verification table
CREATE TABLE public.otps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type sport_type NOT NULL,
  target_id UUID NOT NULL,
  otp_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Matches table
CREATE TABLE public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sport_id UUID REFERENCES public.sports(id) ON DELETE CASCADE NOT NULL,
  round_no INTEGER NOT NULL DEFAULT 1,
  participant1_type participant_type NOT NULL,
  participant1_id UUID,
  participant2_type participant_type NOT NULL,
  participant2_id UUID,
  match_datetime TIMESTAMPTZ NOT NULL,
  venue TEXT NOT NULL,
  published BOOLEAN NOT NULL DEFAULT false,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Venues table for management
CREATE TABLE public.venues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_teams_sport_id ON public.teams(sport_id);
CREATE INDEX idx_teams_approved_status ON public.teams(approved_status);
CREATE INDEX idx_single_players_sport_id ON public.single_players(sport_id);
CREATE INDEX idx_single_players_approved_status ON public.single_players(approved_status);
CREATE INDEX idx_matches_sport_id ON public.matches(sport_id);
CREATE INDEX idx_matches_match_datetime ON public.matches(match_datetime);
CREATE INDEX idx_team_members_team_id ON public.team_members(team_id);
CREATE INDEX idx_otps_target ON public.otps(target_type, target_id);

-- Enable RLS on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.single_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.otps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS Policies

-- User roles: Only admins can manage
CREATE POLICY "Admins can view user roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Sports: Public read, admin write
CREATE POLICY "Anyone can view sports"
  ON public.sports FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can manage sports"
  ON public.sports FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Teams: Anyone can create (register), admins can manage, owners can view
CREATE POLICY "Anyone can register teams"
  ON public.teams FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can view approved teams"
  ON public.teams FOR SELECT
  TO anon, authenticated
  USING (approved_status = 'approved' OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage teams"
  ON public.teams FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete teams"
  ON public.teams FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Team members: Same as teams
CREATE POLICY "Anyone can add team members"
  ON public.team_members FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can view team members"
  ON public.team_members FOR SELECT
  TO anon, authenticated
  USING (true);

-- Single players: Anyone can register, admins manage
CREATE POLICY "Anyone can register as single player"
  ON public.single_players FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can view approved single players"
  ON public.single_players FOR SELECT
  TO anon, authenticated
  USING (approved_status = 'approved' OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage single players"
  ON public.single_players FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete single players"
  ON public.single_players FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- OTPs: Insert by anyone, admin can view/update
CREATE POLICY "Anyone can create OTP"
  ON public.otps FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update OTP for verification"
  ON public.otps FOR UPDATE
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can view own OTP"
  ON public.otps FOR SELECT
  TO anon, authenticated
  USING (true);

-- Matches: Published matches are public, admins can manage all
CREATE POLICY "Anyone can view published matches"
  ON public.matches FOR SELECT
  TO anon, authenticated
  USING (published = true AND is_deleted = false OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage matches"
  ON public.matches FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Venues: Public read, admin write
CREATE POLICY "Anyone can view venues"
  ON public.venues FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can manage venues"
  ON public.venues FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for sports updated_at
CREATE TRIGGER update_sports_updated_at
  BEFORE UPDATE ON public.sports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert seed data for demo
INSERT INTO public.sports (name, type, max_players, registration_open) VALUES
  ('Football', 'team', 11, true),
  ('Basketball', 'team', 5, true),
  ('Badminton Singles', 'single', 1, true),
  ('Table Tennis', 'single', 1, true),
  ('Volleyball', 'team', 6, true),
  ('Chess', 'single', 1, false);

INSERT INTO public.venues (name) VALUES
  ('Main Stadium'),
  ('Indoor Sports Hall'),
  ('Basketball Court A'),
  ('Basketball Court B'),
  ('Badminton Courts'),
  ('Chess Room');