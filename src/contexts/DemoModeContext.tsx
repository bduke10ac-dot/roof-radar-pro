import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useUserRole } from "@/hooks/useUserRole";

type Ctx = { demoMode: boolean; setDemoMode: (v: boolean) => void; canToggle: boolean };
const C = createContext<Ctx | null>(null);
const KEY = "rr.demoMode";

export function DemoModeProvider({ children }: { children: ReactNode }) {
  const { isAdmin } = useUserRole();
  const [demoMode, setDemoModeState] = useState<boolean>(() => {
    try { return localStorage.getItem(KEY) === "1"; } catch { return false; }
  });
  // Non-admins cannot have demo mode enabled
  useEffect(() => { if (!isAdmin && demoMode) setDemoModeState(false); }, [isAdmin, demoMode]);
  const setDemoMode = (v: boolean) => {
    setDemoModeState(v);
    try { localStorage.setItem(KEY, v ? "1" : "0"); } catch { /* ignore */ }
  };
  return (
    <C.Provider value={{ demoMode: demoMode && isAdmin, setDemoMode, canToggle: isAdmin }}>
      {children}
    </C.Provider>
  );
}

export const useDemoMode = () => {
  const v = useContext(C);
  if (!v) throw new Error("useDemoMode must be used within DemoModeProvider");
  return v;
};
