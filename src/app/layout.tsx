import type { Metadata } from "next";
import { Cormorant_Garamond, Inter, JetBrains_Mono } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  weight: ["400", "500"],
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://lrtcity.lixionary.com";
const SITE_DESCRIPTION =
  "Komunitas konsumen LRT City Tebet — informasi resmi seputar unit, PPJB, dan progres projek LRT City yang dikembangkan oleh PT ADCP (Adhi Commuter Properti), bagian dari Adhi Karya Group.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "LRT City Consumer Community | ADCP LRT City Tebet",
    template: "%s | LRT City Consumer Community",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "LRT City",
    "LRT City Tebet",
    "LRT City projek",
    "ADCP",
    "Adhi Karya",
    "PPJB LRT City",
    "konsumen LRT City",
  ],
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: SITE_URL,
    siteName: "LRT City Consumer Community",
    title: "LRT City Consumer Community | ADCP LRT City Tebet",
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "LRT City Consumer Community | ADCP LRT City Tebet",
    description: SITE_DESCRIPTION,
  },
  verification: {
    google: "QwClC5cC7iyTtUzBNFaBceltB4LnKj6S9UQnW-epPTo",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${cormorant.variable} ${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-canvas font-sans text-body">
        {children}
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
