import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ProfileDialog } from "@/components/ProfileDialog";
import { LogOut, User as UserIcon } from "lucide-react";

export function UserMenu() {
  const { user, signOut } = useAuth();
  const [openProfile, setOpenProfile] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { setAvatar(null); setName(null); return; }
    supabase
      .from("profiles")
      .select("avatar_url, display_name")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        setAvatar(data?.avatar_url ?? null);
        setName(data?.display_name ?? null);
      });
  }, [user, openProfile]);

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm"><Link to="/login">Log in</Link></Button>
        <Button asChild size="sm"><Link to="/signup">Sign up</Link></Button>
      </div>
    );
  }

  const initials = (name || user.email || "U").slice(0, 2).toUpperCase();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="Open profile menu">
            <Avatar className="w-9 h-9">
              {avatar && <AvatarImage src={avatar} alt="Profile" />}
              <AvatarFallback className="bg-gradient-storm text-white text-xs font-bold">{initials}</AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="text-sm font-medium truncate">{name || "Your account"}</div>
            <div className="text-xs text-muted-foreground truncate">{user.email}</div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setOpenProfile(true)}>
            <UserIcon className="w-4 h-4" /> Profile
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => signOut()}>
            <LogOut className="w-4 h-4" /> Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ProfileDialog open={openProfile} onOpenChange={setOpenProfile} />
    </>
  );
}
