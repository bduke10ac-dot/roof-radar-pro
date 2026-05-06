import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  ShieldCheck, ClipboardCheck, Wrench, Camera, PhoneCall, Truck, Hammer,
  CloudLightning, CalendarDays, History, TrendingUp, Snowflake, Sun, Leaf,
  AlertTriangle, MapPin, Sprout, Zap, CheckCircle2, FileText, Megaphone,
  Wind, CloudRain, Tornado,
} from "lucide-react";
import { useWeather } from "@/contexts/WeatherContext";

/* ------------ Mock long-range data (NOAA CPC + Farmers' Almanac style) ------------ */

type ForecastBand = { label: string; tempAnomaly: "below" | "normal" | "above"; precipAnomaly: "below" | "normal" | "above"; severeRisk: number; note: string; };

const NOAA_30_90_DAY: ForecastBand[] = [
  { label: "Next 30 days",  tempAnomaly: "above",   precipAnomaly: "above",   severeRisk: 72, note: "CPC: elevated severe-storm probability across Mid-South." },
  { label: "30–60 days",    tempAnomaly: "above",   precipAnomaly: "normal",  severeRisk: 58, note: "Warm bias persists; isolated hail clusters likely." },
  { label: "60–90 days",    tempAnomaly: "normal",  precipAnomaly: "above",   severeRisk: 64, note: "Frontal boundaries return — wind & hail uptick." },
];

const NOAA_SEASONAL = [
  { season: "Spring",  outlook: "Above-normal severe weather. Hail corridor active Mar–May.", risk: 82, icon: CloudLightning },
  { season: "Summer",  outlook: "Hot & humid. Microburst wind events likely Jun–Aug.",         risk: 68, icon: Sun },
  { season: "Fall",    outlook: "Tropical remnants possible. Wind-driven rain risk.",          risk: 55, icon: Leaf },
  { season: "Winter",  outlook: "Ice & snow load events. Inspect for granule loss after melt.", risk: 47, icon: Snowflake },
];

const FARMERS_ALMANAC = [
  { month: "Jun",  prediction: "Thunderstorms, periods of heavy rain", severeChance: 70 },
  { month: "Jul",  prediction: "Hot, humid, scattered severe T-storms", severeChance: 65 },
  { month: "Aug",  prediction: "Tropical influence, gusty winds",        severeChance: 60 },
  { month: "Sep",  prediction: "Cooler, frontal storms returning",       severeChance: 58 },
  { month: "Oct",  prediction: "Active storm track, hail possible",      severeChance: 64 },
  { month: "Nov",  prediction: "First freeze; wind events",              severeChance: 50 },
  { month: "Dec",  prediction: "Ice storms possible mid-month",          severeChance: 45 },
  { month: "Jan",  prediction: "Cold snaps, snow load risk",             severeChance: 42 },
  { month: "Feb",  prediction: "Mixed precip, ice damage risk",          severeChance: 48 },
  { month: "Mar",  prediction: "Severe season ramps — hail likely",      severeChance: 78 },
  { month: "Apr",  prediction: "Peak hail/tornado activity",             severeChance: 88 },
  { month: "May",  prediction: "Supercells, large hail events",          severeChance: 84 },
];

const HISTORICAL_EVENTS = [
  { date: "2024-04-09", area: "Sumner County, TN",   type: "Hail",     metric: "2.25\" hail", claims: 1240, payout: "$8.4M" },
  { date: "2023-06-25", area: "Davidson County, TN", type: "Wind",     metric: "82 mph gusts", claims: 980,  payout: "$5.1M" },
  { date: "2023-03-31", area: "Middle TN",           type: "Tornado",  metric: "EF-2",         claims: 2150, payout: "$22.7M" },
  { date: "2022-05-04", area: "Wilson County, TN",   type: "Hail",     metric: "1.75\" hail", claims: 760,  payout: "$3.9M" },
  { date: "2021-03-25", area: "Nashville Metro",     type: "Wind",     metric: "70 mph gusts", claims: 1430, payout: "$6.6M" },
];

