import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { UserPlus, Trash2, Mail, ShieldCheck } from "lucide-react";

type Role = "viewer" | "rep" | "manager";

type TeamRow = {
  id: string;
  team_user_id: string | null;
  invitee_email: string | null;
  role: string | null;
  territory: string | null;
  permissions: any;
  status: string;
  created_at: string;
};

const PERM_KEYS: { key: string; label: string; help: string }[] = [
  { key: "view_leads", label: "View leads", help: "See the leads list and details" },
  { key: "edit_leads", label: "Edit leads", help: "Update status, notes, assignment" },
  { key: "export_leads", label: "Export leads", help: "Download CSV / direct mail lists" },
  { key: "view_map", label: "View map & storms", help: "Access map and storm operations" },
  { key: "create_campaigns", label: "Create campaigns", help: "Send / approve campaigns" },
  { key: "manage_markets", label: "Manage markets", help: "Create or edit markets" },
  { key: "manage_team", label: "Manage team", help: "Invite or remove other teammates" },
];

const DEFAULT_PERMS: Record<Role, Record<string, boolean>> = {
  viewer: { view_leads: true, view_map: true, edit_leads: false, export_leads: false, create_campaigns: false, manage_markets: false, manage_team: false },
  rep:    { view_leads: true, view_map: true, edit_leads: true,  export_leads: false, create_campaigns: false, manage_markets: false, manage_team: false },
  manager:{ view_leads: true, view_map: true, edit_leads: true,  export_leads: true,  create_campaigns: true,  manage_markets: true,  manage_team: false },
};

