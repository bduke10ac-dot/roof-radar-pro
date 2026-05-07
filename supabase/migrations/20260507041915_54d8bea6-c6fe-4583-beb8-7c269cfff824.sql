-- Allow inviting team members by email before they have signed up
ALTER TABLE public.team_accounts
  ALTER COLUMN team_user_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS invitee_email text,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active';

-- Function: when a new auth user is created, link any pending invites that
-- were sent to their email address.
CREATE OR REPLACE FUNCTION public.link_team_invites_for_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.team_accounts
     SET team_user_id = NEW.id,
         status = 'active'
   WHERE team_user_id IS NULL
     AND lower(invitee_email) = lower(NEW.email);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_link_invites ON auth.users;
CREATE TRIGGER on_auth_user_created_link_invites
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.link_team_invites_for_new_user();