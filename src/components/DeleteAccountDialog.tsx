import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const PHRASE = "DELETE MY ACCOUNT";

export function DeleteAccountDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (text !== PHRASE) return;
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("delete-account", {
        body: { confirmation: PHRASE },
      });
      if (error || data?.error) throw new Error(error?.message || data?.error || "Failed");
      toast.success("Account deleted. Signing you out…");
      await supabase.auth.signOut();
      window.location.href = "/";
    } catch (e) {
      toast.error("Couldn't delete account", { description: e instanceof Error ? e.message : "Try again later." });
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !busy && onOpenChange(v)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" /> Delete account
          </DialogTitle>
          <DialogDescription>
            This permanently deletes your account, leads, markets, automation rules, campaigns, imports,
            preferences, and subscription record. This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="confirm">Type <code className="font-mono text-xs">{PHRASE}</code> to confirm</Label>
          <Input id="confirm" value={text} onChange={(e) => setText(e.target.value)} placeholder={PHRASE} autoComplete="off" />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>Cancel</Button>
          <Button variant="destructive" onClick={submit} disabled={busy || text !== PHRASE}>
            {busy && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
            Permanently delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
