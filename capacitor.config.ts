import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "app.lovable.19588e28bdd747ddab412a58040b318e",
  appName: "RoofRadar",
  webDir: "dist",
  server: {
    url: "https://19588e28-bdd7-47dd-ab41-2a58040b318e.lovableproject.com?forceHideBadge=true",
    cleartext: true,
  },
  ios: { contentInset: "always" },
  android: { allowMixedContent: true },
};

export default config;
