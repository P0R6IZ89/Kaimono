import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["localtest.me", "*.localtest.me"],
  logging: {
    fetches: {
      fullUrl: true,
      hmrRefreshes: true,
    },
  },
};

export default nextConfig;
