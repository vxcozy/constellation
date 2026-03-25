import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import ThemeProvider from "@/components/ThemeProvider";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

// ── Customize your metadata here ──────────────────────────────────────────
export const metadata: Metadata = {
  metadataBase: new URL("https://yourdomain.com"),
  title: "Your Name — Design / Engineering / Product",
  description:
    "Interactive 3D portfolio constellation.",
  keywords: ["portfolio", "design", "engineering", "3d", "constellation"],
  authors: [{ name: "Your Name" }],
  creator: "Your Name",
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://yourdomain.com",
    siteName: "Your Name",
    title: "Your Name — Design / Engineering / Product",
    description: "Interactive 3D portfolio constellation.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Your Name — Design / Engineering / Product",
    description: "Interactive 3D portfolio constellation.",
    creator: "@yourusername",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
