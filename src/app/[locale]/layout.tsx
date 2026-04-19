import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { ThemeProvider } from '@/components/shared/theme-provider';
import { SessionProvider } from '@/components/shared/session-provider';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { MobileNav } from '@/components/layout/mobile-nav';
import { ScrollToTop } from '@/components/shared/ScrollToTop';
import { AIChatWidget } from '@/components/shared/AIChatWidget';
import { Analytics } from '@/components/shared/analytics';
import { PageTransition } from '@/components/shared/PageTransition';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const localeDescriptions: Record<string, string> = {
  zh: 'Will 的 AI 实践博客 — 多实例架构、提示词工程、大阪生活日记',
  ja: 'WillのAI実践ブログ — マルチインスタンス設計、プロンプト工学、大阪での日常',
  en: "Will's AI Practice Blog — multi-instance architecture, prompt engineering, life in Osaka",
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
      images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
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
        'zh-CN': 'https://aiblog.fuluckai.com/zh',
        ja: 'https://aiblog.fuluckai.com/ja',
        en: 'https://aiblog.fuluckai.com/en',
        'x-default': 'https://aiblog.fuluckai.com/zh',
      },
    },
    other: {
      'geo.region': 'JP-27',
      'geo.placename': '大阪',
      'geo.position': '34.6937;135.5023',
      'ICBM': '34.6937, 135.5023',
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

  setRequestLocale(locale);

  const messages = await getMessages();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': 'https://aiblog.fuluckai.com/#will',
        name: 'Will (羅方遠)',
        alternateName: ['落雪', 'konayuki56'],
        url: 'https://aiblog.fuluckai.com',
        sameAs: [
          'https://github.com/konayuki56',
          'https://www.instagram.com/fuluck_cattery/',
          'https://aiblog.fuluckai.com/about',
        ],
        jobTitle: 'AI Practitioner & Cattery Owner',
        description:
          'AI practitioner based in Osaka, Japan. Running a Siberian cat cattery and building multi-AI systems.',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Osaka',
          addressCountry: 'JP',
        },
      },
      {
        '@type': 'WebSite',
        '@id': 'https://aiblog.fuluckai.com/#website',
        url: 'https://aiblog.fuluckai.com',
        name: "Will's AI Blog",
        description:
          'AI practitioner blog — tools, architecture, prompt engineering, daily life in Osaka',
        inLanguage: ['zh-CN', 'ja', 'en'],
        author: { '@id': 'https://aiblog.fuluckai.com/#will' },
      },
    ],
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
              storageKey="theme"
            >
              <NextIntlClientProvider messages={messages}>
                <Header />
                <main className="flex-1 pt-8 md:pt-0 pb-16 md:pb-0">
                  <PageTransition>
                    {children}
                  </PageTransition>
                </main>
                <Footer />
                <MobileNav />
                <ScrollToTop />
                <AIChatWidget />
                <Analytics />
              </NextIntlClientProvider>
            </ThemeProvider>
          </SessionProvider>
        </div>
      </body>
    </html>
  );
}
