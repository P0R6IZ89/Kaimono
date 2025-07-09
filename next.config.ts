import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ["p0r6iz89.cloud", "*.p0r6iz89.cloud"],
    },
  },
  async rewrites() {
    return [
      {
        source: "/",
        destination: "/",
        has: [{ type: "host", value: "(?<subdomain>.+)\\.yourdomain\\.com" }],
      },
    ];
  },
  images: {
    domains: ["res.cloudinary.com"],
  },
};

export default nextConfig;
