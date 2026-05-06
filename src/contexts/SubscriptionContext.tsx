import { createContext, useContext, useMemo, useState, ReactNode } from "react";

export type PlanId = "free" | "starter" | "pro" | "enterprise";
export type BillingCycle = "monthly" | "yearly";

export type FeatureKey =
  | "automation"
  | "sms"
  | "apiAccess"
  | "crmIntegrations"
  | "aiScoring"
  | "advancedWeather"
  | "teamAccounts"
  | "whiteLabel"
  | "routeOptimization"
  | "directMailExport"
  | "advancedReporting"
  | "multiStateTargeting";

export type Plan = {
  id: PlanId;
  name: string;
  tagline: string;
  monthlyPrice: number | null; // null = custom
  yearlyPrice: number | null;
  highlight?: boolean;
  limits: {
    maxMarkets: number; // -1 = unlimited
    maxLeadsPerMonth: number;
    maxEmailsPerMonth: number;
    maxSmsPerMonth: number;
  };
  features: Record<FeatureKey, boolean>;
  perks: string[];
};

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    tagline: "Try the platform with limited features",
    monthlyPrice: 0,
    yearlyPrice: 0,
    limits: { maxMarkets: 1, maxLeadsPerMonth: 25, maxEmailsPerMonth: 10, maxSmsPerMonth: 0 },
    features: {
      automation: false, sms: false, apiAccess: false, crmIntegrations: false,
      aiScoring: false, advancedWeather: false, teamAccounts: false, whiteLabel: false,
      routeOptimization: false, directMailExport: false, advancedReporting: false, multiStateTargeting: false,
    },
    perks: [
      "1 saved market",
      "25 leads / month",
      "Basic weather map",
      "Basic storm overlays",
      "10 emails / month",
      "RoofRadar branding",
    ],
  },
  {
    id: "starter",
    name: "Starter",
    tagline: "Solo contractors closing storm leads",
    monthlyPrice: 99,
    yearlyPrice: 990,
    limits: { maxMarkets: 5, maxLeadsPerMonth: 500, maxEmailsPerMonth: 5000, maxSmsPerMonth: 1000 },
    features: {
      automation: true, sms: true, apiAccess: false, crmIntegrations: true,
      aiScoring: false, advancedWeather: false, teamAccounts: false, whiteLabel: false,
      routeOptimization: true, directMailExport: false, advancedReporting: false, multiStateTargeting: false,
    },
    perks: [
      "5 saved markets",
      "500 leads / month",
      "Advanced storm overlays",
      "Door-knocking routes",
      "CSV exports",
      "Basic automation rules",
      "Email + SMS via Twilio",
      "JobNimbus + CompanyCam",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "Crews scaling across multiple markets",
    monthlyPrice: 299,
    yearlyPrice: 2990,
    highlight: true,
    limits: { maxMarkets: -1, maxLeadsPerMonth: -1, maxEmailsPerMonth: -1, maxSmsPerMonth: -1 },
    features: {
      automation: true, sms: true, apiAccess: true, crmIntegrations: true,
      aiScoring: true, advancedWeather: true, teamAccounts: true, whiteLabel: true,
      routeOptimization: true, directMailExport: true, advancedReporting: true, multiStateTargeting: true,
    },
    perks: [
      "Unlimited markets & leads",
      "Real-time storm tracking",
      "Advanced weather automations",
      "AI lead scoring",
      "Multi-state targeting",
      "API access + CRM sync",
      "Team management & territories",
      "Direct mail exports",
      "Priority support",
      "Remove RoofRadar branding",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    tagline: "Multi-office & national operators",
    monthlyPrice: null,
    yearlyPrice: null,
    limits: { maxMarkets: -1, maxLeadsPerMonth: -1, maxEmailsPerMonth: -1, maxSmsPerMonth: -1 },
    features: {
      automation: true, sms: true, apiAccess: true, crmIntegrations: true,
      aiScoring: true, advancedWeather: true, teamAccounts: true, whiteLabel: true,
      routeOptimization: true, directMailExport: true, advancedReporting: true, multiStateTargeting: true,
    },
    perks: [
      "Multi-office support",
      "National targeting",
      "Custom integrations",
      "Dedicated onboarding",
      "Full white-label",
      "Custom API limits",
      "SLA & dedicated CSM",
    ],
  },
];

export type Usage = {
  leads: number;
  emails: number;
  sms: number;
  markets: number;
};

type SubState = {
  plan: Plan;
  cycle: BillingCycle;
  status: "trialing" | "active" | "free" | "past_due" | "canceled";
  trialEndsAt: Date | null;
  renewsAt: Date | null;
  usage: Usage;
};

type Ctx = SubState & {
  plans: Plan[];
  startTrial: (planId: PlanId) => void;
  changePlan: (planId: PlanId, cycle?: BillingCycle) => void;
  cancel: () => void;
  setCycle: (c: BillingCycle) => void;
  has: (f: FeatureKey) => boolean;
  withinLimit: (key: keyof Usage, limitKey: keyof Plan["limits"]) => boolean;
  upgradePrompt: { feature?: FeatureKey; reason?: string; open: boolean };
  requestUpgrade: (feature?: FeatureKey, reason?: string) => void;
  closeUpgrade: () => void;
};

const SubscriptionContext = createContext<Ctx | null>(null);

const findPlan = (id: PlanId) => PLANS.find(p => p.id === id)!;

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [planId, setPlanId] = useState<PlanId>("free");
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const [status, setStatus] = useState<SubState["status"]>("free");
  const [trialEndsAt, setTrialEndsAt] = useState<Date | null>(null);
  const [renewsAt, setRenewsAt] = useState<Date | null>(null);
  const [usage] = useState<Usage>({ leads: 18, emails: 7, sms: 0, markets: 1 });
  const [upgradePrompt, setUpgradePrompt] = useState<Ctx["upgradePrompt"]>({ open: false });

  const plan = findPlan(planId);

  const value: Ctx = useMemo(() => ({
    plan, cycle, status, trialEndsAt, renewsAt, usage, plans: PLANS,
    startTrial: (id) => {
      setPlanId(id);
      setStatus("trialing");
      const end = new Date(); end.setDate(end.getDate() + 14);
      setTrialEndsAt(end);
      setRenewsAt(end);
    },
    changePlan: (id, c) => {
      setPlanId(id);
      if (c) setCycle(c);
      setStatus(id === "free" ? "free" : "active");
      if (id !== "free") {
        const r = new Date(); r.setMonth(r.getMonth() + (c === "yearly" || cycle === "yearly" ? 12 : 1));
        setRenewsAt(r);
      } else { setRenewsAt(null); }
      setTrialEndsAt(null);
    },
    cancel: () => { setStatus("canceled"); },
    setCycle,
    has: (f) => plan.features[f],
    withinLimit: (key, limitKey) => {
      const lim = plan.limits[limitKey];
      if (lim === -1) return true;
      return usage[key] < lim;
    },
    upgradePrompt,
    requestUpgrade: (feature, reason) => setUpgradePrompt({ feature, reason, open: true }),
    closeUpgrade: () => setUpgradePrompt({ open: false }),
  }), [plan, cycle, status, trialEndsAt, renewsAt, usage, upgradePrompt]);

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
}

export const useSubscription = () => {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error("useSubscription must be used within SubscriptionProvider");
  return ctx;
};
