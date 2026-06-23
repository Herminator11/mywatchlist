import type { Metadata } from "next";
import { Fraunces, Hanken_Grotesk } from "next/font/google";
import "./globals.css";

// Kino-Editorial (Criterion): Fraunces als ausdrucksstarke Display-Serife,
// Hanken Grotesk als warmer Body-Grotesk – bewusst kein Inter/Arial.
const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "600", "900"],
  style: ["normal", "italic"],
  display: "swap",
});

const sans = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "MyWatchlist",
  description: "Dein persönlicher Film & Serien Tracker",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="de"
      suppressHydrationWarning
      className={`${display.variable} ${sans.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
