import { PageTransition } from '@/components/shared/PageTransition';
import { Link } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';

export default async function CatteryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'cattery' });

  const dailyPosts = [1, 2, 3] as const;
  const highlights = [1, 2, 3] as const;

  return (
    <PageTransition>
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <section className="relative overflow-hidden rounded-[2rem] border border-border/40 bg-gradient-to-br from-brand-mint/10 via-background to-brand-cyan/10 p-8 shadow-sm sm:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.12),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(74,222,128,0.12),transparent_35%)]" />
          <div className="relative grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div className="space-y-4">
              <div className="inline-flex rounded-full border border-brand-mint/30 bg-brand-mint/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-brand-mint">
                {t('title')}
              </div>
              <div className="space-y-3">
                <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">{t('headline')}</h1>
                <p className="text-base text-muted-foreground sm:text-lg">{t('subtitle')}</p>
                <p className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
                  {t('intro_body')}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <a
                  href="https://fuluck-cattery.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-full bg-brand-mint px-5 py-2.5 text-sm font-semibold text-slate-950 transition-opacity hover:opacity-90"
                >
                  {t('cta_line')}
                </a>
                <Link
                  href="/timeline"
                  className="inline-flex items-center justify-center rounded-full border border-border/60 px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-brand-mint/40 hover:text-brand-mint"
                >
                  {t('cta_timeline')}
                </Link>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {highlights.map((item) => (
                <div key={item} className="rounded-2xl border border-border/40 bg-background/80 p-4 backdrop-blur">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-cyan">
                    {t(`highlight_${item}_label`)}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {t(`highlight_${item}_body`)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-12">
          <div className="mb-6 space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">{t('daily_title')}</h2>
            <p className="text-sm text-muted-foreground sm:text-base">{t('daily_intro')}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {dailyPosts.map((item) => (
              <article key={item} className="rounded-[1.5rem] border border-border/40 bg-card/70 p-5 shadow-sm backdrop-blur">
                <div className="mb-4 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="rounded-full bg-brand-mint/10 px-2.5 py-1 font-medium text-brand-mint">{t(`post_${item}_tag`)}</span>
                  <span>{t(`post_${item}_date`)}</span>
                </div>
                <h3 className="text-lg font-semibold">{t(`post_${item}_title`)}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{t(`post_${item}_body`)}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-12 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[1.75rem] border border-border/40 bg-card/70 p-6 shadow-sm backdrop-blur sm:p-7">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">{t('siberian_title')}</h2>
              <p className="text-sm text-muted-foreground sm:text-base">{t('siberian_intro')}</p>
            </div>
            <div className="mt-6 space-y-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="rounded-2xl border border-border/30 bg-background/70 p-4">
                  <p className="text-sm font-semibold text-foreground">{t(`info_${item}_title`)}</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{t(`info_${item}_body`)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-brand-mint/30 bg-gradient-to-br from-brand-mint/10 via-background to-brand-cyan/10 p-6 shadow-sm sm:p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-mint">{t('contact_kicker')}</p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight">{t('contact_title')}</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">{t('contact_body')}</p>
            <div className="mt-6 space-y-3 text-sm text-muted-foreground">
              <p>{t('contact_line_note')}</p>
              <p>{t('contact_instagram_note')}</p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="https://fuluck-cattery.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full bg-brand-mint px-5 py-2.5 text-sm font-semibold text-slate-950 transition-opacity hover:opacity-90"
              >
                {t('contact_cta')}
              </a>
              <a
                href="https://www.instagram.com/fuluck_cattery/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full border border-border/60 px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-brand-mint/40 hover:text-brand-mint"
              >
                {t('contact_secondary_cta')}
              </a>
            </div>
          </div>
        </section>
      </div>
    </PageTransition>
  );
}
