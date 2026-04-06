import type { Metadata } from "next";
import { DM_Sans, Instrument_Sans } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";

import { Integrations } from "~/integrations";
import "~/styles/globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans"
});

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument-sans"
});

const DESCRIPTION =
  "Tunnl is a free, open-source webhook debugger with secure tunnels, instant replay, and a local dashboard. Debug live webhook integrations on localhost — no signup required.";

export const metadata: Metadata = {
  metadataBase: new URL("https://usetunnl.com"),
  title: {
    default: "Tunnl — Debug, Replay & Test Webhooks Locally",
    template: "%s | Tunnl"
  },
  description: DESCRIPTION,
  keywords: [
    "webhook debugger",
    "webhook testing",
    "webhook replay",
    "secure tunnel",
    "localhost tunnel",
    "ngrok alternative",
    "cloudflared alternative",
    "webhook inspector",
    "webhook development",
    "stripe webhooks",
    "github webhooks",
    "webhook mock",
    "open source tunnel"
  ],
  authors: [{ name: "Tunnl", url: "https://usetunnl.com" }],
  creator: "Tunnl",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://usetunnl.com",
    siteName: "Tunnl",
    title: "Tunnl — Debug, Replay & Test Webhooks Locally",
    description: DESCRIPTION,
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Tunnl — Debug, Replay & Test Webhooks Locally"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Tunnl — Debug, Replay & Test Webhooks Locally",
    description: DESCRIPTION,
    images: ["/og.png"],
    creator: "@usetunnl"
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1
    }
  },
  alternates: {
    canonical: "https://usetunnl.com"
  }
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${instrumentSans.variable}`}>
      <body className="relative">
        <Integrations>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "SoftwareApplication",
                name: "Tunnl",
                applicationCategory: "DeveloperApplication",
                operatingSystem: "macOS, Linux, Windows",
                url: "https://usetunnl.com",
                description: DESCRIPTION,
                offers: [
                  {
                    "@type": "Offer",
                    price: "0",
                    priceCurrency: "USD",
                    name: "Free"
                  },
                  {
                    "@type": "Offer",
                    price: "8",
                    priceCurrency: "USD",
                    name: "Pro",
                    billingIncrement: "P1M"
                  }
                ]
              })
            }}
          />
          {children}
        </Integrations>
      </body>
    </html>
  );
}
