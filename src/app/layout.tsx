import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { NotificationProvider } from "@/components/providers/NotificationProvider";
import { ToastProvider } from "@/components/providers/ToastProvider";
import { AdBlockDetector } from "@/components/ads/AdBlockDetector";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "If Only There Was A - Share Problems That Need Solutions",
    template: "%s | If Only There Was A",
  },
  description:
    "A community where people share problems they wish had solutions. Post your 'if only there was a...' ideas and discover what others need so devs actually know what to build.",
  openGraph: {
    type: "website",
    siteName: "If Only There Was A",
    locale: "en_US",
  },
  twitter: { card: "summary_large_image" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4219532610277796" crossOrigin="anonymous"></script>
      </head>
      <body className={`${inter.variable} font-sans`}>
        <AuthProvider>
          <NotificationProvider>
            <ToastProvider>
              {children}
              <AdBlockDetector />
            </ToastProvider>
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
