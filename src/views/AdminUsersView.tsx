import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ShieldCheck, ShieldOff, Search } from "lucide-react";

type RoleRow = { id: string; user_id: string; role: "admin" | "user"; created_at: string };

export function AdminUsersView() {
  const { user } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const [rows, setRows] = useState<RoleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [newId, setNewId] = useState("");

  const refresh = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("user_roles")
      .select("id, user_id, role, created_at")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setRows((data as RoleRow[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { if (isAdmin) refresh(); }, [isAdmin]);

  if (roleLoading) return <div className="text-sm text-muted-foreground">Loading…</div>;
  if (!isAdmin) {
    return (
      <Card className="p-6 max-w-lg">
        <h2 className="font-semibold">Admin only</h2>
        <p className="text-sm text-muted-foreground mt-1">You need the admin role to view this page.</p>
      </Card>
    );
  }

  const promote = async () => {
    if (!newId.trim()) return;
    const { error } = await supabase.from("user_roles").insert({ user_id: newId.trim(), role: "admin" });
    if (error) return toast.error(error.message);
    toast.success("Admin granted");
    setNewId("");
    refresh();
  };

  const removeAdmin = async (row: RoleRow) => {
    if (row.user_id === user?.id) {
      if (!confirm("Remove your own admin access? You won't be able to undo this from the app.")) return;
    }
    const { error } = await supabase.from("user_roles").delete().eq("id", row.id).eq("role", "admin");
    if (error) return toast.error(error.message);
    setRows((rs) => rs.filter((r) => r.id !== row.id));
  };

  const filtered = rows.filter((r) => !q || r.user_id.includes(q));
  const admins = filtered.filter((r) => r.role === "admin");

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin · Users & Roles</h1>
        <p className="text-sm text-muted-foreground">Grant or revoke admin access. Admins can manage app-wide settings.</p>
      </div>

      <Card className="p-4">
        <div className="text-sm font-semibold mb-2">Role management</div>
        <p className="text-xs text-muted-foreground">
          For security, admin roles can no longer be granted or revoked from the client. Role changes are
          restricted to trusted backend processes (service role) to prevent privilege‑escalation attacks.
          Manage roles through a secured backend function or directly in the Cloud database.
        </p>
      </Card>

      <Card className="p-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between gap-3">
          <div className="font-semibold text-sm">Current admins ({admins.length})</div>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter by ID" className="h-8 pl-7 w-56 text-xs" />
          </div>
        </div>
        {loading ? (
          <div className="p-6 text-sm text-muted-foreground">Loading…</div>
        ) : admins.length === 0 ? (
          <div className="p-6 text-sm text-muted-foreground">No admins match.</div>
        ) : (
          <div className="divide-y divide-border">
            {admins.map((row) => (
              <div key={row.id} className="px-4 py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs font-mono truncate">{row.user_id}</div>
                  <div className="text-[11px] text-muted-foreground">Granted {new Date(row.created_at).toLocaleDateString()}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-storm border-storm/40 bg-storm/10">admin</Badge>
                  <Button variant="ghost" size="sm" onClick={() => removeAdmin(row)}>
                    <ShieldOff className="w-3.5 h-3.5" /> Revoke
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