export function TeamView() {
  const { user } = useAuth();
  const [rows, setRows] = useState<TeamRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("rep");
  const [territory, setTerritory] = useState("");
  const [busy, setBusy] = useState(false);

  const refresh = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("team_accounts")
      .select("id, team_user_id, invitee_email, role, territory, permissions, status, created_at")
      .eq("owner_user_id", user.id)
      .order("created_at", { ascending: false });
    setRows((data as TeamRow[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { refresh(); /* eslint-disable-next-line */ }, [user]);

  const invite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!email.trim()) return toast.error("Enter an email address");
    setBusy(true);
    const { error } = await supabase.from("team_accounts").insert({
      owner_user_id: user.id,
      team_user_id: null,
      invitee_email: email.trim().toLowerCase(),
      role,
      territory: territory || null,
      permissions: DEFAULT_PERMS[role],
      status: "pending",
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Invite added — they'll be linked when they sign up");
    setEmail(""); setTerritory("");
    refresh();
  };

  const updatePermission = async (row: TeamRow, key: string, value: boolean) => {
    const next = { ...(row.permissions || {}), [key]: value };
    setRows((rs) => rs.map((r) => (r.id === row.id ? { ...r, permissions: next } : r)));
    const { error } = await supabase.from("team_accounts").update({ permissions: next }).eq("id", row.id);
    if (error) { toast.error(error.message); refresh(); }
  };

  const updateRole = async (row: TeamRow, nextRole: Role) => {
    const next = { ...DEFAULT_PERMS[nextRole] };
    setRows((rs) => rs.map((r) => (r.id === row.id ? { ...r, role: nextRole, permissions: next } : r)));
    const { error } = await supabase.from("team_accounts").update({ role: nextRole, permissions: next }).eq("id", row.id);
    if (error) { toast.error(error.message); refresh(); }
  };

  const remove = async (row: TeamRow) => {
    if (!confirm("Remove this teammate?")) return;
    const { error } = await supabase.from("team_accounts").delete().eq("id", row.id);
    if (error) return toast.error(error.message);
    setRows((rs) => rs.filter((r) => r.id !== row.id));
  };

  const [resetting, setResetting] = useState(false);
  const resetData = async () => {
    if (!user) return;
    if (!confirm("Delete ALL your leads, properties and contacts? This cannot be undone.")) return;
    setResetting(true);
    try {
      // Find this user's leads first so we can clear their contact methods.
      const { data: leadRows } = await supabase.from("leads").select("id").eq("owner_id", user.id);
      const leadIds = (leadRows ?? []).map((l) => l.id);
      if (leadIds.length > 0) {
        await supabase.from("contact_methods").delete().in("lead_id", leadIds);
      }
      const { error: lErr } = await supabase.from("leads").delete().eq("owner_id", user.id);
      if (lErr) throw lErr;
      const { error: pErr } = await supabase.from("properties").delete().eq("owner_id", user.id);
      if (pErr) throw pErr;
      toast.success("Your test data was reset");
    } catch (err) {
      toast.error("Reset failed", { description: (err as Error)?.message });
    } finally {
      setResetting(false);
    }
  };


  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Team & permissions</h1>
        <p className="text-sm text-muted-foreground">Invite teammates and control what they can access.</p>
      </div>

      <Card className="p-4">
        <form onSubmit={invite} className="grid grid-cols-1 md:grid-cols-[1fr_180px_180px_auto] gap-3 items-end">
          <div>
            <Label htmlFor="invite-email">Invite by email</Label>
            <Input id="invite-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="rep@company.com" />
          </div>
          <div>
            <Label>Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as Role)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="viewer">Viewer</SelectItem>
                <SelectItem value="rep">Sales Rep</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="territory">Territory (optional)</Label>
            <Input id="territory" value={territory} onChange={(e) => setTerritory(e.target.value)} placeholder="North Dallas" />
          </div>
          <Button type="submit" disabled={busy}><UserPlus className="w-4 h-4" /> Invite</Button>
        </form>
      </Card>

      <Card className="p-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <div className="font-semibold text-sm">Teammates</div>
          <div className="text-xs text-muted-foreground">{rows.length} member{rows.length === 1 ? "" : "s"}</div>
        </div>
        {loading ? (
          <div className="p-6 text-sm text-muted-foreground">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="p-6 text-sm text-muted-foreground">No teammates yet. Invite your first rep above.</div>
        ) : (
          <div className="divide-y divide-border">
            {rows.map((row) => (
              <div key={row.id} className="p-4 space-y-3">
                <div className="flex flex-wrap items-center gap-3 justify-between">
                  <div className="min-w-0">
                    <div className="text-sm font-medium flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      {row.invitee_email || "Linked account"}
                      {row.status === "pending" && !row.team_user_id && (
                        <Badge variant="secondary" className="text-[10px]">Pending signup</Badge>
                      )}
                      {row.team_user_id && (
                        <Badge className="bg-success/15 text-success border-success/30 text-[10px]" variant="outline">Active</Badge>
                      )}
                    </div>
                    {row.territory && <div className="text-xs text-muted-foreground mt-0.5">Territory: {row.territory}</div>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Select value={(row.role as Role) || "rep"} onValueChange={(v) => updateRole(row, v as Role)}>
                      <SelectTrigger className="w-36 h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="viewer">Viewer</SelectItem>
                        <SelectItem value="rep">Sales Rep</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="ghost" size="icon" onClick={() => remove(row)} aria-label="Remove">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 pl-1">
                  {PERM_KEYS.map((p) => (
                    <label key={p.key} className="flex items-center justify-between gap-3 text-sm">
                      <div className="min-w-0">
                        <div className="font-medium">{p.label}</div>
                        <div className="text-xs text-muted-foreground">{p.help}</div>
                      </div>
                      <Switch
                        checked={!!row.permissions?.[p.key]}
                        onCheckedChange={(v) => updatePermission(row, p.key, v)}
                      />
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-4 bg-muted/40">
        <div className="flex gap-3">
          <ShieldCheck className="w-5 h-5 text-storm shrink-0 mt-0.5" />
          <div className="text-sm text-muted-foreground">
            Permissions take effect when a teammate signs in with the invited email. Database access is also enforced server-side, so a viewer cannot read or modify data they aren't permitted to.
          </div>
        </div>
      </Card>

      <Card className="p-4 border-destructive/40">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <div className="flex gap-3">
            <Trash2 className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <div className="font-medium text-foreground">Reset my data</div>
              Permanently delete all your leads, properties and contacts. This only affects your account and cannot be undone.
            </div>
          </div>
          <Button variant="destructive" onClick={resetData} disabled={resetting} className="shrink-0">
            <Trash2 className="w-4 h-4" /> {resetting ? "Resetting…" : "Reset data"}
          </Button>
        </div>
      </Card>
    </div>

  );
}
