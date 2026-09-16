// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Apex Retail - SME Inventory & Profit Intelligence",
  description: "Point of sale, real-time inventory tracking, and accounts receivable management.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased bg-slate-50 text-slate-900 font-sans min-h-screen selection:bg-slate-900 selection:text-white">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}