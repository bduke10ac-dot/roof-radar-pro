import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { mockLeads, type Lead } from "@/lib/mockData";

interface Row {
  id: string;
  storm_score: number | null;
  lead_status: string;
  notes: string | null;
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

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data, error } = await supabase
        .from("leads")
        .select(`
          id, storm_score, lead_status, notes,
          properties:property_id ( owner_name, property_address, mailing_address, parcel_id, latitude, longitude, estimated_roof_age, home_value ),
          storm_events:storm_event_id ( event_date, hail_size, wind_speed ),
          contact_methods ( phone, email, sms_consent, email_consent, dnc_status, opt_out_date )
        `)
        .order("storm_score", { ascending: false });

      if (!active) return;
      if (error || !data || data.length === 0) {
        setLeads(mockLeads);
      } else {
        setLeads((data as unknown as Row[]).map(rowToLead));
      }
      setLoading(false);
    })();
    return () => { active = false; };
  }, []);

  return { leads, loading };
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
