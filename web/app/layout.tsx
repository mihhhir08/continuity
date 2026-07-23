import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const sans = Geist({ variable: "--font-sans", subsets: ["latin"] });
const mono = Geist_Mono({ variable: "--font-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Continuity — Software that survives change",
    template: "%s — Continuity",
  },
  description:
    "Predict what software changes will break, repair affected systems locally, and prove they are safe before release.",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "Continuity — Software that survives change",
    description:
      "Agent-native infrastructure for predicting, repairing, and verifying software change.",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Continuity — Software that survives change",
    description:
      "Agent-native infrastructure for predicting, repairing, and verifying software change.",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${sans.variable} ${mono.variable}`}>{children}</body>
    </html>
  );
}
