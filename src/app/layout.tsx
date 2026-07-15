import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages, getTranslations } from 'next-intl/server';
import QueryProvider from '@/components/providers/QueryProvider';
import AuthProvider from '@/components/providers/AuthProvider';

import './globals.css';

const geistInter = Inter({
  variable: '--font-geist-inter',
  display: 'swap',
  // cyrillic обязателен: без него весь русский текст падал на системный
  // sans-serif, а в Inter рендерились только цифры/латиница — гарнитуры
  // визуально расходились (см. дизайн Figma 402:591, весь в Inter).
  subsets: ['latin', 'cyrillic'],
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

const OG_LOCALE: Record<string, string> = {
  ru: 'ru_RU',
  ky: 'ky_KG',
  en: 'en_US',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: 'Meta' });

  return {
    title: {
      template: '%s | iMenu',
      default: t('appTitle'),
    },
    description: t('appDescription'),
    metadataBase: new URL('https://imenu.kg'),
    icons: {
      icon: '/favicon.svg',
    },
    openGraph: {
      title: t('ogTitle'),
      description: t('ogDescription'),
      url: 'https://imenu.kg',
      siteName: 'iMenu.kg',
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
        },
      ],
      locale: OG_LOCALE[locale] ?? 'ru_RU',
      type: 'website',
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${cruinn.variable} ${geistInter.variable}`}
    >
      <body className='antialiased'>
        {/* Блокируем pinch-zoom на iOS Safari — touch-action и viewport user-scalable=no
            там игнорируются. Внешний файл + beforeInteractive вместо inline-скрипта —
            тот же момент выполнения (до гидратации), но без dangerouslySetInnerHTML,
            так что не требует 'unsafe-inline' в CSP script-src. */}
        <Script src='/pinch-zoom-guard.js' strategy='beforeInteractive' />
        <NextIntlClientProvider messages={messages}>
          <QueryProvider>
            <AuthProvider>{children}</AuthProvider>
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
