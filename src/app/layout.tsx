import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthHydration } from "@/components/shared/auth-hydration";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ride Connect",
  description: "Real-time e-rickshaw seat booking platform",
};

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
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@100..700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <AuthHydration />
        <Toaster position="top-center" richColors />
        {children}
      </body>
    </html>
  );
}
