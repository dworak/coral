import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ConditionalNavigation from "@/components/ConditionalNavigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Solar Monitoring System",
  description: "Monitor and manage solar installations with real-time data and analytics",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ConditionalNavigation />
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}