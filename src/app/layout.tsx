import type { Metadata } from "next";
import { Cormorant_Garamond, Inter, JetBrains_Mono } from "next/font/google";
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
  "Perkumpulan konsumen LRT City Tebet — database konsumen, timeline projek, dokumen PPJB, dan berita terbaru seputar LRT City.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "LRT City Consumer Community",
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
    title: "LRT City Consumer Community",
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "LRT City Consumer Community",
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
      </body>
    </html>
  );
}
