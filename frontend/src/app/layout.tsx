import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

import { GlobalAuthModal } from "@/components/GlobalAuthModal";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Udyame AI - Business Planning Assistant",
  description: "AI-powered business planning and proposal generation for entrepreneurs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className={`${inter.className} min-h-full flex flex-col`} suppressHydrationWarning>
        {children}
        <GlobalAuthModal />
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
