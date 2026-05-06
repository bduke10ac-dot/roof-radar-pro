import { useRef, useState } from "react";
import { Upload, Trash2, ImageIcon, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBrand } from "@/hooks/useBrand";
import { toast } from "sonner";

export function BrandSettings() {
  const { brand, loading, uploading, uploadLogo, removeLogo, save } = useBrand();
  const fileRef = useRef<HTMLInputElement>(null);
  const [companyName, setCompanyName] = useState(brand.company_name ?? "");
  const [savingName, setSavingName] = useState(false);

  // Sync local input when brand loads
  if (!loading && companyName === "" && brand.company_name) {
    // one-time hydrate
    setCompanyName(brand.company_name);
  }

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

  return (
    <section className="bg-card rounded-xl p-5 shadow-card border border-border/60 space-y-4">
      <header>
        <h2 className="font-semibold flex items-center gap-2"><ImageIcon className="w-4 h-4 text-storm" /> Company branding</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Your logo and company name appear on outgoing emails, SMS landing pages, and shared storm reports.
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
    </section>
  );
}
