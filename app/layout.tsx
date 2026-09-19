import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { fraunces, inter, jetbrainsMono, plusJakarta, spaceGrotesk } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://floorfi.fun"),
  title: {
    default: "Floorfi — Memecoins that mop the floor",
    template: "%s · Floorfi",
  },
  description:
    "Pair your coin with a collection. Lock the fee split. Every trade helps buy the floor — on chain, in public.",
  icons: {
    icon: [
      { url: "/favicons/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicons/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicons/favicon-48.png", sizes: "48x48", type: "image/png" },
    ],
    apple: "/favicons/favicon-180.png",
  },
  openGraph: {
    title: "Floorfi",
    description: "Memecoins that mop the floor.",
    images: ["/logo/og-promo.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} ${fraunces.variable} ${plusJakarta.variable}`}
    >
      <body className="bg-void font-ui text-snow antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
