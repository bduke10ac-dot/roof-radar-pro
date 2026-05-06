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

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [params] = useSearchParams();
  const next = params.get("next") || "/app";

  useEffect(() => { document.title = "Log in — RoofRadar"; }, []);
  useEffect(() => { if (user) navigate(next, { replace: true }); }, [user, navigate, next]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back");
    navigate(next, { replace: true });
  };

  const google = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}${next}` },
    });
    if (error) toast.error(error.message);
  };

  return (
    <MarketingLayout>
      <div className="max-w-sm mx-auto px-4 py-12">
        <Card className="p-6">
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-sm text-muted-foreground mt-1">Log in to your RoofRadar account.</p>
          <Button variant="outline" className="w-full mt-5" onClick={google}>Continue with Google</Button>
          <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" /> or <div className="h-px flex-1 bg-border" />
          </div>
          <form onSubmit={submit} className="space-y-3">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>{loading ? "Logging in…" : "Log in"}</Button>
          </form>
          <p className="text-xs text-muted-foreground text-center mt-4">
            Don't have an account? <Link to="/signup" className="underline">Sign up</Link>
          </p>
        </Card>
      </div>
    </MarketingLayout>
  );
}