const PATTERN_INSIGHTS = [
  "Hail events in this footprint cluster Mar–May with a secondary peak in late Oct.",
  "Wind damage claims spike 48 hours after frontal passages with dewpoints > 65°F.",
  "Roofs > 12 yrs old generate 3.4× more approved claims after 1\"+ hail.",
  "Door-knock conversion is highest in the 72-hour window after a confirmed event.",
];

/* ------------ Checklists ------------ */

const PRE_CHECKLIST = [
  { icon: Truck,         text: "Pre-stage tarps, ladders, and inspection drones in storm corridor" },
  { icon: PhoneCall,     text: "Confirm crew on-call rotation; notify subs of standby window" },
  { icon: Megaphone,     text: "Queue pre-storm awareness SMS/email to opted-in markets" },
  { icon: ClipboardCheck,text: "Pre-fill inspection forms for top 250 storm-scored properties" },
  { icon: ShieldCheck,   text: "Verify insurance/license docs current for affected counties" },
  { icon: FileText,      text: "Sync supplier price sheet & material availability" },
];

const DURING_CHECKLIST = [
  { icon: AlertTriangle, text: "Pause door-knocking when lightning intensity > 70" },
  { icon: MapPin,        text: "Track storm cell ETA against saved markets" },
  { icon: Camera,        text: "Activate live customer reporting form for damage photos" },
];

const POST_CHECKLIST = [
  { icon: Camera,        text: "Dispatch drone inspections within 24h of storm exit" },
  { icon: ClipboardCheck,text: "Auto-create leads for affected properties (storm score boost)" },
  { icon: Hammer,        text: "Schedule emergency tarp/board-up jobs first" },
  { icon: PhoneCall,     text: "Trigger 72-hour post-storm SMS + door-knock route" },
  { icon: FileText,      text: "Generate insurance scope packets with hail/wind metrics" },
  { icon: Wrench,        text: "Reserve material capacity for next 14 days" },
];

const ANOMALY_COLOR: Record<string, string> = {
  above:  "text-destructive",
  below:  "text-storm",
  normal: "text-muted-foreground",
};
const ANOMALY_LABEL: Record<string, string> = { above: "Above normal", below: "Below normal", normal: "Near normal" };

function Section({ title, icon: Icon, children, action }: { title: string; icon: any; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-storm" />
          <h3 className="font-semibold text-sm">{title}</h3>
        </div>
        {action}
      </div>
      {children}
    </Card>
  );
}

