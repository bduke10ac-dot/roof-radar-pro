import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  type CsvRow, type TargetField, isValidEmail, isValidPhone,
  normalizePhone, normalizeAddress,
} from "@/lib/csv";

export type LeadImport = {
  id: string;
  fileName: string;
  sourceTag: string | null;
  totalRows: number;
  importedCount: number;
  duplicateCount: number;
  invalidCount: number;
  status: string;
  notes: string | null;
  createdAt: string;
};

export type ImportPreview = {
  valid: number;
  duplicates: number;
  invalid: number;
  invalidExamples: { row: number; reasons: string[] }[];
};

export function useLeadImports() {
  const { user } = useAuth();
  const [history, setHistory] = useState<LeadImport[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) { setHistory([]); return; }
    setLoading(true);
    const { data } = await supabase
      .from("lead_imports")
      .select("*")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);
    setHistory((data ?? []).map(r => ({
      id: r.id, fileName: r.file_name, sourceTag: r.source_tag,
      totalRows: r.total_rows, importedCount: r.imported_count,
      duplicateCount: r.duplicate_count, invalidCount: r.invalid_count,
      status: r.status, notes: r.notes, createdAt: r.created_at,
    })));
    setLoading(false);
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  // Validate + dedupe (within file). Duplicate detection against existing leads
  // happens row-by-row at insert time using property_address.
  const previewImport = useCallback((rows: CsvRow[], mapping: Partial<Record<TargetField, string>>): ImportPreview => {
    const seenAddresses = new Set<string>();
    let valid = 0, duplicates = 0, invalid = 0;
    const invalidExamples: ImportPreview["invalidExamples"] = [];
    rows.forEach((row, idx) => {
      const reasons: string[] = [];
      const address = mapping.propertyAddress ? row[mapping.propertyAddress]?.trim() : "";
      const owner = mapping.ownerName ? row[mapping.ownerName]?.trim() : "";
      const email = mapping.email ? row[mapping.email]?.trim() : "";
      const phone = mapping.phone ? row[mapping.phone]?.trim() : "";
      if (!address) reasons.push("missing address");
      if (!owner) reasons.push("missing owner name");
      if (email && !isValidEmail(email)) reasons.push("invalid email");
      if (phone && !isValidPhone(phone)) reasons.push("invalid phone");
      if (reasons.length > 0) {
        invalid++;
        if (invalidExamples.length < 5) invalidExamples.push({ row: idx + 2, reasons });
        return;
      }
      const key = normalizeAddress(address);
      if (seenAddresses.has(key)) { duplicates++; return; }
      seenAddresses.add(key);
      valid++;
    });
    return { valid, duplicates, invalid, invalidExamples };
  }, []);

  const runImport = useCallback(async (params: {
    rows: CsvRow[];
    mapping: Partial<Record<TargetField, string>>;
    fileName: string;
    sourceTag: string;
    maxRows?: number; // plan limit
  }): Promise<{ ok: boolean; importId?: string; imported: number; duplicates: number; invalid: number; truncated: boolean }> => {
    const { rows, mapping, fileName, sourceTag } = params;
    if (!user) return { ok: false, imported: 0, duplicates: 0, invalid: 0, truncated: false };
    const truncated = !!(params.maxRows && rows.length > params.maxRows);
    const workingRows = truncated ? rows.slice(0, params.maxRows) : rows;

    // Pre-fetch existing addresses for cross-file dedup
    const { data: existingProps } = await supabase
      .from("properties").select("property_address").eq("owner_id", user.id).limit(5000);
    const existing = new Set((existingProps ?? []).map(p => normalizeAddress(p.property_address ?? "")));

    // Insert import row first to get an ID
    const { data: importRow, error: importErr } = await supabase
      .from("lead_imports")
      .insert({
        owner_id: user.id,
        file_name: fileName,
        source_tag: sourceTag || null,
        total_rows: rows.length,
        imported_count: 0,
        duplicate_count: 0,
        invalid_count: 0,
        status: "running",
        field_mapping: mapping as any,
        notes: truncated ? `Truncated to first ${params.maxRows} rows due to plan limit.` : null,
      })
      .select("id").single();
    if (importErr || !importRow) return { ok: false, imported: 0, duplicates: 0, invalid: 0, truncated };
    const importId = importRow.id;

    let imported = 0, duplicates = 0, invalid = 0;
    const seen = new Set<string>();

    for (const row of workingRows) {
      const address = mapping.propertyAddress ? row[mapping.propertyAddress]?.trim() : "";
      const owner = mapping.ownerName ? row[mapping.ownerName]?.trim() : "";
      const email = mapping.email ? row[mapping.email]?.trim() : "";
      const phone = mapping.phone ? row[mapping.phone]?.trim() : "";
      if (!address || !owner) { invalid++; continue; }
      if (email && !isValidEmail(email)) { invalid++; continue; }
      if (phone && !isValidPhone(phone)) { invalid++; continue; }
      const key = normalizeAddress(address);
      if (seen.has(key) || existing.has(key)) { duplicates++; continue; }
      seen.add(key);

      const mailing = mapping.mailingAddress ? row[mapping.mailingAddress]?.trim() : "";
      const parcel = mapping.parcelId ? row[mapping.parcelId]?.trim() : "";
      const roofAge = mapping.roofAge ? Number(row[mapping.roofAge]) || null : null;
      const homeValue = mapping.homeValue ? Number(String(row[mapping.homeValue]).replace(/[^\d.]/g, "")) || null : null;
      const smsConsent = mapping.smsConsent
        ? /^(true|yes|1|y)$/i.test(row[mapping.smsConsent] ?? "") : false;
      const emailConsent = mapping.emailConsent
        ? /^(true|yes|1|y)$/i.test(row[mapping.emailConsent] ?? "") : false;

      const { data: prop, error: pErr } = await supabase.from("properties")
        .insert({
          owner_id: user.id,
          owner_name: owner,
          property_address: address,
          mailing_address: mailing || null,
          parcel_id: parcel || null,
          estimated_roof_age: roofAge,
          home_value: homeValue,
          data_source: sourceTag || "csv-import",
        }).select("id").single();
      if (pErr || !prop) { invalid++; continue; }

      const { data: lead, error: lErr } = await supabase.from("leads")
        .insert({
          owner_id: user.id,
          property_id: prop.id,
          lead_status: "New",
          source: sourceTag || "csv-import",
          import_id: importId,
        }).select("id").single();
      if (lErr || !lead) { invalid++; continue; }

      if (email || phone) {
        await supabase.from("contact_methods").insert({
          lead_id: lead.id,
          email: email || null,
          phone: phone ? normalizePhone(phone) : null,
          sms_consent: smsConsent,
          email_consent: emailConsent,
          dnc_status: false,
        });
      }
      imported++;
    }

    await supabase.from("lead_imports").update({
      imported_count: imported,
      duplicate_count: duplicates,
      invalid_count: invalid,
      status: "completed",
    }).eq("id", importId);

    await refresh();
    return { ok: true, importId, imported, duplicates, invalid, truncated };
  }, [user, refresh]);

  return { history, loading, refresh, previewImport, runImport };
}
