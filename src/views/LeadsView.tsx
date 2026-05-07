import { useState, useMemo, useEffect } from "react";
import { Search, Download, Save, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { StatusBadge, StormScoreBadge, ConsentBadge } from "@/components/StormScoreBadge";
import { type Lead } from "@/lib/mockData";
import { useMarketLeads } from "@/hooks/useMarketFilter";
import { useLeads } from "@/hooks/useLeads";
import { LeadImportDialog } from "@/components/LeadImportDialog";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { toCsv, downloadCsv } from "@/lib/csv";
import { toast } from "sonner";

export function LeadsView() {
  const { leads, allLeads, activeMarket } = useMarketLeads();
  const { updateLead, deleteLead, refresh, loading, usingMock } = useLeads();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [consent, setConsent] = useState("all");
  const [selected, setSelected] = useState<Lead | null>(null);
  const [form, setForm] = useState<Partial<Lead>>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (selected) setForm({
      ownerName: selected.ownerName, propertyAddress: selected.propertyAddress,
      mailingAddress: selected.mailingAddress, parcelId: selected.parcelId,
      roofAge: selected.roofAge, homeValue: selected.homeValue,
      stormScore: selected.stormScore, status: selected.status,
      phone: selected.phone, email: selected.email, notes: selected.notes,
      smsConsent: selected.smsConsent,
    });
  }, [selected]);

  const handleSave = async () => {
    if (!selected) return;
    setBusy(true);
    const ok = await updateLead(selected.id, form as any);
    setBusy(false);
    if (ok) { toast.success("Lead saved"); setSelected(null); }
  };
  const handleDelete = async () => {
    if (!selected) return;
    if (!confirm("Delete this lead?")) return;
    setBusy(true);
    const ok = await deleteLead(selected.id);
    setBusy(false);
    if (ok) { toast.success("Lead deleted"); setSelected(null); }
  };

  const filtered = useMemo(() => leads.filter(l => {
    if (status !== "all" && l.status !== status) return false;
    if (consent !== "all" && l.consent !== consent) return false;
    if (q && !`${l.ownerName} ${l.propertyAddress} ${l.zip}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [q, status, consent, leads]);

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Lead database</h1>
          <p className="text-sm text-muted-foreground">
            {filtered.length} of {leads.length} property owners
            {activeMarket && <> · scoped to <span className="text-storm font-medium">{activeMarket.name}</span> ({allLeads.length} total)</>}
          </p>
        </div>
        <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2" />Export CSV</Button>
      </header>

      <div className="bg-card rounded-xl p-4 shadow-card border border-border/60 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search name, address, ZIP" className="pl-9" />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="inspection">Inspection</SelectItem>
            <SelectItem value="quoted">Quoted</SelectItem>
            <SelectItem value="won">Won</SelectItem>
            <SelectItem value="lost">Lost</SelectItem>
          </SelectContent>
        </Select>
        <Select value={consent} onValueChange={setConsent}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All consent</SelectItem>
            <SelectItem value="opted_in">Opted in</SelectItem>
            <SelectItem value="no_consent">No consent</SelectItem>
            <SelectItem value="opted_out">Opted out</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card rounded-xl shadow-card border border-border/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr className="text-left">
                <th className="px-4 py-3 font-medium">Owner</th>
                <th className="px-4 py-3 font-medium">Address</th>
                <th className="px-4 py-3 font-medium">Roof</th>
                <th className="px-4 py-3 font-medium">Value</th>
                <th className="px-4 py-3 font-medium">Storm</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Consent</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(l => (
                <tr key={l.id} onClick={() => setSelected(l)} className="border-t border-border/60 hover:bg-accent/50 cursor-pointer">
                  <td className="px-4 py-3 font-medium">{l.ownerName}</td>
                  <td className="px-4 py-3 text-muted-foreground">{l.propertyAddress}</td>
                  <td className="px-4 py-3">{l.roofAge}y</td>
                  <td className="px-4 py-3">${(l.homeValue / 1000).toFixed(0)}k</td>
                  <td className="px-4 py-3"><StormScoreBadge score={l.stormScore} /></td>
                  <td className="px-4 py-3"><StatusBadge status={l.status} /></td>
                  <td className="px-4 py-3"><ConsentBadge consent={l.consent} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Sheet open={!!selected} onOpenChange={() => setSelected(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle>Edit lead</SheetTitle>
              </SheetHeader>
              <div className="mt-5 space-y-4 text-sm">
                <div className="flex items-center gap-2 flex-wrap">
                  <StatusBadge status={(form.status as Lead["status"]) ?? selected.status} />
                  <ConsentBadge consent={selected.consent} />
                  <StormScoreBadge score={form.stormScore ?? selected.stormScore} />
                  {usingMock && (
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">demo data — log in to persist</span>
                  )}
                </div>

                <Field label="Owner name">
                  <Input value={form.ownerName ?? ""} onChange={e => setForm(f => ({ ...f, ownerName: e.target.value }))} />
                </Field>
                <Field label="Property address">
                  <Input value={form.propertyAddress ?? ""} onChange={e => setForm(f => ({ ...f, propertyAddress: e.target.value }))} />
                </Field>
                <Field label="Mailing address">
                  <Input value={form.mailingAddress ?? ""} onChange={e => setForm(f => ({ ...f, mailingAddress: e.target.value }))} />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Parcel ID">
                    <Input value={form.parcelId ?? ""} onChange={e => setForm(f => ({ ...f, parcelId: e.target.value }))} />
                  </Field>
                  <Field label="Status">
                    <Select value={(form.status as string) ?? selected.status} onValueChange={v => setForm(f => ({ ...f, status: v as Lead["status"] }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["new","contacted","inspection","quoted","won","lost"].map(s => (
                          <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Roof age (years)">
                    <Input type="number" value={form.roofAge ?? 0} onChange={e => setForm(f => ({ ...f, roofAge: Number(e.target.value) }))} />
                  </Field>
                  <Field label="Home value ($)">
                    <Input type="number" value={form.homeValue ?? 0} onChange={e => setForm(f => ({ ...f, homeValue: Number(e.target.value) }))} />
                  </Field>
                  <Field label="Storm score">
                    <Input type="number" value={form.stormScore ?? 0} onChange={e => setForm(f => ({ ...f, stormScore: Number(e.target.value) }))} />
                  </Field>
                  <Field label="ZIP">
                    <Input value={selected.zip} disabled />
                  </Field>
                </div>
                <Field label="Phone">
                  <Input value={form.phone ?? ""} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                </Field>
                <Field label="Email">
                  <Input value={form.email ?? ""} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                </Field>
                <Field label="Notes">
                  <Textarea value={form.notes ?? ""} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={4} />
                </Field>

                <div className="flex items-center justify-between pt-2 border-t border-border/60">
                  <Button variant="ghost" onClick={handleDelete} disabled={busy || usingMock}>
                    <Trash2 className="w-4 h-4 mr-2 text-destructive" /> Delete
                  </Button>
                  <Button onClick={handleSave} disabled={busy || usingMock}>
                    <Save className="w-4 h-4 mr-2" /> {busy ? "Saving…" : "Save changes"}
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
