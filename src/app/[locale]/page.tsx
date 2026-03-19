'use client';

import { PageTransition } from '@/components/shared/PageTransition';
import { ScrollReveal } from '@/components/shared/ScrollReveal';
import { HeroSection } from '@/components/home/hero-section';
import { FeedSection } from '@/components/home/feed-section';
import { SNSSection } from '@/components/home/sns-section';
import { AIDashboard } from '@/components/home/ai-dashboard';
import { PoweredBanner } from '@/components/home/powered-banner';

export default function HomePage() {
  return (
    <PageTransition>
      <div className="w-full">
        {/* Hero */}
        <div className="mx-auto max-w-5xl">
          <HeroSection />
        </div>

        {/* Latest Feed - full width for horizontal scroll */}
        <ScrollReveal direction="fadeUp">
          <FeedSection />
        </ScrollReveal>

        {/* SNS Cards */}
        <ScrollReveal direction="fadeUp" delay={0.1}>
          <SNSSection />
        </ScrollReveal>

        {/* AI Dashboard */}
        <ScrollReveal direction="scaleIn">
          <AIDashboard />
        </ScrollReveal>

        {/* Powered By Banner */}
        <ScrollReveal direction="fadeIn" delay={0.15}>
          <PoweredBanner />
        </ScrollReveal>
      </div>
    </PageTransition>
  );
}
