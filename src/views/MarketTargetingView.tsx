import { useMemo, useState } from "react";
import { Plus, Trash2, Save, Upload, Target, MapPin, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMarkets, STATES, REGIONS, COUNTIES, scoreMarket, type MarketFilters, type SavedMarket } from "@/contexts/MarketContext";
import { useLeads } from "@/hooks/useLeads";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function MarketTargetingView() {
  const { markets, loading, saving, activeMarketId, setActiveMarketId, saveMarket, updateMarket, deleteMarket } = useMarkets();
  const { leads } = useLeads();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [states, setStates] = useState<string[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [counties, setCounties] = useState<string[]>([]);
  const [cityInput, setCityInput] = useState("");
  const [cities, setCities] = useState<string[]>([]);
  const [zipInput, setZipInput] = useState("");
  const [zips, setZips] = useState<string[]>([]);
  const [minHail, setMinHail] = useState([0]);
  const [minWind, setMinWind] = useState([0]);
  const [minConfidence, setMinConfidence] = useState([0]);
  const [minAffected, setMinAffected] = useState([0]);
  const [minRoofAge, setMinRoofAge] = useState([0]);
  const [minHomeValue, setMinHomeValue] = useState([0]);
  const [minClaim, setMinClaim] = useState([0]);
  const [stormDateFrom, setStormDateFrom] = useState("");

  const resetForm = () => {
    setEditingId(null);
    setName(""); setStates([]); setRegions([]); setCounties([]); setCities([]); setZips([]);
    setMinHail([0]); setMinWind([0]); setMinConfidence([0]); setMinAffected([0]);
    setMinRoofAge([0]); setMinHomeValue([0]); setMinClaim([0]); setStormDateFrom("");
  };

  const startEdit = (m: typeof markets[number]) => {
    setEditingId(m.id);
    setName(m.name);
    setStates(m.states); setRegions(m.regions); setCounties(m.counties);
    setCities(m.cities); setZips(m.zips);
    setMinHail([m.filters.minHail ?? 0]); setMinWind([m.filters.minWind ?? 0]);
    setMinConfidence([m.filters.minConfidence ?? 0]); setMinAffected([m.filters.minAffected ?? 0]);
    setMinRoofAge([m.filters.minRoofAge ?? 0]); setMinHomeValue([m.filters.minHomeValue ?? 0]);
    setMinClaim([m.filters.minClaimScore ?? 0]); setStormDateFrom(m.filters.stormDateFrom ?? "");
  };

  const toggleIn = <T,>(arr: T[], v: T) => arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v];

  const handleAddZip = () => {
    const cleaned = zipInput.split(/[\s,]+/).map(z => z.trim()).filter(z => /^\d{5}$/.test(z));
    if (cleaned.length === 0) { toast.error("Enter valid 5-digit ZIPs"); return; }
    setZips(prev => Array.from(new Set([...prev, ...cleaned])));
    setZipInput("");
  };

  const handleZipCsv = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      const found = Array.from(new Set(text.match(/\b\d{5}\b/g) ?? []));
      setZips(prev => Array.from(new Set([...prev, ...found])));
      toast.success(`Imported ${found.length} ZIP codes`);
    };
    reader.readAsText(f);
    e.target.value = "";
  };

  const handleAddCity = () => {
    const v = cityInput.trim(); if (!v) return;
    setCities(prev => Array.from(new Set([...prev, v])));
    setCityInput("");
  };

  const filters: MarketFilters = {
    minHail: minHail[0] || undefined,
    minWind: minWind[0] || undefined,
    stormDateFrom: stormDateFrom || undefined,
    minConfidence: minConfidence[0] || undefined,
    minAffected: minAffected[0] || undefined,
    minRoofAge: minRoofAge[0] || undefined,
    minHomeValue: minHomeValue[0] || undefined,
    minClaimScore: minClaim[0] || undefined,
  };

  const draft = { name, states, regions, counties, cities, zips, filters };
  const draftScore = useMemo(() => scoreMarket(
    { id: "draft", createdAt: Date.now(), ...draft },
    {
      stormCount: 3,
      avgHail: minHail[0] || 1.2,
      avgWind: minWind[0] || 60,
      affectedHomes: minAffected[0] || 1500,
      avgRoofAge: minRoofAge[0] || 14,
      avgHomeValue: minHomeValue[0] || 350000,
      claimScore: minClaim[0] || 55,
      competition: 3,
      distanceMi: 25,
    }
  ), [draft, minHail, minWind, minAffected, minRoofAge, minHomeValue, minClaim]);

  const handleSave = async () => {
    if (!name.trim()) { toast.error("Give this market a name"); return; }
    const m = await saveMarket(draft);
    if (!m) return;
    toast.success(`Saved "${m.name}"`);
    setName(""); setStates([]); setRegions([]); setCounties([]); setCities([]); setZips([]);
    setMinHail([0]); setMinWind([0]); setMinConfidence([0]); setMinAffected([0]);
    setMinRoofAge([0]); setMinHomeValue([0]); setMinClaim([0]); setStormDateFrom("");
  };

  return (
    <div className="space-y-5">
      <header className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2"><Target className="w-6 h-6 text-storm" /> Market Targeting</h1>
          <p className="text-sm text-muted-foreground">Define territories by geography and storm criteria. Saved markets feed Map and Campaigns.</p>
        </div>
      </header>

      <Tabs defaultValue="builder">
        <TabsList>
          <TabsTrigger value="builder">Build market</TabsTrigger>
          <TabsTrigger value="saved">Saved markets ({markets.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="mt-5 space-y-5">
          <div className="grid lg:grid-cols-[1fr_320px] gap-5">
            <div className="space-y-5">
              <Card title="Geography">
                <div className="grid sm:grid-cols-2 gap-4">
                  <ChipGroup label="States" items={STATES.map(s => ({ value: s.code, label: s.name }))} selected={states} onToggle={v => setStates(p => toggleIn(p, v))} />
                  <ChipGroup label="Regions" items={REGIONS.map(r => ({ value: r, label: r }))} selected={regions} onToggle={v => setRegions(p => toggleIn(p, v))} />
                </div>
                <ChipGroup label="Counties" items={COUNTIES.map(c => ({ value: c, label: c }))} selected={counties} onToggle={v => setCounties(p => toggleIn(p, v))} />

                <div>
                  <Label className="text-xs text-muted-foreground">Cities</Label>
                  <div className="flex gap-2 mt-1.5">
                    <Input value={cityInput} onChange={e => setCityInput(e.target.value)} placeholder="e.g. Hendersonville" onKeyDown={e => e.key === "Enter" && handleAddCity()} />
                    <Button type="button" variant="outline" onClick={handleAddCity}><Plus className="w-4 h-4" /></Button>
                  </div>
                  <ChipList items={cities} onRemove={v => setCities(p => p.filter(x => x !== v))} />
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">ZIP codes</Label>
                  <div className="flex gap-2 mt-1.5">
                    <Input value={zipInput} onChange={e => setZipInput(e.target.value)} placeholder="37075, 37066, 37087" onKeyDown={e => e.key === "Enter" && handleAddZip()} />
                    <Button type="button" variant="outline" onClick={handleAddZip}><Plus className="w-4 h-4" /></Button>
                    <Button asChild type="button" variant="outline">
                      <label className="cursor-pointer"><Upload className="w-4 h-4 mr-1" />CSV
                        <input type="file" accept=".csv,.txt" className="hidden" onChange={handleZipCsv} />
                      </label>
                    </Button>
                  </div>
                  <ChipList items={zips} onRemove={v => setZips(p => p.filter(x => x !== v))} />
                </div>
              </Card>

              <Card title="Storm & property filters">
                <div className="grid sm:grid-cols-2 gap-x-6 gap-y-4">
                  <SliderRow label="Min hail size" value={minHail} onChange={setMinHail} max={3} step={0.25} format={v => `${v}"`} />
                  <SliderRow label="Min wind speed" value={minWind} onChange={setMinWind} max={120} step={5} format={v => `${v} mph`} />
                  <SliderRow label="Min hail swath confidence" value={minConfidence} onChange={setMinConfidence} max={100} step={5} format={v => `${v}%`} />
                  <SliderRow label="Min affected homes" value={minAffected} onChange={setMinAffected} max={10000} step={250} format={v => v.toLocaleString()} />
                  <SliderRow label="Min estimated roof age" value={minRoofAge} onChange={setMinRoofAge} max={30} step={1} format={v => `${v} yrs`} />
                  <SliderRow label="Min home value" value={minHomeValue} onChange={setMinHomeValue} max={1000000} step={25000} format={v => `$${(v / 1000).toFixed(0)}k`} />
                  <SliderRow label="Min claim likelihood score" value={minClaim} onChange={setMinClaim} max={100} step={5} format={v => `${v}`} />
                  <div>
                    <Label className="text-xs text-muted-foreground">NOAA storm reports since</Label>
                    <Input type="date" value={stormDateFrom} onChange={e => setStormDateFrom(e.target.value)} className="mt-1.5" />
                  </div>
                </div>
              </Card>
            </div>

            <aside className="space-y-4">
              <div className="bg-card rounded-xl p-5 shadow-card border border-border/60">
                <div className="text-sm font-medium text-muted-foreground">Market Opportunity Score</div>
                <div className={cn("text-5xl font-bold tracking-tight mt-2",
                  draftScore >= 80 ? "text-warning" : draftScore >= 60 ? "text-storm" : "text-muted-foreground")}>
                  {draftScore}
                </div>
                <div className="text-xs text-muted-foreground mt-1">Storm activity, homes affected, roof age, value, claim probability, competition & distance</div>
              </div>
              <div className="bg-card rounded-xl p-5 shadow-card border border-border/60 space-y-3">
                <Label>Market name</Label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Sumner County Hail Zone" />
                <Button onClick={handleSave} disabled={saving} className="w-full"><Save className="w-4 h-4 mr-2" />{saving ? "Saving…" : "Save market"}</Button>
                <div className="text-xs text-muted-foreground">Mock leads available in scope: <span className="font-semibold text-foreground">{leads.length}</span></div>
              </div>
            </aside>
          </div>
        </TabsContent>

        <TabsContent value="saved" className="mt-5">
          {loading ? (
            <div className="text-sm text-muted-foreground py-8 text-center">Loading saved markets…</div>
          ) : markets.length === 0 ? (
            <div className="text-sm text-muted-foreground py-8 text-center">No saved markets yet — build one in the Builder tab.</div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {markets.map(m => (
                <SavedMarketCard
                  key={m.id}
                  market={m}
                  active={m.id === activeMarketId}
                  onActivate={() => { setActiveMarketId(m.id === activeMarketId ? null : m.id); toast.success(m.id === activeMarketId ? "Cleared active market" : `Active: ${m.name}`); }}
                  onDelete={() => { deleteMarket(m.id); toast.success("Market removed"); }}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card rounded-xl p-5 shadow-card border border-border/60 space-y-4">
      <h2 className="font-semibold">{title}</h2>
      {children}
    </div>
  );
}

function ChipGroup({ label, items, selected, onToggle }: { label: string; items: { value: string; label: string }[]; selected: string[]; onToggle: (v: string) => void }) {
  return (
    <div>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="flex flex-wrap gap-1.5 mt-1.5">
        {items.map(i => (
          <button key={i.value} type="button" onClick={() => onToggle(i.value)}
            className={cn("px-2.5 py-1 rounded-md text-xs border transition-colors",
              selected.includes(i.value) ? "bg-storm text-storm-foreground border-storm" : "bg-background border-border hover:border-storm/50")}>
            {i.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function ChipList({ items, onRemove }: { items: string[]; onRemove: (v: string) => void }) {
  if (items.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {items.map(i => (
        <Badge key={i} variant="secondary" className="gap-1">
          {i}
          <button onClick={() => onRemove(i)} className="hover:text-destructive">×</button>
        </Badge>
      ))}
    </div>
  );
}

function SliderRow({ label, value, onChange, max, step, format }: { label: string; value: number[]; onChange: (v: number[]) => void; max: number; step: number; format: (v: number) => string }) {
  return (
    <div>
      <Label className="text-xs text-muted-foreground flex justify-between">
        <span>{label}</span><span className="font-semibold text-foreground">{format(value[0])}</span>
      </Label>
      <Slider value={value} onValueChange={onChange} max={max} step={step} className="mt-2" />
    </div>
  );
}

function SavedMarketCard({ market, active, onActivate, onDelete }: { market: SavedMarket; active: boolean; onActivate: () => void; onDelete: () => void }) {
  const score = scoreMarket(market, {
    stormCount: 3, avgHail: market.filters.minHail ?? 1.2, avgWind: market.filters.minWind ?? 60,
    affectedHomes: market.filters.minAffected ?? 1500, avgRoofAge: market.filters.minRoofAge ?? 14,
    avgHomeValue: market.filters.minHomeValue ?? 350000, claimScore: market.filters.minClaimScore ?? 55,
    competition: 3, distanceMi: 25,
  });
  const tags = [
    ...market.states, ...market.regions, ...market.counties, ...market.cities,
    ...(market.zips.length ? [`${market.zips.length} ZIPs`] : []),
  ];
  return (
    <div className={cn("bg-card rounded-xl p-4 shadow-card border transition", active ? "border-storm ring-2 ring-storm/30" : "border-border/60")}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-semibold flex items-center gap-2"><MapPin className="w-4 h-4 text-storm" />{market.name}</div>
          <div className="text-xs text-muted-foreground mt-0.5">Saved {new Date(market.createdAt).toLocaleDateString()}</div>
        </div>
        <div className={cn("text-xl font-bold tabular-nums",
          score >= 80 ? "text-warning" : score >= 60 ? "text-storm" : "text-muted-foreground")}>{score}</div>
      </div>
      <div className="flex flex-wrap gap-1 mt-3">
        {tags.slice(0, 6).map(t => <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>)}
      </div>
      <div className="flex gap-2 mt-4">
        <Button size="sm" variant={active ? "default" : "outline"} className="flex-1" onClick={onActivate}>
          <Layers className="w-3.5 h-3.5 mr-1.5" />{active ? "Active" : "Activate"}
        </Button>
        <Button size="sm" variant="ghost" onClick={onDelete}><Trash2 className="w-3.5 h-3.5" /></Button>
      </div>
    </div>
  );
}
