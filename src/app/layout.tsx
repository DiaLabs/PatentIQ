import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "PatentIQ — Smarter Patent Evaluation, Stronger Innovations",
    template: "%s | PatentIQ",
  },
  description:
    "PatentIQ combines AI, prior art search, and mentor-defined criteria to evaluate patents with accuracy, consistency, and clarity.",
  keywords: [
    "patetntiq",
    "patent",
    "dialabs",
    "dia",
    "dialabs.tech",
    "patentiq dialabs",
    "dialabs patentiq",
    "itesh dialabs",
    "itesh patentiq",
    "dhruv dialabs",
    "dhruv patentiq",
    "aditya dialabs",
    "aditya patentiq",
    "codexdhruv",
    "iteshxt",
    "aditanupam",
    "patent iq",
    "patntiq",
    "PatentIQ"
  ],
  authors: [
    { name: "Itesh Singh Tomar", url: "https://iteshxt.me" },
    { name: "Dhruv Sen", url: "https://codexdhruv.dev" },
    { name: "Aditya Kumar Anupam", url: "https://aditanupam.dev" }
  ],
  creator: "PatentIQ",
  publisher: "PatentIQ",
  applicationName: "PatentIQ",
  openGraph: {
    title: "PatentIQ — Smarter Patent Evaluation, Stronger Innovations",
    description: "PatentIQ combines AI, prior art search, and mentor-defined criteria to evaluate patents with accuracy, consistency, and clarity.",
    siteName: "PatentIQ",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PatentIQ — AI-Powered Patent Evaluation",
    description: "PatentIQ combines AI, prior art search, and mentor-defined criteria to evaluate patents with accuracy.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "XW0dGehpDX49tHjWRW92ccBimJKiTJyznvrHlTtzKKM",
  },
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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme');
                  const supportDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (theme === 'dark' || (!theme && supportDarkMode)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
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
