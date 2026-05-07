import { CapacitorConfig } from "@capacitor/cli";

// RoofRadar — Capacitor configuration for iOS/Android.
// Bundle ID placeholder: replace `com.roofradar.app` with your final reverse-DNS
// identifier registered in the Apple Developer / Google Play console before submission.
const config: CapacitorConfig = {
  appId: "com.roofradar.app",
  appName: "RoofRadar",
  webDir: "dist",
  server: {
    url: "https://19588e28-bdd7-47dd-ab41-2a58040b318e.lovableproject.com?forceHideBadge=true",
    cleartext: true,
  },
  ios: { contentInset: "always" },
  android: { allowMixedContent: true },
  // App icon + splash:
  // iOS: drop 1024x1024 icon at ios/App/App/Assets.xcassets/AppIcon.appiconset/
  //      splash images at ios/App/App/Assets.xcassets/Splash.imageset/
  // Android: place adaptive icons under android/app/src/main/res/mipmap-*/
  //          splash drawables under android/app/src/main/res/drawable*/
};

export default config;
