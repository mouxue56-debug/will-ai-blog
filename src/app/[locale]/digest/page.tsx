import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getAllDigests } from '@/lib/digest';

type Locale = 'zh' | 'ja' | 'en';

function formatDate(date: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'digest' });

  return {
    title: t('title'),
    description: t('subtitle'),
    alternates: {
      languages: {
        zh: '/zh/digest',
        ja: '/ja/digest',
        en: '/en/digest',
      },
    },
  };
}

export default async function DigestPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'digest' });
  const lang = ((locale === 'zh' || locale === 'ja' || locale === 'en') ? locale : 'en') as Locale;
  const digests = getAllDigests();

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <div className="mb-10">
        <div className="inline-flex items-center rounded-full border border-brand-mint/20 bg-brand-mint/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-brand-mint">
          AI Digest
        </div>
        <h1 className="mt-4 text-3xl font-bold sm:text-4xl">{t('title')}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
          {t('subtitle')}
        </p>
      </div>

      {digests.length === 0 ? (
        <div className="glass-card py-20 text-center text-muted-foreground">{t('empty')}</div>
      ) : (
        <div className="space-y-6">
          {digests.map((item) => (
            <article
              key={item.slug}
              className="glass-card overflow-hidden border-white/[0.08] bg-card/80 p-5 shadow-[0_12px_40px_rgba(15,23,42,0.08)] transition-all duration-300 hover:border-brand-mint/30 hover:shadow-[0_20px_50px_rgba(45,212,191,0.10)] sm:p-6"
            >
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 dark:bg-white/[0.04]">
                  {formatDate(item.date, locale)}
                </span>
                {item.sources.map((source) => (
                  <span key={source} className="rounded-full border border-sky-500/20 bg-sky-500/10 px-2.5 py-1 text-sky-600 dark:text-sky-300">
                    {source}
                  </span>
                ))}
              </div>

              <h2 className="mt-4 text-xl font-semibold leading-snug sm:text-2xl">
                {item.title[lang]}
              </h2>

              <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">
                {item.summary}
              </p>

              <div className="mt-5 rounded-2xl border border-brand-mint/20 bg-gradient-to-br from-brand-mint/10 via-transparent to-brand-cyan/10 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-mint">
                  {t('willComment')}
                </div>
                <p className="mt-2 text-sm leading-7 text-foreground/90 sm:text-base">
                  {item.willComment[lang]}
                </p>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-muted-foreground dark:bg-white/[0.04]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
