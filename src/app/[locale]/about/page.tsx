'use client';

import { PageTransition } from '@/components/shared/PageTransition';
import { AboutSections } from '@/components/about/about-sections';

export default function AboutPage() {
  return (
    <PageTransition>
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12 sm:py-16">
        <AboutSections />
      </div>
    </PageTransition>
  );
}
