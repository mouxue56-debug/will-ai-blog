'use client';

import { PageTransition } from '@/components/shared/PageTransition';
import { ScrollReveal } from '@/components/shared/ScrollReveal';
import { HeroSection } from '@/components/home/hero-section';
import { StoryTimeline } from '@/components/home/StoryTimeline';
import { LatestUpdates } from '@/components/home/LatestUpdates';
import { MyWorld } from '@/components/home/MyWorld';
import { AIDashboard } from '@/components/home/ai-dashboard';

export default function HomePage() {
  return (
    <PageTransition>
      <div className="w-full">
        {/* Hero */}
        <div className="mx-auto max-w-5xl">
          <HeroSection />
        </div>

        {/* My Story — Timeline */}
        <ScrollReveal direction="fadeUp">
          <StoryTimeline />
        </ScrollReveal>

        {/* Latest Updates — Blog + News tabs */}
        <LatestUpdates />

        {/* My World — SNS + Cattery */}
        <ScrollReveal direction="fadeUp" delay={0.05}>
          <MyWorld />
        </ScrollReveal>

        {/* AI Dashboard */}
        <ScrollReveal direction="scaleIn">
          <AIDashboard />
        </ScrollReveal>
      </div>
    </PageTransition>
  );
}
