import { notFound } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { timelineData } from '@/data/timeline';
import { TimelinePageClient } from '@/components/timeline/TimelinePageClient';
import { Link } from '@/i18n/navigation';
import { ChevronRight } from 'lucide-react';

type Params = { locale: string; year: string };

export async function generateStaticParams() {
  const years = [...new Set(timelineData.map((e) => e.date.split('-')[0]))];
  const locales = ['zh', 'ja', 'en'];
  return locales.flatMap((locale) => years.map((year) => ({ locale, year })));
}

export default async function TimelineYearPage({ params }: { params: Promise<Params> }) {
  const { locale, year } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'timeline' });

  const events = timelineData.filter((e) => e.date.startsWith(year));
  if (events.length === 0) notFound();

  // Get months in this year
  const months = [...new Set(events.map((e) => e.date.split('-')[1]))].sort();

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-8">
        <Link href="/timeline" className="hover:text-foreground transition-colors">{t('title')}</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-foreground font-medium">{year}</span>
      </nav>

      <h1 className="text-2xl sm:text-3xl font-bold mb-2">{year}</h1>
      <p className="text-muted-foreground mb-8">
        {events.length} {t('events_count') || 'events'} · {months.length} {t('months_count') || 'months'}
      </p>

      {/* Month quick nav */}
      <div className="flex flex-wrap gap-2 mb-10">
        {months.map((m) => {
          const count = events.filter((e) => e.date.split('-')[1] === m).length;
          return (
            <Link
              key={m}
              href={`/timeline/${year}/${m}`}
              className="px-3 py-1.5 rounded-full glass-card text-sm hover:border-brand-mint/40 transition-all"
            >
              {parseInt(m)}{locale === 'ja' ? '月' : locale === 'en' ? '' : '月'}
              {locale === 'en' && ` (${count})`}
              {locale !== 'en' && `（${count}）`}
            </Link>
          );
        })}
      </div>

      <TimelinePageClient events={events} locale={locale as 'zh' | 'ja' | 'en'} />
    </div>
  );
}
