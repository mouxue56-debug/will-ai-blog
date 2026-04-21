import { setRequestLocale, getTranslations } from 'next-intl/server';
import { PageTransition } from '@/components/shared/PageTransition';
import { ScrollReveal } from '@/components/shared/ScrollReveal';
import { TimelineYearIndexClient } from '@/components/timeline/TimelineYearIndexClient';
import { Link } from '@/i18n/navigation';
import { TodayFeedTeaser } from '@/components/home/TodayFeedTeaser';

export default async function TimelinePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'timeline' });

  return (
    <PageTransition>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12 sm:py-16">
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-8">
          <Link href="/timeline" className="hover:text-foreground transition-colors">
            {t('title')}
          </Link>
        </nav>

        <ScrollReveal direction="fadeUp" className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">{t('title')}</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">{t('subtitle')}</p>
        </ScrollReveal>

        <TodayFeedTeaser locale={(locale as 'zh' | 'ja' | 'en') || 'zh'} />

        <TimelineYearIndexClient />
      </div>
    </PageTransition>
  );
}
