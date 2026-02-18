import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import CursorEffect from "@/components/CursorEffect";

import Footer from "@/components/Footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RKMODS - Premium App Store",
  description: "Download the latest premium apps and games.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <CursorEffect />
        {children}
        <Footer />
      </body>
    </html>
  );
}
