import type { Metadata, Viewport } from "next";
import { Manrope, Mukta, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const mukta = Mukta({
  subsets: ["devanagari", "latin"],
  variable: "--font-mukta",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: "Saathi — Pehle hum aapko bachate hain. Phir aapke paise ko badhaate hain.",
    template: "%s · Saathi",
  },
  description:
    "Saathi is your AI advocate for Bharat. Free scam defense for your family. Honest investment plans for your money. Entirely on WhatsApp.",
  applicationName: "Saathi",
  authors: [{ name: "Saathi" }],
  keywords: [
    "AI",
    "WhatsApp",
    "Bharat",
    "scam defense",
    "investments",
    "ULIP audit",
    "Hindi fintech",
    "SIP",
    "Sukanya Samriddhi",
  ],
  openGraph: {
    type: "website",
    siteName: "Saathi",
    title: "Saathi — your AI advocate for Bharat",
    description:
      "Free scam defense for your family. Honest investment plans for your money. WhatsApp-native, voice-first, vernacular by default.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FBF6EB",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${mukta.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-saathi-cream text-saathi-ink font-sans flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
