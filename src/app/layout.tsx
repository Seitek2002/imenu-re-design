import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Inter } from "next/font/google";

import "./globals.css";
import "./shake.css";
import QueryProvider from "./query-provider";
import Script from "next/script";
import FacebookPixelTracker from "../lib/analytics/FacebookPixel";

const geistInter = Inter({
  variable: "--font-geist-inter",
  subsets: ["latin"],
});

const cruinn = localFont({
  src: [
    { path: "../fonts/Cruinn Thin.ttf", weight: "100", style: "normal" },
    { path: "../fonts/Cruinn Light.ttf", weight: "300", style: "normal" },
    { path: "../fonts/Cruinn Regular.ttf", weight: "400", style: "normal" },
    { path: "../fonts/Cruinn Medium.ttf", weight: "500", style: "normal" },
    { path: "../fonts/Cruinn Bold.ttf", weight: "700", style: "normal" },
    { path: "../fonts/Cruinn Black.ttf", weight: "900", style: "normal" },
  ],
  variable: "--font-cruinn",
  display: "swap",
})

export const metadata: Metadata = {
  title: 'iMenu.kg - ваше электронное меню!',
  description: 'iMenu.kg — ваше электронное меню!',
  icons: {
    icon: '/favicon.svg',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID || '24957245993913886';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${cruinn.variable} ${geistInter.variable} antialiased`}
      >
        <Script id="fb-pixel" strategy="afterInteractive">{`
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${FB_PIXEL_ID}');
fbq('track', 'PageView');
`}</Script>
        <noscript
          dangerouslySetInnerHTML={{
            __html: `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${FB_PIXEL_ID}&ev=PageView&noscript=1" />`,
          }}
        />
        <FacebookPixelTracker />
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
