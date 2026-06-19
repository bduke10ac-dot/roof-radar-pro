import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { mockLeads, type Lead } from "@/lib/mockData";
import { toast } from "sonner";
import { trackSync } from "@/lib/syncStatus";

interface Row {
  id: string;
  storm_score: number | null;
  lead_status: string;
  notes: string | null;
  property_id: string | null;
  storm_event_id: string | null;
  properties: {
    owner_name: string | null;
    property_address: string | null;
    mailing_address: string | null;
    parcel_id: string | null;
    latitude: number | null;
    longitude: number | null;
    estimated_roof_age: number | null;
    home_value: number | null;
  } | null;
  storm_events: {
    event_date: string | null;
    hail_size: number | null;
    wind_speed: number | null;
  } | null;
  contact_methods: Array<{
    id: string;
    phone: string | null;
    email: string | null;
    sms_consent: boolean;
    email_consent: boolean;
    dnc_status: boolean;
    opt_out_date: string | null;
  }>;
}

function rowToLead(r: Row): Lead {
  const cm = r.contact_methods?.[0];
  const consent: Lead["consent"] =
    cm?.dnc_status || cm?.opt_out_date ? "opted_out"
    : cm?.sms_consent || cm?.email_consent ? "opted_in"
    : "no_consent";
  const addr = r.properties?.property_address ?? "";
  const zipMatch = addr.match(/\b(\d{5})\b/);
  return {
    id: r.id,
    ownerName: r.properties?.owner_name ?? "—",
    propertyAddress: addr,
    mailingAddress: r.properties?.mailing_address ?? "",
    parcelId: r.properties?.parcel_id ?? "",
    roofAge: r.properties?.estimated_roof_age ?? 0,
    homeValue: Number(r.properties?.home_value ?? 0),
    stormScore: r.storm_score ?? 0,
    hailSize: Number(r.storm_events?.hail_size ?? 0),
    windSpeed: Number(r.storm_events?.wind_speed ?? 0),
    lastStormDate: r.storm_events?.event_date ?? "",
    status: (r.lead_status?.toLowerCase() as Lead["status"]) ?? "new",
    consent,
    phone: cm?.phone ?? "",
    email: cm?.email ?? "",
    notes: r.notes ?? "",
    lat: Number(r.properties?.latitude ?? 0),
    lng: Number(r.properties?.longitude ?? 0),
    zip: zipMatch?.[1] ?? "",
    smsConsent: !!cm?.sms_consent,
    dncStatus: !!cm?.dnc_status,
  };
}

export interface NewLeadInput {
  ownerName: string;
  propertyAddress: string;
  mailingAddress?: string;
  parcelId?: string;
  roofAge?: number;
  homeValue?: number;
  stormScore?: number;
  status?: Lead["status"];
  notes?: string;
  phone?: string;
  email?: string;
  smsConsent?: boolean;
  emailConsent?: boolean;
  zip?: string;
}

