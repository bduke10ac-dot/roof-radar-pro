import { AlertTriangle, ExternalLink, Loader2, RefreshCw, ShieldCheck } from "lucide-react";
import { useNwsAlerts } from "@/hooks/useNwsAlerts";
import { useMarkets } from "@/contexts/MarketContext";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY",
];

function severityTone(sev: string): "destructive" | "warning" | "storm" | "muted" {
  const s = sev?.toLowerCase();
  if (s === "extreme") return "destructive";
  if (s === "severe") return "warning";
  if (s === "moderate") return "storm";
  return "muted";
}

export function NwsAlertsPanel() {
  const { activeMarket } = useMarkets();
  const defaultState = activeMarket?.states?.[0] ?? "TN";
  const [state, setState] = useState<string>(defaultState);
  const { alerts, loading, error } = useNwsAlerts(state);

  return (
    <div className="bg-card rounded-xl p-5 shadow-card border border-border/60">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-success" />
          <h2 className="font-semibold">Live NWS alerts</h2>
          <Badge variant="outline" className="text-[10px] uppercase">NOAA · Real data</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Select value={state} onValueChange={setState}>
            <SelectTrigger className="h-8 w-24 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent className="max-h-72">
              {US_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          {loading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
          {!loading && <RefreshCw className="w-4 h-4 text-muted-foreground" />}
        </div>
      </div>

      {error && (
        <div className="text-sm text-destructive flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> {error}
        </div>
      )}

      {!loading && !error && alerts.length === 0 && (
        <div className="text-sm text-muted-foreground py-6 text-center">
          No active NWS alerts in {state} right now. ✅
        </div>
      )}

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {alerts.slice(0, 12).map(a => {
          const tone = severityTone(a.severity);
          const toneCls = {
            destructive: "border-destructive/40 bg-destructive/5",
            warning: "border-warning/40 bg-warning/5",
            storm: "border-storm/40 bg-storm/5",
            muted: "border-border/60 bg-background",
          }[tone];
          return (
            <div key={a.id} className={`rounded-lg border p-3 ${toneCls}`}>
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-sm">{a.event}</div>
                  <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{a.area}</div>
                </div>
                <Badge variant="outline" className="text-[10px] capitalize">{a.severity}</Badge>
              </div>
              <p className="text-xs text-foreground/80 mt-2 line-clamp-3">{a.headline}</p>
              <div className="flex items-center justify-between mt-2 text-[10px] text-muted-foreground">
                <span>{a.senderName}</span>
                <span>Expires {new Date(a.expires).toLocaleString()}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 pt-3 border-t border-border/60 text-[11px] text-muted-foreground flex items-center gap-1">
        <ExternalLink className="w-3 h-3" />
        Source: api.weather.gov · refreshed every 60 seconds
      </div>
    </div>
  );
}
