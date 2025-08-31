import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import NavMount from "@/components/NavMount";
import { GlobalErrorBoundary } from "@/components/GlobalErrorBoundary";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Data Dashboard",
  description: "Analyse procurement, sales, and inventory history",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased h-full`}>
        <Providers>
          <GlobalErrorBoundary>
            <div className="min-h-screen flex flex-col">
              <NavMount />
              <main className="flex-1 overflow-auto">
                {children}
              </main>
            </div>
          </GlobalErrorBoundary>
        </Providers>
      </body>
    </html>
  );
}
