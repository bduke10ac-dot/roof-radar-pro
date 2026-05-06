import { Link } from "react-router-dom";
import { CloudLightning } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";

export function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border sticky top-0 z-40 bg-background/85 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold">
            <div className="w-7 h-7 rounded-md bg-gradient-storm flex items-center justify-center">
              <CloudLightning className="w-4 h-4 text-[hsl(60_100%_60%)] drop-shadow-[0_0_5px_hsl(60_100%_60%/0.8)]" />
            </div>
            RoofRadar
          </Link>
          <nav className="flex items-center gap-1 text-sm">
            <Link to="/pricing" className="px-3 py-1.5 rounded-md hover:bg-accent">Pricing</Link>
            <Link to="/support" className="hidden sm:block px-3 py-1.5 rounded-md hover:bg-accent">Support</Link>
            <Link to="/login" className="px-3 py-1.5 rounded-md hover:bg-accent">Log in</Link>
            <Link to="/app" onClick={() => localStorage.setItem("rr_guest", "1")} className="ml-1 px-3 py-1.5 rounded-md bg-storm text-white text-sm font-medium hover:opacity-90">Use now</Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border py-8 text-sm text-muted-foreground">
        <div className="max-w-6xl mx-auto px-4 flex flex-wrap items-center justify-between gap-3">
          <div>© {new Date().getFullYear()} RoofRadar. All rights reserved.</div>
          <nav className="flex gap-4">
            <Link to="/pricing" className="hover:text-foreground">Pricing</Link>
            <Link to="/support" className="hover:text-foreground">Support</Link>
            <Link to="/privacy" className="hover:text-foreground">Privacy</Link>
            <Link to="/terms" className="hover:text-foreground">Terms</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
