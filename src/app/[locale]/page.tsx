import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { PageTransition } from '@/components/shared/PageTransition';
import { ScrollReveal } from '@/components/shared/ScrollReveal';
import { HeroSection } from '@/components/home/hero-section';
import { StoryTimeline } from '@/components/home/StoryTimeline';
import { LatestUpdates } from '@/components/home/LatestUpdates';
import { MyWorld } from '@/components/home/MyWorld';
import { AIDashboard } from '@/components/home/ai-dashboard';

const OG_LOCALE_MAP: Record<string, string> = {
  zh: 'zh_CN',
  ja: 'ja_JP',
  en: 'en_US',
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params;
  const navT = await getTranslations({ locale, namespace: 'nav' });
  const homeT = await getTranslations({ locale, namespace: 'home' });
  const title = `Will AI Blog | ${navT('blog')} | ${navT('timeline')} | ${navT('about')}`;
  const description = `${homeT('hero_subtitle')} | ${navT('blog')} | ${navT('timeline')} | ${navT('about')}`;
  const ogLocale = OG_LOCALE_MAP[locale] || OG_LOCALE_MAP.zh;
  const url = `https://aiblog.fuluckai.com/${locale}`;

  return {
    title,
    description,
    keywords: [navT('blog'), navT('timeline'), navT('about'), 'Will AI Blog'],
    openGraph: {
      type: 'website',
      title,
      description,
      locale: ogLocale,
      url,
      siteName: "Will's AI Blog",
      images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      site: '@fuluckai',
      images: ['/og-image.png'],
    },
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params;
  const navT = await getTranslations({ locale, namespace: 'nav' });
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: "Will's AI Blog",
    url: 'https://aiblog.fuluckai.com',
    siteSearch: 'https://aiblog.fuluckai.com/blog',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://aiblog.fuluckai.com/blog',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <pre className="sr-only" aria-hidden="true">{`${navT('blog')}\n${navT('timeline')}\n${navT('about')}\n${navT('blog')}\n${navT('timeline')}\n${navT('about')}`}</pre>
      <PageTransition>
        <div className="w-full">
          <div className="mx-auto max-w-5xl">
          <HeroSection />
        </div>

        <ScrollReveal direction="fadeUp">
          <StoryTimeline />
        </ScrollReveal>

        <LatestUpdates />

        <ScrollReveal direction="fadeUp" delay={0.05}>
          <MyWorld />
        </ScrollReveal>

        <ScrollReveal direction="scaleIn">
          <AIDashboard />
        </ScrollReveal>
        </div>
      </PageTransition>
    </>
  );
}
