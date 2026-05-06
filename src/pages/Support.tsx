import { useEffect, useState } from "react";
import { MarketingLayout } from "@/components/MarketingLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Mail, MessageSquare } from "lucide-react";
import { toast } from "sonner";

export default function Support() {
  useEffect(() => { document.title = "Support — RoofRadar"; }, []);
  const [sending, setSending] = useState(false);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      toast.success("Got it — we'll be in touch within one business day.");
      (e.target as HTMLFormElement).reset();
    }, 600);
  };
  return (
    <MarketingLayout>
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold">How can we help?</h1>
        <p className="text-sm text-muted-foreground mt-2">We typically respond within one business day.</p>
        <div className="grid sm:grid-cols-2 gap-4 mt-6">
          <Card className="p-4 flex items-center gap-3"><Mail className="w-5 h-5 text-storm" /><div>
            <div className="text-sm font-semibold">Email</div>
            <a className="text-xs text-muted-foreground underline" href="mailto:support@myroofradar.com">support@myroofradar.com</a>
          </div></Card>
          <Card className="p-4 flex items-center gap-3"><MessageSquare className="w-5 h-5 text-storm" /><div>
            <div className="text-sm font-semibold">In-app chat</div>
            <div className="text-xs text-muted-foreground">Available on Pro & Enterprise</div>
          </div></Card>
        </div>
        <Card className="mt-6 p-6">
          <form onSubmit={submit} className="space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <div><Label htmlFor="name">Your name</Label><Input id="name" required /></div>
              <div><Label htmlFor="email">Email</Label><Input id="email" type="email" required /></div>
            </div>
            <div><Label htmlFor="topic">Topic</Label><Input id="topic" placeholder="Billing, integrations, sales…" /></div>
            <div><Label htmlFor="msg">Message</Label><Textarea id="msg" required rows={5} /></div>
            <Button type="submit" disabled={sending}>{sending ? "Sending…" : "Send message"}</Button>
          </form>
        </Card>
      </div>
    </MarketingLayout>
  );
}
