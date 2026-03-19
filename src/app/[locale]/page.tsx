'use client';

import { PageTransition } from '@/components/shared/PageTransition';
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
        <FeedSection />

        {/* SNS Cards */}
        <SNSSection />

        {/* AI Dashboard */}
        <AIDashboard />

        {/* Powered By Banner */}
        <PoweredBanner />
      </div>
    </PageTransition>
  );
}
