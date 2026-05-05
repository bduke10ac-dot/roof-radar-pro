import { useState, useMemo } from "react";
import { Search, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { StatusBadge, StormScoreBadge, ConsentBadge } from "@/components/StormScoreBadge";
import { mockLeads, type Lead } from "@/lib/mockData";

export function LeadsView() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [consent, setConsent] = useState("all");
  const [selected, setSelected] = useState<Lead | null>(null);

  const filtered = useMemo(() => mockLeads.filter(l => {
    if (status !== "all" && l.status !== status) return false;
    if (consent !== "all" && l.consent !== consent) return false;
    if (q && !`${l.ownerName} ${l.propertyAddress} ${l.zip}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [q, status, consent]);

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Lead database</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} of {mockLeads.length} property owners</p>
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
                <SheetTitle>{selected.ownerName}</SheetTitle>
              </SheetHeader>
              <div className="mt-5 space-y-4 text-sm">
                <div className="flex items-center gap-2">
                  <StatusBadge status={selected.status} />
                  <ConsentBadge consent={selected.consent} />
                  <StormScoreBadge score={selected.stormScore} />
                </div>
                <DetailRow label="Property" value={selected.propertyAddress} />
                <DetailRow label="Mailing" value={selected.mailingAddress} />
                <DetailRow label="Parcel ID" value={selected.parcelId} />
                <div className="grid grid-cols-2 gap-3">
                  <DetailRow label="Roof age" value={`${selected.roofAge} years`} />
                  <DetailRow label="Home value" value={`$${selected.homeValue.toLocaleString()}`} />
                  <DetailRow label="Hail size" value={`${selected.hailSize}"`} />
                  <DetailRow label="Wind speed" value={`${selected.windSpeed} mph`} />
                  <DetailRow label="Last storm" value={selected.lastStormDate} />
                  <DetailRow label="ZIP" value={selected.zip} />
                </div>
                <DetailRow label="Phone" value={selected.phone} />
                <DetailRow label="Email" value={selected.email} />
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Notes</div>
                  <div className="p-3 rounded-md bg-muted text-foreground/90 min-h-[60px]">{selected.notes || "—"}</div>
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
