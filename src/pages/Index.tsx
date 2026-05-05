import { useState } from "react";
import { AppSidebar, type View } from "@/components/AppSidebar";
import { DashboardView } from "@/views/DashboardView";
import { LeadsView } from "@/views/LeadsView";
import { MapView } from "@/views/MapView";
import { MarketTargetingView } from "@/views/MarketTargetingView";
import { CampaignsView } from "@/views/CampaignsView";
import { ComplianceView } from "@/views/ComplianceView";
import { IntegrationsView } from "@/views/IntegrationsView";
import { CloudLightning, Bell, Search, Target } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MarketProvider, useMarkets } from "@/contexts/MarketContext";
import { Badge } from "@/components/ui/badge";

function ActiveMarketChip() {
  const { activeMarket, setActiveMarketId } = useMarkets();
  if (!activeMarket) return null;
  return (
    <button
      onClick={() => setActiveMarketId(null)}
      className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-storm/15 text-storm border border-storm/30 text-xs font-medium hover:bg-storm/20"
      title="Click to clear active market"
    >
      <Target className="w-3.5 h-3.5" />
      {activeMarket.name}
      <span className="opacity-70 ml-1">×</span>
    </button>
  );
}

const Shell = () => {
  const [view, setView] = useState<View>("dashboard");

  return (
    <div className="min-h-screen flex bg-background">
      <AppSidebar active={view} onNavigate={setView} />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-background/85 backdrop-blur border-b border-border flex items-center gap-3 px-4 md:px-6 h-14">
          <div className="md:hidden flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-gradient-storm flex items-center justify-center">
              <CloudLightning className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold">RoofRadar</span>
          </div>
          <div className="md:hidden ml-auto">
            <Select value={view} onValueChange={(v) => setView(v as View)}>
              <SelectTrigger className="w-40 h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="dashboard">Dashboard</SelectItem>
                <SelectItem value="leads">Leads</SelectItem>
                <SelectItem value="map">Map</SelectItem>
                <SelectItem value="markets">Market Targeting</SelectItem>
                <SelectItem value="campaigns">Campaigns</SelectItem>
                <SelectItem value="compliance">Compliance</SelectItem>
                <SelectItem value="integrations">Integrations</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="hidden md:flex relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search addresses, owners, parcels…" className="pl-9 h-9" />
          </div>
          <ActiveMarketChip />
          <div className="hidden md:flex items-center gap-3 ml-auto">
            <button className="relative p-2 rounded-md hover:bg-accent">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-warning" />
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-storm text-white flex items-center justify-center text-xs font-bold">RR</div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 max-w-7xl w-full">
          {view === "dashboard" && <DashboardView />}
          {view === "leads" && <LeadsView />}
          {view === "map" && <MapView />}
          {view === "markets" && <MarketTargetingView />}
          {view === "campaigns" && <CampaignsView />}
          {view === "compliance" && <ComplianceView />}
          {view === "integrations" && <IntegrationsView />}
        </main>
      </div>
    </div>
  );
};

const Index = () => (
  <MarketProvider>
    <Shell />
  </MarketProvider>
);

export default Index;