function ChecklistCard({ items }: { items: { icon: any; text: string }[] }) {
  const [done, setDone] = useState<Record<number, boolean>>({});
  const completed = Object.values(done).filter(Boolean).length;
  const pct = Math.round((completed / items.length) * 100);
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{completed} / {items.length} complete</span>
        <span className="font-semibold text-storm">{pct}%</span>
      </div>
      <Progress value={pct} className="h-1.5" />
      <div className="space-y-1.5">
        {items.map((it, i) => {
          const Icon = it.icon;
          const isDone = !!done[i];
          return (
            <button
              key={i}
              onClick={() => setDone(s => ({ ...s, [i]: !s[i] }))}
              className={`w-full flex items-start gap-2.5 p-2.5 rounded-md border text-left text-xs transition ${
                isDone ? "bg-success/10 border-success/40 text-foreground" : "bg-background border-border hover:border-storm/40"
              }`}
            >
              <span className={`w-7 h-7 shrink-0 rounded-md flex items-center justify-center ${isDone ? "bg-success text-success-foreground" : "bg-muted text-foreground"}`}>
                {isDone ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
              </span>
              <span className={isDone ? "line-through opacity-70" : ""}>{it.text}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function StormPlaybookView() {
  const { opportunityScore, alerts, marketImpacts } = useWeather();
  const peakMonth = useMemo(
    () => FARMERS_ALMANAC.reduce((a, b) => (a.severeChance > b.severeChance ? a : b)),
    []
  );

  return (
    <section className="space-y-4">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-storm" />
            Storm Playbook
          </h2>
          <p className="text-xs text-muted-foreground">
            Everything you need before, during, and after the storm — with NOAA outlooks, Farmers' Almanac long-range forecasts, and historical patterns.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-storm text-white">Live opportunity {opportunityScore}</Badge>
          <Badge variant="destructive">{alerts.length} active alerts</Badge>
        </div>
      </div>

      <Tabs defaultValue="before">
        <TabsList className="grid grid-cols-4 w-full md:w-auto">
          <TabsTrigger value="before">Before</TabsTrigger>
          <TabsTrigger value="during">During</TabsTrigger>
          <TabsTrigger value="after">After</TabsTrigger>
          <TabsTrigger value="forecasts">Forecasts &amp; History</TabsTrigger>
        </TabsList>

        {/* BEFORE */}
        <TabsContent value="before" className="space-y-4 mt-4">
          <div className="grid lg:grid-cols-2 gap-4">
            <Section title="Pre-storm prep checklist" icon={ClipboardCheck}>
              <ChecklistCard items={PRE_CHECKLIST} />
            </Section>
            <Section title="Markets in the path" icon={MapPin}>
              <div className="space-y-2">
                {marketImpacts.length === 0 && (
                  <div className="text-xs text-muted-foreground">No saved markets currently impacted.</div>
                )}
                {marketImpacts.map(m => (
                  <div key={m.marketId} className="flex items-center justify-between p-2 rounded-md bg-background border border-border/60 text-xs">
                    <div className="min-w-0">
                      <div className="font-medium truncate">{m.marketName}</div>
                      <div className="text-muted-foreground truncate">{m.status} · ETA {m.etaMinutes}m</div>
                    </div>
                    <Badge variant="outline" className="text-[10px]">Sev {m.severity}</Badge>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full mt-2">
                  <Megaphone className="w-3.5 h-3.5" /> Queue pre-storm campaigns
                </Button>
              </div>
            </Section>
          </div>
        </TabsContent>

        {/* DURING */}
        <TabsContent value="during" className="space-y-4 mt-4">
          <Section title="During-storm safety & ops" icon={CloudLightning}>
            <ChecklistCard items={DURING_CHECKLIST} />
          </Section>
        </TabsContent>

        {/* AFTER */}
        <TabsContent value="after" className="space-y-4 mt-4">
          <div className="grid lg:grid-cols-2 gap-4">
            <Section title="Post-storm recovery checklist" icon={Hammer}>
              <ChecklistCard items={POST_CHECKLIST} />
            </Section>
            <Section title="72-hour automation" icon={Zap}>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-md bg-storm/10 border border-storm/40">
                  <div className="font-medium">Auto-generate leads</div>
                  <div className="text-muted-foreground">All properties inside the storm polygon get a score boost and become priority leads.</div>
                </div>
                <div className="p-2.5 rounded-md bg-warning/10 border border-warning/40">
                  <div className="font-medium">Door-knock route</div>
                  <div className="text-muted-foreground">Optimized walking route generated by storm severity & roof age.</div>
                </div>
                <div className="p-2.5 rounded-md bg-success/10 border border-success/40">
                  <div className="font-medium">Insurance scope packet</div>
                  <div className="text-muted-foreground">Auto-built with hail size, wind speed, and storm path GeoJSON.</div>
                </div>
                <Button size="sm" className="w-full">
                  <FileText className="w-3.5 h-3.5" /> Generate post-storm report
                </Button>
              </div>
            </Section>
          </div>
        </TabsContent>

        {/* FORECASTS & HISTORY */}
        <TabsContent value="forecasts" className="space-y-4 mt-4">
          <div className="grid lg:grid-cols-3 gap-4">
            <Section title="NOAA CPC outlook" icon={CalendarDays}>
              <div className="space-y-2">
                {NOAA_30_90_DAY.map(b => (
                  <div key={b.label} className="p-2.5 rounded-md bg-background border border-border/60">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-semibold">{b.label}</div>
                      <Badge variant="outline" className="text-[10px]">Severe {b.severeRisk}</Badge>
                    </div>
                    <div className="text-[11px] mt-1 grid grid-cols-2 gap-1">
                      <span>Temp: <span className={ANOMALY_COLOR[b.tempAnomaly]}>{ANOMALY_LABEL[b.tempAnomaly]}</span></span>
                      <span>Precip: <span className={ANOMALY_COLOR[b.precipAnomaly]}>{ANOMALY_LABEL[b.precipAnomaly]}</span></span>
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-1">{b.note}</div>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">Source: NOAA Climate Prediction Center (mock data — wire to NOAA API).</p>
            </Section>

            <Section title="Seasonal severe-weather risk" icon={TrendingUp}>
              <div className="space-y-2">
                {NOAA_SEASONAL.map(s => {
                  const Icon = s.icon;
                  return (
                    <div key={s.season} className="p-2.5 rounded-md bg-background border border-border/60">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-semibold">
                          <Icon className="w-3.5 h-3.5 text-storm" /> {s.season}
                        </div>
                        <span className="text-xs font-bold text-storm">{s.risk}</span>
                      </div>
                      <Progress value={s.risk} className="h-1.5 mt-1.5" />
                      <div className="text-[11px] text-muted-foreground mt-1">{s.outlook}</div>
                    </div>
                  );
                })}
              </div>
            </Section>

            <Section title="Farmers' Almanac 12-month" icon={Sprout} action={<Badge variant="outline" className="text-[10px]">Peak: {peakMonth.month}</Badge>}>
              <div className="space-y-1">
                {FARMERS_ALMANAC.map(m => (
                  <div key={m.month} className="flex items-center gap-2 text-[11px]">
                    <span className="w-8 font-semibold">{m.month}</span>
                    <div className="flex-1 h-1.5 bg-muted rounded overflow-hidden">
                      <div
                        className={`h-full ${m.severeChance >= 75 ? "bg-destructive" : m.severeChance >= 60 ? "bg-warning" : "bg-storm"}`}
                        style={{ width: `${m.severeChance}%` }}
                      />
                    </div>
                    <span className="w-6 text-right tabular-nums">{m.severeChance}</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">Long-range predictions inspired by Farmers' Almanac (mock).</p>
            </Section>
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            <Section title="Historical storm events (NOAA SPC)" icon={History}>
              <div className="space-y-1.5">
                {HISTORICAL_EVENTS.map(e => {
                  const Icon = e.type === "Hail" ? CloudLightning : e.type === "Wind" ? Wind : e.type === "Tornado" ? Tornado : CloudRain;
                  return (
                    <div key={e.date} className="flex items-center gap-2 p-2 rounded-md bg-background border border-border/60 text-xs">
                      <div className="w-7 h-7 rounded-md bg-storm/15 text-storm flex items-center justify-center shrink-0">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium truncate">{e.area} · {e.metric}</div>
                        <div className="text-[11px] text-muted-foreground">{e.date} · {e.claims.toLocaleString()} claims · {e.payout}</div>
                      </div>
                      <Badge variant="outline" className="text-[10px]">{e.type}</Badge>
                    </div>
                  );
                })}
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">Source: NOAA Storm Events Database (mock — wire to NCEI).</p>
            </Section>

            <Section title="Pattern insights" icon={TrendingUp}>
              <ul className="space-y-2 text-xs">
                {PATTERN_INSIGHTS.map((p, i) => (
                  <li key={i} className="flex items-start gap-2 p-2 rounded-md bg-background border border-border/60">
                    <span className="w-5 h-5 rounded-full bg-storm/15 text-storm text-[11px] flex items-center justify-center shrink-0 font-bold">{i + 1}</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </Section>
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
}
