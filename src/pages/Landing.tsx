import { Link, useNavigate } from "react-router-dom";
import { MarketingLayout } from "@/components/MarketingLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CloudLightning, Map, Zap, ShieldCheck, Target, Radar, Rocket } from "lucide-react";
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
  const navigate = useNavigate();
  const useNow = () => {
    localStorage.setItem("rr_guest", "1");
    navigate("/app");
  };
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
          <div className="mt-8 flex flex-col sm:flex-row flex-wrap justify-center gap-3">
            <Button onClick={useNow} size="lg" className="h-12 text-base">
              <Rocket className="w-4 h-4" /> Use it now — no signup
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 text-base"><Link to="/signup">Start 14-day free trial</Link></Button>
            <Button asChild size="lg" variant="ghost" className="h-12 text-base"><Link to="/pricing">See pricing</Link></Button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Try the full app instantly • No credit card required</p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center">
          Everything you need to be ready for the next storm — and be the first to assist after.
        </h2>
        <p className="text-center text-muted-foreground mt-2 max-w-2xl mx-auto">
          Maximize every opportunity. From radar to roof — prepare, track, target, contact, close.
        </p>
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
          <h2 className="text-2xl md:text-3xl font-bold">Be ready before. Be first after.</h2>
          <p className="text-muted-foreground mt-2">Maximize every opportunity — start in seconds, no account needed.</p>
          <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
            <Button onClick={useNow} size="lg" className="h-12 text-base"><Rocket className="w-4 h-4" /> Use it now</Button>
            <Button asChild size="lg" variant="outline" className="h-12 text-base"><Link to="/signup">Create an account</Link></Button>
          </div>
        </Card>
      </section>
    </MarketingLayout>
  );
}
