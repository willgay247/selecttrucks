import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Vehicle photos are served from R2 via our own /api/media route,
    // so remote optimisation is handled at the edge by Cloudflare.
    remotePatterns: [
      { protocol: "https", hostname: "cdn.website-editor.net" },
      { protocol: "https", hostname: "le-cdn.website-editor.net" },
    ],
  },
};

export default nextConfig;

// Enable Cloudflare bindings (DB, MEDIA, etc.) during `next dev`.
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
