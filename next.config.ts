import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

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
const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
