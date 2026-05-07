import { useState, useMemo, useEffect } from "react";
import { Search, Download, Save, Trash2, Phone, MessageSquare, Navigation, ClipboardCheck } from "lucide-react";
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
  const { plan } = useSubscription();
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
        <div className="flex items-center gap-2">
          <LeadImportDialog />
          <Button
            variant="outline"
            size="sm"
            disabled={filtered.length === 0}
            title={filtered.length === 0 ? "No eligible leads to export" : `Export ${filtered.length} leads`}
            onClick={async () => {
              const exportCap = plan.id === "free" ? 25 : plan.id === "starter" ? 1000 : 100000;
              const rows = filtered.slice(0, exportCap).map(l => ({
                owner_name: l.ownerName, property_address: l.propertyAddress,
                mailing_address: l.mailingAddress, zip: l.zip,
                phone: l.phone, email: l.email,
                sms_consent: l.smsConsent ? "yes" : "no",
                dnc_status: l.dncStatus ? "yes" : "no",
                status: l.status, storm_score: l.stormScore,
                roof_age: l.roofAge, home_value: l.homeValue,
                market: activeMarket?.name ?? "",
              }));
              try {
                downloadCsv(`leads-${new Date().toISOString().slice(0,10)}.csv`, toCsv(rows));
                if (filtered.length > exportCap) {
                  toast.warning(`Exported ${exportCap} of ${filtered.length} (${plan.name} plan limit)`);
                } else {
                  toast.success(`Exported ${rows.length} leads`);
                }
                // Best-effort compliance log (silently skip if not authenticated / table policies block)
                if (!usingMock) {
                  const { supabase } = await import("@/integrations/supabase/client");
                  await supabase.from("campaign_compliance_logs").insert(
                    filtered.slice(0, exportCap).map(l => ({
                      lead_id: null,
                      channel: "csv_export",
                      eligible: true,
                      consent_status: l.smsConsent ?? false,
                      dnc_status: l.dncStatus ?? false,
                      message_sent: false,
                    }))
                  );
                }
              } catch (err) {
                toast.error("Export failed", { description: (err as Error)?.message });
              }
            }}
          >
            <Download className="w-4 h-4 mr-2" />Export CSV
          </Button>
        </div>
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

      {/* Mobile: card list — easier to tap, less dense */}
      <div className="md:hidden space-y-2">
        {loading && filtered.length === 0 && Array.from({ length: 5 }).map((_, i) => (
          <div key={`m-s-${i}`} className="bg-card rounded-xl border border-border/60 p-3 animate-pulse h-24" />
        ))}
        {!loading && filtered.length === 0 && (
          <div className="bg-card rounded-xl border border-border/60 px-4 py-10 text-center text-sm text-muted-foreground">
            {leads.length === 0
              ? "No leads yet — import a CSV or add your first lead."
              : "No leads match your filters."}
          </div>
        )}
        {filtered.map(l => (
          <button
            key={l.id}
            onClick={() => setSelected(l)}
            className="w-full text-left bg-card rounded-xl border border-border/60 p-3 active:bg-accent/40 transition-colors min-h-[88px]"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="font-semibold truncate">{l.ownerName}</div>
                <div className="text-xs text-muted-foreground truncate mt-0.5">{l.propertyAddress}</div>
              </div>
              <StormScoreBadge score={l.stormScore} />
            </div>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <StatusBadge status={l.status} />
              <ConsentBadge consent={l.consent} />
              <span className="text-[11px] text-muted-foreground tabular-nums ml-auto">Roof {l.roofAge}y · ${(l.homeValue / 1000).toFixed(0)}k</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 mt-2.5">
              <a
                href={l.phone ? `tel:${l.phone}` : undefined}
                onClick={e => { e.stopPropagation(); if (!l.phone) e.preventDefault(); }}
                className={`flex items-center justify-center gap-1.5 rounded-md border border-border/60 py-2 text-xs font-medium ${l.phone ? "active:bg-accent/50" : "opacity-40 pointer-events-none"}`}
              >
                <Phone className="w-3.5 h-3.5" /> Call
              </a>
              {(() => {
                const canText = !!l.phone && !!l.smsConsent && l.consent === "opted_in" && !l.dncStatus;
                return (
                  <a
                    href={canText ? `sms:${l.phone}` : undefined}
                    onClick={e => {
                      e.stopPropagation();
                      if (!canText) {
                        e.preventDefault();
                        toast.error("Cannot text this lead", { description: !l.phone ? "No phone on file." : l.dncStatus ? "Lead is on DNC list." : "No SMS consent on file." });
                      }
                    }}
                    title={!l.phone ? "No phone" : l.dncStatus ? "DNC" : (!l.smsConsent || l.consent !== "opted_in") ? "No SMS consent" : "Send SMS"}
                    className={`flex items-center justify-center gap-1.5 rounded-md border border-border/60 py-2 text-xs font-medium ${canText ? "active:bg-accent/50" : "opacity-40"}`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> Text
                  </a>
                );
              })()}
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(l.propertyAddress)}`}
                target="_blank"
                rel="noreferrer"
                onClick={e => e.stopPropagation()}
                className="flex items-center justify-center gap-1.5 rounded-md border border-border/60 py-2 text-xs font-medium active:bg-accent/50"
              >
                <Navigation className="w-3.5 h-3.5" /> Route
              </a>
            </div>
          </button>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-card rounded-xl shadow-card border border-border/60 overflow-hidden">
        <div className="overflow-x-auto max-h-[70vh]">
          <table className="w-full text-sm">
            <thead className="bg-muted/80 backdrop-blur sticky top-0 z-10 text-muted-foreground">
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
              {loading && filtered.length === 0 && Array.from({ length: 6 }).map((_, i) => (
                <tr key={`s-${i}`} className="border-t border-border/60 animate-pulse">
                  {Array.from({ length: 7 }).map((__, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-3 rounded bg-muted" /></td>
                  ))}
                </tr>
              ))}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-muted-foreground">
                  {leads.length === 0
                    ? "No leads yet — import a CSV or add your first lead."
                    : "No leads match your filters. Try clearing search or status."}
                </td></tr>
              )}
              {filtered.map(l => (
                <tr key={l.id} onClick={() => setSelected(l)} className="border-t border-border/60 hover:bg-accent/50 cursor-pointer">
                  <td className="px-4 py-3 font-medium">{l.ownerName}</td>
                  <td className="px-4 py-3 text-muted-foreground">{l.propertyAddress}</td>
                  <td className="px-4 py-3 tabular-nums">{l.roofAge}y</td>
                  <td className="px-4 py-3 tabular-nums">${(l.homeValue / 1000).toFixed(0)}k</td>
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

                {/* Quick actions */}
                <div className="grid grid-cols-4 gap-1.5">
                  <a
                    href={selected.phone ? `tel:${selected.phone}` : undefined}
                    className={`flex flex-col items-center justify-center gap-1 rounded-lg border border-border/60 py-2.5 text-[11px] font-medium ${selected.phone ? "active:bg-accent/50" : "opacity-40 pointer-events-none"}`}
                  >
                    <Phone className="w-4 h-4 text-storm" /> Call
                  </a>
                  {(() => {
                    const canText = !!selected.phone && !!selected.smsConsent && selected.consent === "opted_in" && !selected.dncStatus;
                    return (
                      <a
                        href={canText ? `sms:${selected.phone}` : undefined}
                        onClick={e => {
                          if (!canText) {
                            e.preventDefault();
                            toast.error("Cannot text this lead", { description: !selected.phone ? "No phone on file." : selected.dncStatus ? "Lead is on DNC list." : "No SMS consent on file." });
                          }
                        }}
                        className={`flex flex-col items-center justify-center gap-1 rounded-lg border border-border/60 py-2.5 text-[11px] font-medium ${canText ? "active:bg-accent/50" : "opacity-40"}`}
                      >
                        <MessageSquare className="w-4 h-4 text-storm" /> Text
                      </a>
                    );
                  })()}
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(selected.propertyAddress)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex flex-col items-center justify-center gap-1 rounded-lg border border-border/60 py-2.5 text-[11px] font-medium active:bg-accent/50"
                  >
                    <Navigation className="w-4 h-4 text-storm" /> Route
                  </a>
                  <button
                    onClick={async () => {
                      if (usingMock) { toast.error("Log in to update lead status"); return; }
                      setForm(f => ({ ...f, status: "inspection" }));
                      const ok = await updateLead(selected.id, { status: "inspection" });
                      if (ok) toast.success("Marked as inspection");
                    }}
                    className="flex flex-col items-center justify-center gap-1 rounded-lg border border-border/60 py-2.5 text-[11px] font-medium active:bg-accent/50"
                  >
                    <ClipboardCheck className="w-4 h-4 text-storm" /> Inspected
                  </button>
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
