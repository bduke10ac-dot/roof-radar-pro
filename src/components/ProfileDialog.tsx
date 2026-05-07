import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Camera, Loader2, LogOut, Trash2 } from "lucide-react";

type Profile = {
  display_name: string | null;
  company_name: string | null;
  avatar_url: string | null;
  website_url: string | null;
};

export function ProfileDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile>({ display_name: "", company_name: "", avatar_url: null, website_url: "" });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open || !user) return;
    setLoading(true);
    supabase
      .from("profiles")
      .select("display_name, company_name, avatar_url, website_url")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setProfile(data as Profile);
        setLoading(false);
      });
  }, [open, user]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      display_name: profile.display_name,
      company_name: profile.company_name,
      website_url: profile.website_url,
    }).eq("user_id", user.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Profile saved");
    onOpenChange(false);
  };

  const onPick = () => fileRef.current?.click();

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !user) return;
    if (!file.type.startsWith("image/")) return toast.error("Please choose an image");
    if (file.size > 4 * 1024 * 1024) return toast.error("Image must be under 4 MB");
    setUploading(true);
    try {
      const ext = (file.name.split(".").pop() || "png").toLowerCase().replace(/[^a-z0-9]/g, "") || "png";
      const path = `${user.id}/avatar-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, {
        upsert: true, contentType: file.type, cacheControl: "3600",
      });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
      const url = pub.publicUrl;
      const { error } = await supabase.from("profiles").update({ avatar_url: url }).eq("user_id", user.id);
      if (error) throw error;
      setProfile((p) => ({ ...p, avatar_url: url }));
      toast.success("Photo updated");
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = async () => {
    if (!user) return;
    const { error } = await supabase.from("profiles").update({ avatar_url: null }).eq("user_id", user.id);
    if (error) return toast.error(error.message);
    setProfile((p) => ({ ...p, avatar_url: null }));
  };

  const initials = (profile.display_name || user?.email || "U").slice(0, 2).toUpperCase();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Your profile</DialogTitle>
          <DialogDescription>Update your photo and account info.</DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-4 py-2">
          <div className="relative">
            <Avatar className="w-20 h-20">
              {profile.avatar_url && <AvatarImage src={profile.avatar_url} alt="Profile photo" />}
              <AvatarFallback className="text-lg bg-gradient-storm text-white">{initials}</AvatarFallback>
            </Avatar>
            <button
              type="button"
              onClick={onPick}
              disabled={uploading}
              className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow border border-background disabled:opacity-50"
              aria-label="Upload photo"
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
            </button>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFile} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{profile.display_name || user?.email}</div>
            <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
            {profile.avatar_url && (
              <Button variant="ghost" size="sm" className="mt-1 h-7 px-2 text-xs" onClick={removePhoto}>
                <Trash2 className="w-3 h-3" /> Remove photo
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <Label htmlFor="name">Display name</Label>
            <Input id="name" value={profile.display_name ?? ""} onChange={(e) => setProfile({ ...profile, display_name: e.target.value })} placeholder="Your name" disabled={loading} />
          </div>
          <div>
            <Label htmlFor="company">Company</Label>
            <Input id="company" value={profile.company_name ?? ""} onChange={(e) => setProfile({ ...profile, company_name: e.target.value })} placeholder="ACME Roofing" disabled={loading} />
          </div>
          <div>
            <Label htmlFor="website">Website</Label>
            <Input id="website" value={profile.website_url ?? ""} onChange={(e) => setProfile({ ...profile, website_url: e.target.value })} placeholder="https://example.com" disabled={loading} />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2 flex-col-reverse sm:flex-row">
          <Button variant="outline" onClick={async () => { await signOut(); onOpenChange(false); }}>
            <LogOut className="w-4 h-4" /> Sign out
          </Button>
          <Button onClick={save} disabled={saving || loading}>{saving ? "Saving…" : "Save changes"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
