import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { Inter } from 'next/font/google';
import QueryProvider from '@/components/providers/QueryProvider';

import './globals.css';

const geistInter = Inter({
  variable: '--font-geist-inter',
  display: 'swap',
  subsets: ['latin'],
});

const cruinn = localFont({
  src: [
    // Убрали 100 и 300. Оставили самые ходовые.
    { path: '../fonts/Cruinn Regular.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/Cruinn Medium.woff2', weight: '500', style: 'normal' },
    { path: '../fonts/Cruinn Bold.woff2', weight: '700', style: 'normal' },
    { path: '../fonts/Cruinn Black.woff2', weight: '900', style: 'normal' },
  ],
  variable: '--font-cruinn',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    template: '%s | iMenu',
    default: 'iMenu — Ваше электронное меню',
  },
  description:
    'Удобное электронное меню для ресторанов и кафе. Заказ еды, бронирование и оплата по QR-коду.',
  metadataBase: new URL('https://imenu.kg'),
  icons: {
    icon: '/favicon.svg',
  },
  openGraph: {
    title: 'iMenu — Ваше электронное меню',
    description: 'Современный сервис для заказа еды в заведениях.',
    url: 'https://imenu.kg',
    siteName: 'iMenu.kg',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'ru_RU',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='ru'>
      <body
        className={`${cruinn.variable} ${geistInter.variable} max-w-175 mx-auto antialiased`}
      >
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
