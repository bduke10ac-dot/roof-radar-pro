export type LeadStatus = "new" | "contacted" | "inspection" | "quoted" | "won" | "lost";
export type ConsentStatus = "opted_in" | "no_consent" | "opted_out";

export interface Lead {
  id: string;
  ownerName: string;
  propertyAddress: string;
  mailingAddress: string;
  parcelId: string;
  roofAge: number;
  homeValue: number;
  stormScore: number;
  hailSize: number;
  windSpeed: number;
  lastStormDate: string;
  status: LeadStatus;
  consent: ConsentStatus;
  phone: string;
  email: string;
  notes: string;
  lat: number;
  lng: number;
  zip: string;
}

export const mockLeads: Lead[] = [
  { id: "L-1001", ownerName: "Sarah Mitchell", propertyAddress: "412 Oak Ridge Dr, Plano, TX", mailingAddress: "412 Oak Ridge Dr, Plano, TX 75023", parcelId: "PRC-447821", roofAge: 17, homeValue: 485000, stormScore: 94, hailSize: 1.75, windSpeed: 72, lastStormDate: "2026-04-22", status: "new", consent: "opted_in", phone: "(972) 555-0118", email: "smitchell@example.com", notes: "Visible hail damage on south facing slope.", lat: 33.04, lng: -96.71, zip: "75023" },
  { id: "L-1002", ownerName: "James Carter", propertyAddress: "88 Stonebrook Ln, Plano, TX", mailingAddress: "88 Stonebrook Ln, Plano, TX 75023", parcelId: "PRC-447822", roofAge: 22, homeValue: 612000, stormScore: 89, hailSize: 2.0, windSpeed: 80, lastStormDate: "2026-04-22", status: "contacted", consent: "no_consent", phone: "(972) 555-0142", email: "jcarter@example.com", notes: "Left door hanger 4/24.", lat: 33.045, lng: -96.715, zip: "75023" },
  { id: "L-1003", ownerName: "Maria Gonzalez", propertyAddress: "1207 Willow Bend, Frisco, TX", mailingAddress: "1207 Willow Bend, Frisco, TX 75035", parcelId: "PRC-558901", roofAge: 12, homeValue: 540000, stormScore: 76, hailSize: 1.25, windSpeed: 65, lastStormDate: "2026-04-18", status: "inspection", consent: "opted_in", phone: "(469) 555-0211", email: "mgonzalez@example.com", notes: "Inspection scheduled 5/8.", lat: 33.13, lng: -96.81, zip: "75035" },
  { id: "L-1004", ownerName: "David Kim", propertyAddress: "9 Cedar Hollow Ct, Allen, TX", mailingAddress: "9 Cedar Hollow Ct, Allen, TX 75013", parcelId: "PRC-661224", roofAge: 19, homeValue: 720000, stormScore: 91, hailSize: 1.85, windSpeed: 78, lastStormDate: "2026-04-22", status: "quoted", consent: "opted_in", phone: "(214) 555-0388", email: "dkim@example.com", notes: "Quote sent $24,500.", lat: 33.10, lng: -96.67, zip: "75013" },
  { id: "L-1005", ownerName: "Emily Rodriguez", propertyAddress: "55 Highland Park Way, McKinney, TX", mailingAddress: "55 Highland Park Way, McKinney, TX 75070", parcelId: "PRC-770332", roofAge: 9, homeValue: 395000, stormScore: 62, hailSize: 0.75, windSpeed: 55, lastStormDate: "2026-03-30", status: "new", consent: "no_consent", phone: "(972) 555-0455", email: "erodriguez@example.com", notes: "", lat: 33.20, lng: -96.64, zip: "75070" },
  { id: "L-1006", ownerName: "Robert Chen", propertyAddress: "318 Maple Grove, Plano, TX", mailingAddress: "318 Maple Grove, Plano, TX 75024", parcelId: "PRC-447823", roofAge: 25, homeValue: 825000, stormScore: 97, hailSize: 2.25, windSpeed: 85, lastStormDate: "2026-04-22", status: "won", consent: "opted_in", phone: "(972) 555-0566", email: "rchen@example.com", notes: "Job booked 5/15.", lat: 33.05, lng: -96.72, zip: "75024" },
  { id: "L-1007", ownerName: "Linda Patel", propertyAddress: "742 Elm Crossing, Frisco, TX", mailingAddress: "PO Box 1142, Frisco, TX 75034", parcelId: "PRC-558902", roofAge: 14, homeValue: 510000, stormScore: 71, hailSize: 1.0, windSpeed: 60, lastStormDate: "2026-04-18", status: "contacted", consent: "opted_out", phone: "(469) 555-0673", email: "lpatel@example.com", notes: "Requested no contact.", lat: 33.14, lng: -96.82, zip: "75034" },
  { id: "L-1008", ownerName: "Michael Brooks", propertyAddress: "21 Brookhaven Dr, Allen, TX", mailingAddress: "21 Brookhaven Dr, Allen, TX 75013", parcelId: "PRC-661225", roofAge: 18, homeValue: 660000, stormScore: 84, hailSize: 1.5, windSpeed: 70, lastStormDate: "2026-04-22", status: "new", consent: "no_consent", phone: "(214) 555-0789", email: "mbrooks@example.com", notes: "", lat: 33.105, lng: -96.675, zip: "75013" },
];

export const stormEvents = [
  { id: "S-2201", date: "2026-04-22", location: "Plano / Allen, TX", hailSize: 2.25, windSpeed: 85, affected: 3420 },
  { id: "S-2202", date: "2026-04-18", location: "Frisco, TX", hailSize: 1.5, windSpeed: 65, affected: 1890 },
  { id: "S-2203", date: "2026-03-30", location: "McKinney, TX", hailSize: 0.75, windSpeed: 55, affected: 740 },
  { id: "S-2204", date: "2026-03-12", location: "Richardson, TX", hailSize: 1.25, windSpeed: 62, affected: 1120 },
];

export const integrations = [
  { name: "Supabase", category: "Database", status: "available", desc: "Postgres, auth, storage, edge functions." },
  { name: "Google Maps API", category: "Mapping", status: "available", desc: "Maps, geocoding, places & routes." },
  { name: "ATTOM", category: "Property Data", status: "available", desc: "Nationwide parcel & owner data." },
  { name: "Estated", category: "Property Data", status: "available", desc: "Property records & valuations." },
  { name: "Regrid", category: "Property Data", status: "available", desc: "Parcel boundaries & ownership." },
  { name: "DataTree", category: "Property Data", status: "available", desc: "Title & property intelligence." },
  { name: "NOAA", category: "Storm Data", status: "available", desc: "Official storm reports & alerts." },
  { name: "HailTrace", category: "Storm Data", status: "available", desc: "Hail swath polygons & history." },
  { name: "CoreLogic", category: "Storm Data", status: "available", desc: "Verified hail & wind verification." },
  { name: "SendGrid", category: "Email", status: "available", desc: "Transactional & marketing email." },
  { name: "Mailgun", category: "Email", status: "available", desc: "Email API with deliverability tools." },
  { name: "Twilio", category: "SMS", status: "available", desc: "SMS, MMS, with consent enforcement." },
  { name: "JobNimbus", category: "CRM", status: "available", desc: "Roofing CRM & project management." },
  { name: "AccuLynx", category: "CRM", status: "available", desc: "End-to-end roofing business platform." },
  { name: "CompanyCam", category: "CRM", status: "available", desc: "Photo documentation for job sites." },
];
