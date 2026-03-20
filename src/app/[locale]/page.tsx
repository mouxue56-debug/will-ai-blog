import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { PageTransition } from '@/components/shared/PageTransition';
import { ScrollReveal } from '@/components/shared/ScrollReveal';
import { HeroSection } from '@/components/home/hero-section';
import { StoryTimeline } from '@/components/home/StoryTimeline';
import { LatestUpdates } from '@/components/home/LatestUpdates';
import { MyWorld } from '@/components/home/MyWorld';
import { AIDashboard } from '@/components/home/ai-dashboard';

export async function generateMetadata(): Promise<Metadata> {
  const navT = await getTranslations('nav');
  const homeT = await getTranslations('home');
  const title = `Will AI Blog | ${navT('blog')} | ${navT('timeline')} | ${navT('about')}`;
  const description = `${homeT('hero_subtitle')} | ${navT('blog')} | ${navT('timeline')} | ${navT('about')}`;

  return {
    title,
    description,
    keywords: [navT('blog'), navT('timeline'), navT('about'), 'Will AI Blog'],
    openGraph: {
      title,
      description,
    },
    twitter: {
      title,
      description,
    },
  };
}

export default async function HomePage() {
  const navT = await getTranslations('nav');

  return (
    <>
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
