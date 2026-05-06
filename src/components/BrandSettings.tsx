import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { Upload, Trash2, ImageIcon, Loader2, Check, Globe, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBrand } from "@/hooks/useBrand";
import { toast } from "sonner";

const urlSchema = z.string().trim().max(500).url({ message: "Enter a valid URL (https://…)" });
const optionalUrl = z.union([z.literal(""), urlSchema]);

export function BrandSettings() {
  const { brand, loading, uploading, uploadLogo, removeLogo, save } = useBrand();
  const fileRef = useRef<HTMLInputElement>(null);
  const [companyName, setCompanyName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [googleUrl, setGoogleUrl] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [savingLinks, setSavingLinks] = useState(false);

  useEffect(() => {
    if (loading) return;
    setCompanyName(brand.company_name ?? "");
    setWebsiteUrl(brand.website_url ?? "");
    setGoogleUrl(brand.google_review_url ?? "");
  }, [loading, brand.company_name, brand.website_url, brand.google_review_url]);

  const handleFile = async (f: File | null) => {
    if (!f) return;
    try { await uploadLogo(f); toast.success("Logo updated"); }
    catch (e: any) { toast.error(e?.message ?? "Upload failed"); }
  };

  const handleSaveName = async () => {
    setSavingName(true);
    try { await save({ company_name: companyName.trim() || null }); toast.success("Company name saved"); }
    catch (e: any) { toast.error(e?.message ?? "Save failed"); }
    finally { setSavingName(false); }
  };

  const handleSaveLinks = async () => {
    const w = websiteUrl.trim();
    const g = googleUrl.trim();
    const wp = optionalUrl.safeParse(w);
    const gp = optionalUrl.safeParse(g);
    if (!wp.success) { toast.error(`Website: ${wp.error.issues[0].message}`); return; }
    if (!gp.success) { toast.error(`Google review link: ${gp.error.issues[0].message}`); return; }
    setSavingLinks(true);
    try {
      await save({ website_url: w || null, google_review_url: g || null });
      toast.success("Marketing links saved");
    } catch (e: any) { toast.error(e?.message ?? "Save failed"); }
    finally { setSavingLinks(false); }
  };

  return (
    <section className="bg-card rounded-xl p-5 shadow-card border border-border/60 space-y-4">
      <header>
        <h2 className="font-semibold flex items-center gap-2"><ImageIcon className="w-4 h-4 text-storm" /> Company branding</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Your logo, name, and links appear on outgoing emails, SMS, and shared storm reports.
        </p>
      </header>

      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-lg bg-background border border-border/60 flex items-center justify-center overflow-hidden shrink-0">
          {brand.company_logo_url ? (
            <img src={brand.company_logo_url} alt="Company logo" className="w-full h-full object-contain" />
          ) : (
            <ImageIcon className="w-7 h-7 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1 min-w-0 space-y-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          />
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
              {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
              {brand.company_logo_url ? "Replace logo" : "Upload logo"}
            </Button>
            {brand.company_logo_url && (
              <Button size="sm" variant="outline" onClick={async () => { await removeLogo(); toast.success("Logo removed"); }}>
                <Trash2 className="w-3.5 h-3.5" /> Remove
              </Button>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground">PNG, JPG, WEBP or SVG · transparent background recommended · up to 4 MB</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-[1fr_auto] gap-2 items-end">
        <div>
          <Label htmlFor="company-name" className="text-xs text-muted-foreground">Company name</Label>
          <Input
            id="company-name"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Acme Roofing"
            maxLength={80}
            className="mt-1.5"
          />
        </div>
        <Button size="sm" variant="outline" onClick={handleSaveName} disabled={savingName}>
          {savingName ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
          Save
        </Button>
      </div>

      <div className="space-y-3 pt-3 border-t border-border/60">
        <div>
          <h3 className="text-sm font-semibold flex items-center gap-2"><Globe className="w-4 h-4 text-storm" /> Marketing links</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Included automatically in outgoing emails, SMS alerts, and storm reports.
          </p>
        </div>

        <div>
          <Label htmlFor="website-url" className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Globe className="w-3 h-3" /> Company website
          </Label>
          <Input
            id="website-url"
            type="url"
            inputMode="url"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            placeholder="https://acmeroofing.com"
            maxLength={500}
            className="mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor="google-url" className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Star className="w-3 h-3 text-warning" /> Google reviews link
          </Label>
          <Input
            id="google-url"
            type="url"
            inputMode="url"
            value={googleUrl}
            onChange={(e) => setGoogleUrl(e.target.value)}
            placeholder="https://g.page/r/…/review"
            maxLength={500}
            className="mt-1.5"
          />
          <p className="text-[11px] text-muted-foreground mt-1">
            Tip: in Google Business Profile, copy your "Ask for reviews" short link.
          </p>
        </div>

        <Button size="sm" variant="outline" onClick={handleSaveLinks} disabled={savingLinks}>
          {savingLinks ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
          Save links
        </Button>
      </div>
    </section>
  );
}
