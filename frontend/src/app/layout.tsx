import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Thronix AI | AI-Powered Real-Time Industrial Asset Monitoring",
  description: "AI-powered real-time industrial asset monitoring for oil and gas — from GCC fields to Niger deep-water operations. AI recommends, humans decide.",
};

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SmoothScrolling from "@/components/layout/SmoothScrolling";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <SmoothScrolling>
          <Navbar />
          <main className="flex-1 flex flex-col">{children}</main>
          <Footer />
        </SmoothScrolling>
      </body>
    </html>
  );
}
