import type { MetadataRoute } from "next";

/**
 * Bharosa Web App Manifest. Auto-served by Next.js 16 at
 * /manifest.webmanifest. Required for PWABuilder / Bubblewrap / any TWA
 * shell to wrap the live site as an installable Android APK.
 *
 * Theme + background colours match the cream + deep-green design tokens
 * in src/app/globals.css. Icons reuse the supplied Bharosa mark.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Bharosa — AI advocate for Bharat",
    short_name: "Bharosa",
    description:
      "Defense-first, WhatsApp-native AI advocate for Bharat households. Catch scams, audit ULIPs, plan goal-anchored investments — in your language.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#FBF6EB",
    theme_color: "#0F4D3F",
    lang: "hi-IN",
    dir: "ltr",
    categories: ["finance", "productivity", "lifestyle"],
    icons: [
      { src: "/brand/bharosa-mark.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/brand/bharosa-mark.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/brand/bharosa-mark.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
