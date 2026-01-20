import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
const rootDomainHost = rootDomain.split(":")[0];
const allowedOriginsEnv =
  process.env.NEXT_PUBLIC_ALLOWED_ORIGINS || process.env.ALLOWED_ORIGINS || "";
const allowedOrigins = allowedOriginsEnv
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const serverActionOrigins =
  allowedOrigins.length > 0 && rootDomainHost
    ? allowedOrigins
    : [rootDomainHost, `*.${rootDomainHost}`].filter(Boolean);
const escapedRootDomainHost = rootDomainHost.replace(/\./g, "\\.");

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: serverActionOrigins,
    },
  },
  async rewrites() {
    return [
      {
        source: "/",
        destination: "/",
        has: [
          {
            type: "host",
            value: `(?<subdomain>.+)\\.${escapedRootDomainHost}`,
          },
        ],
      },
    ];
  },
  images: {
    domains: ["res.cloudinary.com"],
  },
};
const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
