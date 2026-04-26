import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Allow HMR + client bundle access from the LAN IP so phones / other
  // devices on the same wifi can hit the dev server. Add more origins
  // as needed (e.g. tunneled URLs).
  allowedDevOrigins: ["192.168.1.12", "192.168.0.0/16", "10.0.0.0/8"],
  experimental: {},
  images: {
    remotePatterns: [],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
