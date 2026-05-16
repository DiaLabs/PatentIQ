import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PatentIQ — Smarter Patent Evaluation, Stronger Innovations",
  description:
    "PatentIQ combines AI, prior art search, and mentor-defined criteria to evaluate patents with accuracy, consistency, and clarity.",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
  },
  manifest: "/manifest.json",
};

import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
import { RefreshProvider } from "@/context/RefreshContext";
import { GridBackground } from "@/components/ui/grid-background";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} h-full antialiased`} data-scroll-behavior="smooth">
      <body className="min-h-full flex flex-col font-sans bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white transition-colors">
        <AuthProvider>
          <ToastProvider>
            <RefreshProvider>
              <GridBackground />
              {children}
            </RefreshProvider>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
