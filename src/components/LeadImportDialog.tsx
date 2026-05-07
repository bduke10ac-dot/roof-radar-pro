import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UploadCloud, FileSpreadsheet, AlertTriangle, CheckCircle2, Lock } from "lucide-react";
import { parseCsv, autoMapHeaders, TARGET_FIELDS, type CsvRow, type TargetField } from "@/lib/csv";
import { useLeadImports } from "@/hooks/useLeadImports";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { toast } from "sonner";

type Step = "pick" | "map" | "preview" | "result";

export function LeadImportDialog({ trigger }: { trigger?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("pick");
  const [fileName, setFileName] = useState("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<CsvRow[]>([]);
  const [mapping, setMapping] = useState<Partial<Record<TargetField, string>>>({});
  const [sourceTag, setSourceTag] = useState("csv-import");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ imported: number; duplicates: number; invalid: number; truncated: boolean } | null>(null);

  const { user } = useAuth();
  const { plan } = useSubscription();
  const { previewImport, runImport } = useLeadImports();

  // Plan-based row cap (hard limit per import)
  const maxRows = plan.id === "free" ? 50
    : plan.id === "starter" ? 1000
    : plan.id === "pro" ? 10000
    : 100000;

  const reset = () => {
    setStep("pick"); setFileName(""); setHeaders([]); setRows([]); setMapping({});
    setSourceTag("csv-import"); setResult(null);
  };

  const onFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".csv")) { toast.error("Please upload a .csv file"); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error("File too large (max 10MB)"); return; }
    const text = await file.text();
    const { headers: h, rows: r } = parseCsv(text);
    if (h.length === 0 || r.length === 0) { toast.error("No data found in CSV"); return; }
    setFileName(file.name);
    setHeaders(h);
    setRows(r);
    setMapping(autoMapHeaders(h));
    setStep("map");
  };

  const preview = useMemo(() => previewImport(rows, mapping), [rows, mapping, previewImport]);

  const canRun = !!mapping.ownerName && !!mapping.propertyAddress;

  const startImport = async () => {
    if (!user) { toast.error("Log in to import leads"); return; }
    if (!canRun) { toast.error("Map Owner name and Property address first"); return; }
    setBusy(true);
    const r = await runImport({
      rows, mapping, fileName,
      sourceTag: sourceTag.trim() || "csv-import",
      maxRows,
    });
    setBusy(false);
    if (!r.ok) { toast.error("Import failed"); return; }
    setResult({ imported: r.imported, duplicates: r.duplicates, invalid: r.invalid, truncated: r.truncated });
    setStep("result");
    toast.success(`Imported ${r.imported} leads · ${r.duplicates} dupes · ${r.invalid} invalid`);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      <DialogTrigger asChild>
        {trigger ?? <Button variant="outline" size="sm"><UploadCloud className="w-4 h-4 mr-2" />Import CSV</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-storm" /> Import leads from CSV
          </DialogTitle>
        </DialogHeader>

        {step === "pick" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Upload a CSV with at minimum an owner name and property address. We'll auto-map columns, validate phone & email, dedupe by address, and tag every imported lead with a source.
            </p>
            <label className="block border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-storm/40 transition-colors">
              <UploadCloud className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <div className="font-medium text-sm">Click to choose CSV</div>
              <div className="text-xs text-muted-foreground mt-1">Up to 10MB · {maxRows.toLocaleString()} rows max on {plan.name} plan</div>
              <input type="file" accept=".csv,text/csv" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
            </label>
            {!user && (
              <div className="text-xs text-warning flex items-center gap-1">
                <Lock className="w-3 h-3" /> Log in to actually save imported leads.
              </div>
            )}
          </div>
        )}

        {step === "map" && (
          <div className="space-y-3">
            <div className="text-xs text-muted-foreground">
              {fileName} · {rows.length.toLocaleString()} rows · {headers.length} columns
              {rows.length > maxRows && <span className="text-warning"> · only first {maxRows.toLocaleString()} will import on {plan.name} plan</span>}
            </div>
            <div className="grid sm:grid-cols-2 gap-2">
              {TARGET_FIELDS.map(tf => (
                <div key={tf}>
                  <Label className="text-xs capitalize">{tf.replace(/([A-Z])/g, " $1").trim()}</Label>
                  <Select value={mapping[tf] ?? "__none__"}
                    onValueChange={v => setMapping(m => ({ ...m, [tf]: v === "__none__" ? undefined : v }))}>
                    <SelectTrigger className="h-9"><SelectValue placeholder="—" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">— Skip —</SelectItem>
                      {headers.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
            <div>
              <Label className="text-xs">Source tag (saved on each lead)</Label>
              <Input value={sourceTag} onChange={e => setSourceTag(e.target.value)} placeholder="e.g. propstream-2026-04" />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setStep("pick")}>Back</Button>
              <Button onClick={() => setStep("preview")} disabled={!canRun}>Preview</Button>
            </DialogFooter>
          </div>
        )}

        {step === "preview" && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2 text-center">
              <Stat label="Will import" value={preview.valid} tone="success" />
              <Stat label="Duplicates skipped" value={preview.duplicates} tone="muted" />
              <Stat label="Invalid skipped" value={preview.invalid} tone="warn" />
            </div>
            {preview.invalidExamples.length > 0 && (
              <div className="rounded border border-warning/40 bg-warning/5 p-3 text-xs">
                <div className="font-semibold flex items-center gap-1 mb-1"><AlertTriangle className="w-3 h-3" /> First invalid rows</div>
                <ul className="space-y-0.5 text-muted-foreground">
                  {preview.invalidExamples.map(e => (
                    <li key={e.row}>Row {e.row}: {e.reasons.join(", ")}</li>
                  ))}
                </ul>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setStep("map")}>Back</Button>
              <Button onClick={startImport} disabled={busy || !user}>
                {busy ? "Importing…" : `Import ${Math.min(preview.valid, maxRows)} leads`}
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === "result" && result && (
          <div className="space-y-3">
            <div className="rounded border border-success/40 bg-success/5 p-4 flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-success mt-0.5" />
              <div className="text-sm">
                <div className="font-semibold">Import complete</div>
                <div className="text-muted-foreground">
                  {result.imported} added · {result.duplicates} duplicates skipped · {result.invalid} invalid skipped
                  {result.truncated && <> · truncated to plan limit ({maxRows.toLocaleString()})</>}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setOpen(false)}>Done</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: "success" | "muted" | "warn" }) {
  const cls = tone === "success" ? "text-success bg-success/10 border-success/30"
    : tone === "warn" ? "text-warning bg-warning/10 border-warning/30"
    : "text-muted-foreground bg-muted border-border";
  return (
    <div className={`p-3 rounded border ${cls}`}>
      <div className="text-2xl font-bold">{value.toLocaleString()}</div>
      <div className="text-[11px] uppercase tracking-wider opacity-80">{label}</div>
    </div>
  );
}
