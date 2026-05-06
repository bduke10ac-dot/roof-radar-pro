import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const loc = useLocation();
  const hasContact = typeof window !== "undefined" && !!localStorage.getItem("rr_guest_contact");
  const guest = typeof window !== "undefined" && localStorage.getItem("rr_guest") === "1" && hasContact;
  if (loading) return <div className="min-h-screen grid place-items-center text-sm text-muted-foreground">Loading…</div>;
  if (!user && !guest) return <Navigate to={user ? `/login?next=${encodeURIComponent(loc.pathname + loc.search)}` : "/"} replace />;
  return <>{children}</>;
}
