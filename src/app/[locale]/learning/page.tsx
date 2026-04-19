import type { Metadata } from 'next';
import { getAllPosts } from '@/lib/blog';
import { getTranslations } from 'next-intl/server';
import { setRequestLocale } from 'next-intl/server';
import { BookOpen } from 'lucide-react';
import Image from 'next/image';
import { getIllustrationUrl } from '@/lib/storage';
import { LearningIndex } from '@/components/learning/LearningIndex';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'learning' });
  const title = t('page_title');
  const description = t('page_desc');

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
    },
    alternates: {
      languages: {
        zh: '/zh/learning',
        ja: '/ja/learning',
        en: '/en/learning',
      },
    },
  };
}

export default async function LearningPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'learning' });
  const allPosts = getAllPosts();
  const learningPosts = allPosts.filter((post) => post.category === 'learning');

  return (
    <main className="min-h-screen" style={{ background: '#080F18' }}>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fadeInUp 0.6s ease forwards; }
        .animate-fade-in-up-delay-1 { animation: fadeInUp 0.6s 0.1s ease both; }
        .animate-fade-in-up-delay-2 { animation: fadeInUp 0.6s 0.2s ease both; }
        .animate-fade-in-up-card-0 { animation: fadeInUp 0.5s 0.3s ease both; }
        .animate-fade-in-up-card-1 { animation: fadeInUp 0.5s 0.4s ease both; }
        .animate-fade-in-up-card-2 { animation: fadeInUp 0.5s 0.5s ease both; }
        .animate-fade-in-up-card-3 { animation: fadeInUp 0.5s 0.6s ease both; }
        .animate-fade-in-up-card-4 { animation: fadeInUp 0.5s 0.7s ease both; }
        .animate-fade-in-up-card-5 { animation: fadeInUp 0.5s 0.8s ease both; }
        .animate-fade-in-up-card-6 { animation: fadeInUp 0.5s 0.9s ease both; }
        .animate-fade-in-up-card-7 { animation: fadeInUp 0.5s 1.0s ease both; }
        .animate-fade-in-up-card-8 { animation: fadeInUp 0.5s 1.1s ease both; }
        .animate-fade-in-up-card-9 { animation: fadeInUp 0.5s 1.2s ease both; }
        .k2w-card:hover {
          border-color: rgba(0,212,255,0.35) !important;
          box-shadow: 0 0 24px rgba(0,212,255,0.08), 0 4px 20px rgba(0,0,0,0.4);
        }
      `}</style>
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-16 px-4">
        {/* Banner 插画 */}
        <div className="mx-auto max-w-4xl mb-8">
          <div className="glass-card relative h-44 sm:h-52 w-full overflow-hidden rounded-3xl">
            <Image
              src={getIllustrationUrl('learning-banner')}
              alt=""
              fill
              className="object-cover object-center opacity-55 dark:opacity-70"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-[rgba(255,209,220,0.5)] via-[rgba(232,213,245,0.35)] to-[rgba(200,245,228,0.35)] dark:hidden" />
            <div className="absolute inset-0 bg-gradient-to-r from-background/85 via-background/45 to-transparent dark:from-[#080F18]/90 dark:via-[#080F18]/50" />
            <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-10">
              <span className="mb-2 inline-flex w-fit items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-medium text-cyan-400 tracking-wide uppercase">
                <BookOpen className="h-3.5 w-3.5" />
                Learning Notes
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold"
                style={{background:'linear-gradient(135deg,#00D4FF 0%,#5EF0C8 50%,#00A8E8 100%)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>
                {t('title')}
              </h1>
              <p className="mt-1 max-w-lg text-sm text-slate-400">{t('subtitle')}</p>
            </div>
          </div>
        </div>

        {/* Background glow */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{background:'radial-gradient(ellipse 80% 40% at 50% 0%, rgba(0,212,255,0.06) 0%, transparent 70%)'}}
        />

        <div className="relative mx-auto max-w-4xl text-center">
          {/* Stats bar */}
          {learningPosts.length > 0 && (
            <div className="mt-8 flex items-center justify-center gap-6">
              <div className="flex items-center gap-1.5 text-sm text-slate-500">
                <BookOpen className="h-4 w-4 text-cyan-500/70" />
                <span>
                  {learningPosts.length} 篇笔记
                </span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Divider */}
      <div
        className="mx-auto max-w-4xl px-4"
        style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.2), transparent)' }}
      />

      {/* Posts Grid with sub-menu filter */}
      <section className="py-12">
        {learningPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div
              className="mb-6 flex h-20 w-20 items-center justify-center rounded-full"
              style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.15)' }}
            >
              <BookOpen className="h-9 w-9 text-cyan-500/50" />
            </div>
            <p className="text-lg font-medium text-slate-400">{t('no_posts')}</p>
          </div>
        ) : (
          <LearningIndex
            locale={locale as 'zh' | 'ja' | 'en'}
            minReadLabel={t('min_read')}
            posts={learningPosts.map((p) => ({
              slug: p.slug,
              title: typeof p.title === 'string'
                ? { zh: p.title, ja: p.title, en: p.title }
                : (p.title as Record<string, string>),
              excerpt: typeof p.excerpt === 'string'
                ? { zh: p.excerpt, ja: p.excerpt, en: p.excerpt }
                : (p.excerpt as Record<string, string>),
              date: p.date,
              readingTime: p.readingTime,
              tags: p.tags ?? [],
            }))}
          />
        )}
      </section>
    </main>
  );
}
