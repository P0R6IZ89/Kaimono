import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kaimono ver. beta",
  description: "Ultimate shopping list manager",
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
