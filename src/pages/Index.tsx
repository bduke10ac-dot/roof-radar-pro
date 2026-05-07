import { useState } from "react";
import { AppSidebar, type View } from "@/components/AppSidebar";
import { DashboardView } from "@/views/DashboardView";
import { StormOpsView } from "@/views/StormOpsView";
import { LeadsView } from "@/views/LeadsView";
import { MapView } from "@/views/MapView";
import { MarketTargetingView } from "@/views/MarketTargetingView";
import { CampaignsView } from "@/views/CampaignsView";
import { ComplianceView } from "@/views/ComplianceView";
import { IntegrationsView } from "@/views/IntegrationsView";
import { AutoStormCampaignsView } from "@/views/AutoStormCampaignsView";
import { StormPlaybookView } from "@/views/StormPlaybookView";
import { BillingView } from "@/views/BillingView";
import { TeamView } from "@/views/TeamView";
import { AdminUsersView } from "@/views/AdminUsersView";
import { AppReadinessView } from "@/views/AppReadinessView";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { TrialBanner } from "@/components/TrialBanner";
import { UpgradeDialog } from "@/components/UpgradeDialog";
import { CloudLightning, Bell, Search, Target } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MarketProvider, useMarkets } from "@/contexts/MarketContext";
import { Badge } from "@/components/ui/badge";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { UserMenu } from "@/components/UserMenu";

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
      <TrialBanner onUpgrade={() => setView("billing")} />
      <div className="bg-warning/10 border-b border-warning/30 text-[11px] text-warning-foreground/90 px-4 md:px-6 py-1.5 flex items-center gap-2">
        <span className="font-bold uppercase tracking-wider text-warning">Beta</span>
        <span className="text-muted-foreground">
          Weather, storm, and property data are estimates from third-party sources. Verify before making business decisions.
        </span>
      </div>
      <header className="sticky top-0 z-30 bg-background/85 backdrop-blur border-b border-border flex items-center gap-3 px-4 md:px-6 h-14">
        <div className="md:hidden flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-gradient-storm flex items-center justify-center">
            <BrandLogo className="w-5 h-5" />
          </div>
          <span className="font-bold">RoofRadar</span>
          <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-storm/15 text-storm border border-storm/30">Beta</span>
        </div>
          <div className="md:hidden ml-auto">
            <Select value={view} onValueChange={(v) => setView(v as View)}>
              <SelectTrigger className="w-40 h-9 bg-white text-foreground border-white"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="dashboard">Home</SelectItem>
                <SelectItem value="storm-ops">Storm Operations</SelectItem>
                <SelectItem value="leads">Leads</SelectItem>
                <SelectItem value="map">Map</SelectItem>
                <SelectItem value="markets">Market Targeting</SelectItem>
                <SelectItem value="campaigns">Campaigns</SelectItem>
                <SelectItem value="auto-campaigns">Auto Storm Campaigns</SelectItem>
                <SelectItem value="playbook">Storm Playbook</SelectItem>
                <SelectItem value="compliance">Compliance</SelectItem>
                <SelectItem value="integrations">Integrations</SelectItem>
                <SelectItem value="billing">Billing & Subscription</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="hidden md:flex relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search addresses, owners, parcels…" className="pl-9 h-9" />
          </div>
          <ActiveMarketChip />
          <div className="flex items-center gap-3 ml-auto md:ml-0">
            <button className="hidden md:inline-flex relative p-2 rounded-md hover:bg-accent">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-warning" />
            </button>
            <UserMenu />
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 max-w-7xl w-full pb-24 md:pb-6">
          {view === "dashboard" && <DashboardView onNavigate={setView} />}
          {view === "storm-ops" && <StormOpsView />}
          {view === "leads" && <LeadsView />}
          {view === "map" && <MapView />}
          {view === "markets" && <MarketTargetingView />}
          {view === "campaigns" && <CampaignsView />}
          {view === "auto-campaigns" && <AutoStormCampaignsView />}
          {view === "playbook" && <StormPlaybookView />}
          {view === "compliance" && <ComplianceView />}
          {view === "integrations" && <IntegrationsView />}
          {view === "billing" && <BillingView />}
          {view === "team" && <TeamView />}
          {view === "admin-users" && <AdminUsersView />}
          {view === "readiness" && <AppReadinessView />}
        </main>
      </div>
      <UpgradeDialog />
      <MobileBottomNav active={view} onNavigate={setView} />
    </div>
  );
};

import { WeatherProvider } from "@/contexts/WeatherContext";
import { DemoModeProvider } from "@/contexts/DemoModeContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const Index = () => (
  <ErrorBoundary label="App">
    <SubscriptionProvider>
      <MarketProvider>
        <WeatherProvider>
          <DemoModeProvider>
            <Shell />
          </DemoModeProvider>
        </WeatherProvider>
      </MarketProvider>
    </SubscriptionProvider>
  </ErrorBoundary>
);

export default Index;
