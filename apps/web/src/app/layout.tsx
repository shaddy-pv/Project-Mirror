import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/providers/auth-provider";
import { QueryProvider } from "@/providers/query-provider";
import { ReferralCapture } from "@/components/ReferralCapture";
import { SmoothScrollProvider } from "@/providers/smooth-scroll-provider";
import { Suspense } from "react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Enginow — Learn. Build. Belong.",
  description: "Enginow is a modern learning platform for engineers — courses, cohort training, internships, and careers designed by practitioners.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col selection:bg-[#15171C] selection:text-[#FFF9ED]">
        <QueryProvider>
          <AuthProvider>
            <SmoothScrollProvider>
              <Suspense fallback={null}>
                <ReferralCapture />
              </Suspense>
              {children}
            </SmoothScrollProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