export function useLeads() {
  const { user, loading: authLoading } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingMock, setUsingMock] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setLeads(mockLeads);
      setUsingMock(true);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("leads")
      .select(`
        id, storm_score, lead_status, notes, property_id, storm_event_id,
        properties:property_id ( owner_name, property_address, mailing_address, parcel_id, latitude, longitude, estimated_roof_age, home_value ),
        storm_events:storm_event_id ( event_date, hail_size, wind_speed ),
        contact_methods ( id, phone, email, sms_consent, email_consent, dnc_status, opt_out_date )
      `)
      .order("storm_score", { ascending: false });

    if (error) {
      setError(error.message);
      setLeads([]);
      setUsingMock(false);
    } else {
      setLeads((data as unknown as Row[]).map(rowToLead));
      setUsingMock(false);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    refresh();
  }, [authLoading, refresh]);

  const createLead = async (input: NewLeadInput): Promise<Lead | null> => {
    if (!user) { toast.error("Log in to add leads"); return null; }
    const { data: prop, error: pErr } = await trackSync(supabase
      .from("properties")
      .insert({
        owner_id: user.id,
        owner_name: input.ownerName,
        property_address: input.propertyAddress,
        mailing_address: input.mailingAddress ?? null,
        parcel_id: input.parcelId ?? null,
        estimated_roof_age: input.roofAge ?? null,
        home_value: input.homeValue ?? null,
      })
      .select("id")
      .single());
    if (pErr || !prop) { toast.error(pErr?.message ?? "Failed to create property"); return null; }

    const { data: lead, error: lErr } = await trackSync(supabase
      .from("leads")
      .insert({
        owner_id: user.id,
        property_id: prop.id,
        lead_status: (input.status ?? "new"),
        storm_score: input.stormScore ?? null,
        notes: input.notes ?? null,
      })
      .select("id")
      .single());
    if (lErr || !lead) { toast.error(lErr?.message ?? "Failed to create lead"); return null; }

    if (input.phone || input.email) {
      await supabase.from("contact_methods").insert({
        lead_id: lead.id,
        phone: input.phone ?? null,
        email: input.email ?? null,
        sms_consent: !!input.smsConsent,
        email_consent: !!input.emailConsent,
        dnc_status: false,
      });
    }
    await refresh();
    return leads.find(l => l.id === lead.id) ?? null;
  };

  const updateLead = async (id: string, patch: Partial<NewLeadInput> & { status?: Lead["status"] }): Promise<boolean> => {
    if (!user) { toast.error("Log in to edit leads"); return false; }
    const lead = leads.find(l => l.id === id);
    if (!lead) return false;

    const leadPatch: Record<string, unknown> = {};
    if (patch.status !== undefined) leadPatch.lead_status = patch.status;
    if (patch.stormScore !== undefined) leadPatch.storm_score = patch.stormScore;
    if (patch.notes !== undefined) leadPatch.notes = patch.notes;
    if (Object.keys(leadPatch).length > 0) {
      const { error } = await supabase.from("leads").update(leadPatch as any).eq("id", id);
      if (error) { toast.error(error.message); return false; }
    }

    const propPatch: Record<string, unknown> = {};
    if (patch.ownerName !== undefined) propPatch.owner_name = patch.ownerName;
    if (patch.propertyAddress !== undefined) propPatch.property_address = patch.propertyAddress;
    if (patch.mailingAddress !== undefined) propPatch.mailing_address = patch.mailingAddress;
    if (patch.parcelId !== undefined) propPatch.parcel_id = patch.parcelId;
    if (patch.roofAge !== undefined) propPatch.estimated_roof_age = patch.roofAge;
    if (patch.homeValue !== undefined) propPatch.home_value = patch.homeValue;
    if (Object.keys(propPatch).length > 0) {
      // Need property_id; fetch from joined data
      const { data: leadRow } = await supabase.from("leads").select("property_id").eq("id", id).maybeSingle();
      if (leadRow?.property_id) {
        const { error } = await supabase.from("properties").update(propPatch as any).eq("id", leadRow.property_id);
        if (error) { toast.error(error.message); return false; }
      }
    }

    if (patch.phone !== undefined || patch.email !== undefined || patch.smsConsent !== undefined) {
      const { data: existing } = await supabase.from("contact_methods").select("id").eq("lead_id", id).limit(1);
      const cmPatch: Record<string, unknown> = {};
      if (patch.phone !== undefined) cmPatch.phone = patch.phone;
      if (patch.email !== undefined) cmPatch.email = patch.email;
      if (patch.smsConsent !== undefined) cmPatch.sms_consent = patch.smsConsent;
      if (patch.emailConsent !== undefined) cmPatch.email_consent = patch.emailConsent;
      if (existing && existing.length > 0) {
        await supabase.from("contact_methods").update(cmPatch as any).eq("id", existing[0].id);
      } else {
        await supabase.from("contact_methods").insert({ lead_id: id, dnc_status: false, ...cmPatch } as any);
      }
    }

    await refresh();
    return true;
  };

  const updateLeadStatus = (id: string, status: Lead["status"]) => updateLead(id, { status });
  const updateLeadNotes = (id: string, notes: string) => updateLead(id, { notes });

  const deleteLead = async (id: string): Promise<boolean> => {
    if (!user) return false;
    const prev = leads;
    setLeads(prev.filter(l => l.id !== id));
    const { error } = await supabase.from("leads").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      setLeads(prev);
      return false;
    }
    return true;
  };

  return { leads, loading, error, usingMock, refresh, createLead, updateLead, updateLeadStatus, updateLeadNotes, deleteLead };
}

export function useStormEvents() {
  const [events, setEvents] = useState<Array<{ id: string; date: string; location: string; hailSize: number; windSpeed: number; affected: number }>>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("storm_events")
        .select("id, event_date, area_name, hail_size, wind_speed")
        .order("event_date", { ascending: false })
        .limit(8);
      if (data && data.length > 0) {
        setEvents(data.map(s => ({
          id: s.id,
          date: s.event_date ?? "",
          location: s.area_name ?? "",
          hailSize: Number(s.hail_size ?? 0),
          windSpeed: Number(s.wind_speed ?? 0),
          affected: Math.round(Number(s.hail_size ?? 0) * 800 + Number(s.wind_speed ?? 0) * 12),
        })));
      } else {
        const { stormEvents } = await import("@/lib/mockData");
        setEvents(stormEvents);
      }
    })();
  }, []);

  return events;
}
