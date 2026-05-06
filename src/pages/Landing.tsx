import { Link } from "react-router-dom";
import { MarketingLayout } from "@/components/MarketingLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CloudLightning, Map, Zap, ShieldCheck, Target, Radar } from "lucide-react";
import { useEffect } from "react";

const features = [
  { icon: Radar, title: "Real-time storm tracking", desc: "Hail, wind and tornado overlays the moment NOAA posts them." },
  { icon: Target, title: "Market targeting", desc: "Save markets by ZIP, county or polygon and prioritize by opportunity score." },
  { icon: Zap, title: "Auto storm campaigns", desc: "Trigger compliant SMS, email and direct-mail outreach when thresholds hit." },
  { icon: Map, title: "Door-knock routes", desc: "Optimized routes for storm-affected neighborhoods, exportable to your CRM." },
  { icon: ShieldCheck, title: "Built-in compliance", desc: "TCPA & DNC checks, opt-in tracking, audit logs on every send." },
  { icon: CloudLightning, title: "AI lead scoring", desc: "Rank properties by claim likelihood, roof age and storm intensity." },
];

export default function Landing() {
  useEffect(() => {
    document.title = "RoofRadar — Storm-driven lead generation for roofers";
    const meta = document.querySelector('meta[name="description"]') ?? Object.assign(document.createElement("meta"), { name: "description" });
    meta.setAttribute("content", "RoofRadar tracks storms in real time and turns affected neighborhoods into qualified roofing leads with automated, compliant outreach.");
    if (!meta.parentElement) document.head.appendChild(meta);
  }, []);

  return (
    <MarketingLayout>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-storm/10 via-background to-background pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-4 py-16 md:py-24 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-storm/15 text-storm text-xs font-semibold mb-6">
            <CloudLightning className="w-3.5 h-3.5" /> Storms move fast. So should you.
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight max-w-3xl mx-auto">
            Turn every storm into a pipeline of qualified roofing leads.
          </h1>
          <p className="mt-5 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            RoofRadar combines real-time weather data, property records and automated outreach so your crew is on the right doors first.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg"><Link to="/signup">Start 14-day free trial</Link></Button>
            <Button asChild size="lg" variant="outline"><Link to="/pricing">See pricing</Link></Button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">No credit card required • Cancel anytime</p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center">Everything you need after the storm</h2>
        <p className="text-center text-muted-foreground mt-2 max-w-2xl mx-auto">From radar to roof — track, target, contact, close.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
          {features.map((f) => (
            <Card key={f.title} className="p-5">
              <f.icon className="w-6 h-6 text-storm" />
              <h3 className="font-semibold mt-3">{f.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{f.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-12 md:py-20 text-center">
        <Card className="p-8 md:p-12 bg-gradient-to-br from-storm/15 to-background border-storm/30">
          <h2 className="text-2xl md:text-3xl font-bold">Ready to chase the next storm?</h2>
          <p className="text-muted-foreground mt-2">Join contractors closing more deals with less guesswork.</p>
          <Button asChild size="lg" className="mt-6"><Link to="/signup">Create your account</Link></Button>
        </Card>
      </section>
    </MarketingLayout>
  );
}
