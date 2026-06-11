import type { Metadata } from "next";
import { siteUrl } from "@/lib/metadata";

export const metadata: Metadata = {
  metadataBase: siteUrl,
  applicationName: "Kaimono",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "default" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning>
      <body className="antialiased">{children}</body>
    </html>
  );
}
