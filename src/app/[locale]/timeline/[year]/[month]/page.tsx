import { notFound } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { timelineData } from '@/data/timeline';
import { TimelinePageClient } from '@/components/timeline/TimelinePageClient';
import { Link } from '@/i18n/navigation';
import { ChevronRight } from 'lucide-react';

type Params = { locale: string; year: string; month: string };

export async function generateStaticParams() {
  const pairs = [...new Set(timelineData.map((e) => {
    const [y, m] = e.date.split('-');
    return `${y}/${m}`;
  }))];
  const locales = ['zh', 'ja', 'en'];
  return locales.flatMap((locale) =>
    pairs.map((pair) => {
      const [year, month] = pair.split('/');
      return { locale, year, month };
    })
  );
}

const MONTH_NAMES: Record<string, Record<string, string>> = {
  zh: { '01':'1月','02':'2月','03':'3月','04':'4月','05':'5月','06':'6月','07':'7月','08':'8月','09':'9月','10':'10月','11':'11月','12':'12月' },
  ja: { '01':'1月','02':'2月','03':'3月','04':'4月','05':'5月','06':'6月','07':'7月','08':'8月','09':'9月','10':'10月','11':'11月','12':'12月' },
  en: { '01':'January','02':'February','03':'March','04':'April','05':'May','06':'June','07':'July','08':'August','09':'September','10':'October','11':'November','12':'December' },
};

export default async function TimelineMonthPage({ params }: { params: Promise<Params> }) {
  const { locale, year, month } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'timeline' });

  const events = timelineData.filter((e) => e.date.startsWith(`${year}-${month}`));
  if (events.length === 0) notFound();

  const monthName = MONTH_NAMES[locale]?.[month] ?? month;

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-8 flex-wrap">
        <Link href="/timeline" className="hover:text-foreground transition-colors">{t('title')}</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href={`/timeline/${year}`} className="hover:text-foreground transition-colors">{year}</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-foreground font-medium">{monthName}</span>
      </nav>

      <h1 className="text-2xl sm:text-3xl font-bold mb-2">{year} {monthName}</h1>
      <p className="text-muted-foreground mb-8">
        {events.length} {t('events_count') || 'events'}
      </p>

      <TimelinePageClient events={events} locale={locale as 'zh' | 'ja' | 'en'} />
    </div>
  );
}
