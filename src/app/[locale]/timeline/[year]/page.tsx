import { notFound } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { PageTransition } from '@/components/shared/PageTransition';
import { ScrollReveal } from '@/components/shared/ScrollReveal';
import { Link } from '@/i18n/navigation';
import { ChevronRight } from 'lucide-react';
import { getYears, getEventsByYear } from '@/lib/timeline-data';

type Params = { locale: string; year: string };

export async function generateStaticParams() {
  const years = getYears().map(String);
  const locales = ['zh', 'ja', 'en'];
  return locales.flatMap((locale) => years.map((year) => ({ locale, year })));
}

export default async function TimelineYearPage({ params }: { params: Promise<Params> }) {
  const { locale, year } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'timeline' });

  const events = getEventsByYear(Number(year)).sort((a, b) => b.date.localeCompare(a.date));
  if (events.length === 0) {
    notFound();
  }

  const monthGroups = new Map<string, typeof events>();
  events.forEach((entry) => {
    const month = entry.date.split('-')[1];
    const current = monthGroups.get(month) ?? [];
    current.push(entry);
    monthGroups.set(month, current);
  });

  return (
    <PageTransition>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12 sm:py-16">
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-8">
          <Link href="/timeline" className="hover:text-foreground transition-colors">
            {t('title')}
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-foreground font-medium">{year}</span>
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
            {t('yearView', { year })}
          </h1>
          <p className="text-muted-foreground">
            {events.length} {t('events_count')} · {monthGroups.size} {t('months_count')}
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 12 }, (_, index) => {
            const monthNumber = String(index + 1);
            const paddedMonth = monthNumber.padStart(2, '0');
            const monthEvents = monthGroups.get(paddedMonth) ?? [];
            const hasData = monthEvents.length > 0;
            const monthName = t(`monthNames.${monthNumber}`);
            const content = (
              <div
                className={[
                  'glass-card p-4 sm:p-5 transition-all duration-200 h-full',
                  hasData ? 'shadow-sm hover:shadow-md hover:scale-[1.02]' : 'opacity-40',
                ].join(' ')}
              >
                <h2
                  className="text-xl sm:text-2xl font-bold mb-2"
                  style={hasData ? {
                    background: 'linear-gradient(135deg, #5eead4, #22d3ee)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  } : undefined}
                >
                  {monthName}
                </h2>

                {hasData ? (
                  <>
                    <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
                      <span>{monthEvents.length} {t('events_count')}</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-snug line-clamp-2">
                      {monthEvents[0]?.title[locale as 'zh' | 'ja' | 'en']}
                    </p>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground/60">{t('noEvents')}</p>
                )}
              </div>
            );

            if (!hasData) {
              return <div key={paddedMonth}>{content}</div>;
            }

            return (
              <Link key={paddedMonth} href={`/timeline/${year}/${paddedMonth}` as `/${string}`} className="block group">
                {content}
              </Link>
            );
          })}
        </div>
      </div>
    </PageTransition>
  );
}
