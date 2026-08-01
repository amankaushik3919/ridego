import type { Metadata, Viewport } from "next";
import Script from "next/script";
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

const SITE_NAME = "RideGo";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://ridego.in";
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#6750a4",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — E-Rickshaw Seat Booking`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Book a seat on shared e-rickshaws in real time. Find nearby e-rickshaws, live-track your ride, and travel smart with RideGo.",
  applicationName: SITE_NAME,
  keywords: [
    "e-rickshaw",
    "rickshaw booking",
    "shared auto",
    "seat booking",
    "RideGo",
    "last mile connectivity",
  ],
  authors: [{ name: SITE_NAME }],
  openGraph: {
    type: "website",
    url: SITE_URL,
    title: `${SITE_NAME} — E-Rickshaw Seat Booking`,
    description:
      "Book a seat on shared e-rickshaws in real time. Live-track your ride with RideGo.",
    siteName: SITE_NAME,
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — E-Rickshaw Seat Booking`,
    description:
      "Book a seat on shared e-rickshaws in real time. Live-track your ride with RideGo.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
  manifest: "/manifest.webmanifest",
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

        {GA_ID ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}', {
                  page_path: window.location.pathname,
                });
              `}
            </Script>
          </>
        ) : null}
      </body>
    </html>
  );
}
