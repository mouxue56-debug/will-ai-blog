import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { ThemeProvider } from '@/components/shared/theme-provider';
import { SessionProvider } from '@/components/shared/session-provider';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { MobileNav } from '@/components/layout/mobile-nav';
import { ScrollToTop } from '@/components/shared/ScrollToTop';
import { AIChatWidget } from '@/components/shared/AIChatWidget';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const localeDescriptions: Record<string, string> = {
  zh: 'AI × 猫舎 × 大阪生活 — 一个AI实践者的真实记录',
  ja: '大阪在住のAI実践者Willのブログ。AI活用の実例、猫舎経営、ビジネス加速の記録。',
  en: "Will's AI practice blog from Osaka. Real-world AI use cases, cattery management, and business acceleration.",
};

const localeOg: Record<string, string> = {
  zh: 'zh_CN',
  ja: 'ja_JP',
  en: 'en_US',
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const description = localeDescriptions[locale] || localeDescriptions.zh;
  const ogLocale = localeOg[locale] || 'zh_CN';
  const alternateOgLocales = Object.entries(localeOg)
    .filter(([k]) => k !== locale)
    .map(([, v]) => v);

  return {
    title: {
      default: "Will's AI Blog",
      template: "%s | Will's AI Blog",
    },
    description,
    metadataBase: new URL('https://aiblog.fuluckai.com'),
    openGraph: {
      type: 'website',
      siteName: "Will's AI Blog",
      locale: ogLocale,
      alternateLocale: alternateOgLocales,
      images: [{ url: '/og-image.png', width: 1200, height: 630 }],
      description,
    },
    twitter: {
      card: 'summary_large_image',
      creator: '@will_fuluckai',
      description,
    },
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: `https://aiblog.fuluckai.com/${locale}`,
      languages: {
        zh: 'https://aiblog.fuluckai.com/zh',
        ja: 'https://aiblog.fuluckai.com/ja',
        en: 'https://aiblog.fuluckai.com/en',
      },
    },
  };
}

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
  const description = localeDescriptions[locale] || localeDescriptions.zh;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: "Will's AI Blog",
    url: 'https://aiblog.fuluckai.com',
    description,
    author: {
      '@type': 'Person',
      name: 'Will',
    },
    inLanguage: ['zh', 'ja', 'en'],
  };

  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <div
          className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
        >
          <SessionProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
            >
              <NextIntlClientProvider messages={messages}>
                <Header />
                <main className="flex-1 pt-8 md:pt-0 pb-16 md:pb-0">
                  {children}
                </main>
                <Footer />
                <MobileNav />
                <ScrollToTop />
                <AIChatWidget />
              </NextIntlClientProvider>
            </ThemeProvider>
          </SessionProvider>
        </div>
      </body>
    </html>
  );
}
