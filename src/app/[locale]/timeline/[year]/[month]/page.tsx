import { notFound } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { PageTransition } from '@/components/shared/PageTransition';
import { ScrollReveal } from '@/components/shared/ScrollReveal';
import { timelineData } from '@/data/timeline';
import { TimelinePageClient } from '@/components/timeline/TimelinePageClient';
import { Link } from '@/i18n/navigation';
import { ChevronRight } from 'lucide-react';

type Params = { locale: string; year: string; month: string };

export async function generateStaticParams() {
  const pairs = [...new Set(timelineData.map((entry) => {
    const [year, month] = entry.date.split('-');
    return `${year}/${month}`;
  }))];
  const locales = ['zh', 'ja', 'en'];

  return locales.flatMap((locale) =>
    pairs.map((pair) => {
      const [year, month] = pair.split('/');
      return { locale, year, month };
    })
  );
}

export default async function TimelineMonthPage({ params }: { params: Promise<Params> }) {
  const { locale, year, month } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'timeline' });

  const events = timelineData.filter((entry) => entry.date.startsWith(`${year}-${month}`));
  if (events.length === 0) {
    notFound();
  }

  const monthName = t(`monthNames.${String(Number(month))}`);

  return (
    <PageTransition>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12 sm:py-16">
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-8 flex-wrap">
          <Link href="/timeline" className="hover:text-foreground transition-colors">
            {t('title')}
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href={`/timeline/${year}` as `/${string}`} className="hover:text-foreground transition-colors">
            {year}
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-foreground font-medium">{month}</span>
        </nav>

        <ScrollReveal direction="fadeUp" className="mb-10">
          <h1
            className="text-3xl sm:text-4xl font-bold mb-3"
            style={{
              background: 'linear-gradient(135deg, #5eead4, #22d3ee, #c084fc)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {t('monthView', { year, month: monthName })}
          </h1>
          <p className="text-muted-foreground">{events.length} {t('events_count')}</p>
        </ScrollReveal>

        <TimelinePageClient events={events} locale={locale as 'zh' | 'ja' | 'en'} />
      </div>
    </PageTransition>
  );
}
