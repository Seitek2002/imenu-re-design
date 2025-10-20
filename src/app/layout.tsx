import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Inter } from "next/font/google";

import "./globals.css";
import QueryProvider from "./query-provider";

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
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
