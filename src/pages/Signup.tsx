import { useEffect, useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { MarketingLayout } from "@/components/MarketingLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [params] = useSearchParams();
  const plan = params.get("plan");
  const cycle = params.get("cycle") || "monthly";
  const dest = plan && plan !== "free" ? `/checkout?plan=${plan}&cycle=${cycle}` : "/app";

  useEffect(() => { document.title = "Sign up — RoofRadar"; }, []);
  useEffect(() => { if (user) navigate(dest, { replace: true }); }, [user, navigate, dest]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}${dest}`,
        data: { company_name: companyName },
      },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Account created — check your email to confirm.");
  };

  const google = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}${dest}` },
    });
    if (error) toast.error(error.message);
  };

  return (
    <MarketingLayout>
      <div className="max-w-sm mx-auto px-4 py-12">
        <Card className="p-6">
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-sm text-muted-foreground mt-1">Start your 14-day free trial. No credit card required.</p>
          <Button variant="outline" className="w-full mt-5" onClick={google}>Continue with Google</Button>
          <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" /> or <div className="h-px flex-1 bg-border" />
          </div>
          <form onSubmit={submit} className="space-y-3">
            <div>
              <Label htmlFor="company">Company name</Label>
              <Input id="company" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="ACME Roofing" />
            </div>
            <div>
              <Label htmlFor="email">Work email</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>{loading ? "Creating…" : "Create account"}</Button>
          </form>
          <p className="text-xs text-muted-foreground text-center mt-4">
            Already have one? <Link to="/login" className="underline">Log in</Link>
          </p>
          <p className="text-[10px] text-muted-foreground text-center mt-3">
            By signing up you agree to our <Link to="/terms" className="underline">Terms</Link> and <Link to="/privacy" className="underline">Privacy Policy</Link>.
          </p>
        </Card>
      </div>
    </MarketingLayout>
  );
}
