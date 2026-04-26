import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Cache Components / PPR intentionally NOT enabled yet — adds Suspense
  // overhead we don't need for the prototype. Revisit before production.
  experimental: {},
  images: {
    // Stylized illustrations are local SVGs; remote sources go here later.
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
