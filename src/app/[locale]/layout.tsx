import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { ThemeProvider } from '@/components/shared/theme-provider';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { MobileNav } from '@/components/layout/mobile-nav';
import { ScrollToTop } from '@/components/shared/ScrollToTop';
import '../globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: "Will's AI Blog",
    template: "%s | Will's AI Blog",
  },
  description: 'AI × 猫舎 × 大阪生活 — 一个AI实践者的真实记录',
  metadataBase: new URL('https://aiblog.fuluckai.com'),
  openGraph: {
    type: 'website',
    siteName: "Will's AI Blog",
    locale: 'zh_CN',
    alternateLocale: ['ja_JP', 'en_US'],
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@will_fuluckai',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://aiblog.fuluckai.com',
  },
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = await getMessages();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: "Will's AI Blog",
    url: 'https://aiblog.fuluckai.com',
    description: 'AI × 猫舎 × 大阪生活 — 一个AI实践者的真实记录',
    author: {
      '@type': 'Person',
      name: 'Will',
    },
    inLanguage: ['zh', 'ja', 'en'],
  };

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
        >
          <NextIntlClientProvider messages={messages}>
            <Header />
            <main className="flex-1 pt-0 pb-16 md:pb-0">
              {children}
            </main>
            <Footer />
            <MobileNav />
            <ScrollToTop />
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
