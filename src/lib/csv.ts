// Tiny CSV utilities — no external deps.
// Handles quoted fields, embedded commas, escaped quotes ("").

export type CsvRow = Record<string, string>;

export function parseCsv(text: string): { headers: string[]; rows: CsvRow[] } {
  const lines: string[][] = [];
  let cur: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ",") { cur.push(field); field = ""; }
      else if (c === "\n" || c === "\r") {
        if (c === "\r" && text[i + 1] === "\n") i++;
        cur.push(field); field = "";
        if (cur.length > 1 || cur[0] !== "") lines.push(cur);
        cur = [];
      } else field += c;
    }
  }
  if (field.length > 0 || cur.length > 0) { cur.push(field); lines.push(cur); }
  if (lines.length === 0) return { headers: [], rows: [] };
  const headers = lines[0].map(h => h.trim());
  const rows: CsvRow[] = lines.slice(1)
    .filter(l => l.some(v => v.trim() !== ""))
    .map(l => {
      const r: CsvRow = {};
      headers.forEach((h, i) => { r[h] = (l[i] ?? "").trim(); });
      return r;
    });
  return { headers, rows };
}

export function toCsv(rows: Record<string, unknown>[], columns?: string[]): string {
  if (rows.length === 0) return columns?.join(",") ?? "";
  const cols = columns ?? Array.from(new Set(rows.flatMap(r => Object.keys(r))));
  const escape = (v: unknown) => {
    if (v === null || v === undefined) return "";
    const s = String(v);
    if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const head = cols.join(",");
  const body = rows.map(r => cols.map(c => escape(r[c])).join(",")).join("\n");
  return `${head}\n${body}`;
}

export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 0);
}

// --- Validation helpers ---
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[\d\s()+\-.]{7,20}$/;
export const isValidEmail = (s: string) => !!s && EMAIL_RE.test(s.trim());
export const isValidPhone = (s: string) => !!s && PHONE_RE.test(s.trim());
export function normalizePhone(s: string): string {
  const digits = s.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return s.trim();
}
export function normalizeAddress(s: string): string {
  return s.trim().replace(/\s+/g, " ").toLowerCase();
}

// Field auto-mapping
export const TARGET_FIELDS = [
  "ownerName", "propertyAddress", "mailingAddress", "city", "state", "zip",
  "phone", "email", "parcelId", "roofAge", "homeValue", "smsConsent", "emailConsent",
] as const;
export type TargetField = typeof TARGET_FIELDS[number];

const FIELD_HINTS: Record<TargetField, RegExp> = {
  ownerName: /(owner|name|contact)/i,
  propertyAddress: /(property.*addr|address|street|site)/i,
  mailingAddress: /(mail|billing)/i,
  city: /^city$/i,
  state: /^state$/i,
  zip: /(zip|postal)/i,
  phone: /(phone|mobile|cell|tel)/i,
  email: /(email|e-mail)/i,
  parcelId: /(parcel|apn)/i,
  roofAge: /(roof.*age|age)/i,
  homeValue: /(home.*value|value|price)/i,
  smsConsent: /(sms.*consent|text.*consent)/i,
  emailConsent: /(email.*consent)/i,
};

export function autoMapHeaders(headers: string[]): Partial<Record<TargetField, string>> {
  const out: Partial<Record<TargetField, string>> = {};
  for (const tf of TARGET_FIELDS) {
    const found = headers.find(h => FIELD_HINTS[tf].test(h));
    if (found) out[tf] = found;
  }
  return out;
}
