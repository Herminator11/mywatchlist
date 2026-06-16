import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="de" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}