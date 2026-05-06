import { useState } from "react";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Block obviously fake / disposable inputs
const DISPOSABLE_DOMAINS = [
  "mailinator.com","tempmail.com","temp-mail.org","10minutemail.com","guerrillamail.com",
  "yopmail.com","trashmail.com","fakeinbox.com","sharklasers.com","getnada.com",
  "dispostable.com","maildrop.cc","throwawaymail.com","example.com","test.com",
];
const FAKE_NAME_PATTERNS = [
  /^test\b/i, /^asdf/i, /^qwerty/i, /^john\s*doe$/i, /^jane\s*doe$/i, /^fake/i,
  /^abc+$/i, /^xxx+$/i, /^[a-z]\1{2,}$/i,
];
const FAKE_COMPANY_PATTERNS = [
  /^test\b/i, /^asdf/i, /^n\/?a$/i, /^none$/i, /^fake/i, /^company$/i, /^xxx+$/i,
];

const nameSchema = z.string().trim().min(2, "Enter your full name").max(80)
  .regex(/^[A-Za-z][A-Za-z .'\-]+\s+[A-Za-z][A-Za-z .'\-]+/, "Enter first and last name")
  .refine((v) => !FAKE_NAME_PATTERNS.some((r) => r.test(v)), "Please use your real name");

const companySchema = z.string().trim().min(2, "Enter your company name").max(120)
  .refine((v) => !FAKE_COMPANY_PATTERNS.some((r) => r.test(v)), "Please use your real company name");

const emailSchema = z.string().trim().toLowerCase().email("Enter a valid email").max(200)
  .refine((v) => {
    const domain = v.split("@")[1] ?? "";
    if (DISPOSABLE_DOMAINS.includes(domain)) return false;
    // require a real TLD
    if (!/\.[a-z]{2,}$/.test(domain)) return false;
    return true;
  }, "Use a real work email (no temp/disposable addresses)");

const phoneSchema = z.string().trim().min(10, "Enter a valid phone")
  .transform((v) => v.replace(/\D/g, ""))
  .refine((d) => d.length === 10 || (d.length === 11 && d.startsWith("1")), "Enter a 10-digit US phone")
  .refine((d) => {
    const ten = d.length === 11 ? d.slice(1) : d;
    if (/^(\d)\1{9}$/.test(ten)) return false;           // 1111111111
    if (ten === "1234567890" || ten === "0123456789") return false;
    if (ten.startsWith("555")) return false;             // movie numbers
    if (ten[0] === "0" || ten[0] === "1") return false;  // invalid area code
    return true;
  }, "Enter a real phone number");

const schema = z.object({
  name: nameSchema,
  company: companySchema,
  email: emailSchema,
  phone: phoneSchema,
  consent: z.literal(true, { errorMap: () => ({ message: "You must agree to be contacted" }) }),
});

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVerified: () => void;
};

export function GuestGateDialog({ open, onOpenChange, onVerified }: Props) {
  const [form, setForm] = useState({ name: "", company: "", email: "", phone: "", consent: false });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const update = (k: string, v: string | boolean) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => { const n = { ...e }; delete n[k]; return n; });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0]);
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      setSubmitting(false);
      return;
    }
    const data = { ...parsed.data, captured_at: new Date().toISOString() };
    localStorage.setItem("rr_guest_contact", JSON.stringify(data));
    localStorage.setItem("rr_guest", "1");
    toast.success("Thanks! Loading your free preview…");
    setSubmitting(false);
    onOpenChange(false);
    onVerified();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Get instant access</DialogTitle>
          <DialogDescription>
            Tell us who you are and we'll unlock the free preview. Real info only — fake details are blocked.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3" noValidate>
          <div>
            <Label htmlFor="g-name">Full name</Label>
            <Input id="g-name" autoComplete="name" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Jane Smith" />
            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
          </div>
          <div>
            <Label htmlFor="g-company">Company name</Label>
            <Input id="g-company" autoComplete="organization" value={form.company} onChange={(e) => update("company", e.target.value)} placeholder="ACME Roofing" />
            {errors.company && <p className="text-xs text-destructive mt-1">{errors.company}</p>}
          </div>
          <div>
            <Label htmlFor="g-email">Work email</Label>
            <Input id="g-email" type="email" autoComplete="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="jane@acmeroofing.com" />
            {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
          </div>
          <div>
            <Label htmlFor="g-phone">Mobile phone</Label>
            <Input id="g-phone" type="tel" autoComplete="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="(555) 123-4567" />
            {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
          </div>
          <label className="flex items-start gap-2 text-xs text-muted-foreground">
            <input type="checkbox" className="mt-0.5" checked={form.consent} onChange={(e) => update("consent", e.target.checked)} />
            <span>I agree RoofRadar may contact me about my account by email or phone.</span>
          </label>
          {errors.consent && <p className="text-xs text-destructive">{errors.consent}</p>}
          <Button type="submit" className="w-full h-11" disabled={submitting}>
            {submitting ? "Verifying…" : "Unlock free preview"}
          </Button>
          <p className="text-[10px] text-muted-foreground text-center">
            No credit card. We never sell your data.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
