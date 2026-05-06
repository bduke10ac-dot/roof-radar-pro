import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type BrandProfile = {
  display_name: string | null;
  company_name: string | null;
  company_logo_url: string | null;
};

const EMPTY: BrandProfile = { display_name: null, company_name: null, company_logo_url: null };

export function useBrand() {
  const { user } = useAuth();
  const [brand, setBrand] = useState<BrandProfile>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) { setBrand(EMPTY); return; }
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("display_name, company_name, company_logo_url")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!error && data) setBrand(data as BrandProfile);
    setLoading(false);
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const save = async (patch: Partial<BrandProfile>) => {
    if (!user) throw new Error("Not signed in");
    const { error } = await supabase
      .from("profiles")
      .update(patch)
      .eq("user_id", user.id);
    if (error) throw error;
    setBrand((b) => ({ ...b, ...patch }));
  };

  const uploadLogo = async (file: File) => {
    if (!user) throw new Error("Not signed in");
    if (!file.type.startsWith("image/")) throw new Error("Please choose an image file");
    if (file.size > 4 * 1024 * 1024) throw new Error("Logo must be under 4 MB");
    setUploading(true);
    try {
      const ext = (file.name.split(".").pop() || "png").toLowerCase().replace(/[^a-z0-9]/g, "") || "png";
      const path = `${user.id}/logo-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase
        .storage.from("company-logos")
        .upload(path, file, { upsert: true, contentType: file.type, cacheControl: "3600" });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("company-logos").getPublicUrl(path);
      await save({ company_logo_url: pub.publicUrl });
      return pub.publicUrl;
    } finally {
      setUploading(false);
    }
  };

  const removeLogo = async () => {
    await save({ company_logo_url: null });
  };

  return { brand, loading, uploading, save, uploadLogo, removeLogo, refresh };
}
