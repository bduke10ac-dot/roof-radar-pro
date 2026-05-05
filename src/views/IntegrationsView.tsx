import { Plug, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { integrations } from "@/lib/mockData";

const categoryColors: Record<string, string> = {
  Database: "bg-storm/10 text-storm",
  Mapping: "bg-success/15 text-success",
  "Property Data": "bg-accent text-accent-foreground",
  "Storm Data": "bg-warning/15 text-warning",
  Email: "bg-primary/10 text-primary",
  SMS: "bg-warning/15 text-warning",
  CRM: "bg-success/15 text-success",
};

export function IntegrationsView() {
  const grouped = integrations.reduce<Record<string, typeof integrations>>((acc, i) => {
    (acc[i.category] ||= []).push(i);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Integrations</h1>
        <p className="text-sm text-muted-foreground">Connect data sources, messaging, and CRMs.</p>
      </header>

      {Object.entries(grouped).map(([cat, items]) => (
        <section key={cat}>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">{cat}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {items.map(i => (
              <div key={i.name} className="bg-card rounded-xl p-5 shadow-card border border-border/60 flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${categoryColors[cat] || "bg-muted"}`}>
                    <Plug className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground inline-flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Available
                  </span>
                </div>
                <div className="font-semibold">{i.name}</div>
                <div className="text-xs text-muted-foreground mt-1 mb-4 flex-1">{i.desc}</div>
                <Button variant="outline" size="sm" className="w-full">Connect</Button>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
