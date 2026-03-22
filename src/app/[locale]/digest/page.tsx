import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { supabaseAdmin } from '@/lib/supabase';
import { DigestClient } from './DigestClient';

export const runtime = 'nodejs';

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
  };
}

interface DailyReport {
  id: string;
  author_id: string;
  author_name: string;
  author_emoji: string;
  title: string;
  content: string;
  report_type: string;
  slug: string;
  topic_type: string;
  published_at: string;
}

async function getLatestDigest(): Promise<{
  date: string;
  session: string;
  reports: DailyReport[];
}> {
  // 获取最新的一期（按 published_at 倒序，取第一条的日期和session）
  const { data: latestReport } = await supabaseAdmin
    .from('daily_reports')
    .select('published_at, report_type, slug')
    .order('published_at', { ascending: false })
    .limit(1)
    .single();

  if (!latestReport) {
    return { date: '', session: '', reports: [] };
  }

  // 从 slug 解析日期和 session
  const slugParts = latestReport.slug.split('-');
  const date = slugParts.slice(0, 3).join('-');
  const session = slugParts[3] || latestReport.report_type;

  // 获取这一期的所有报告
  const { data: reports } = await supabaseAdmin
    .from('daily_reports')
    .select('*')
    .like('slug', `${date}-${session}-%`)
    .order('topic_type', { ascending: true });

  return {
    date,
    session,
    reports: reports || [],
  };
}

export default async function DigestPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'digest' });
  const { date, session, reports } = await getLatestDigest();

  return (
    <div className="min-h-screen" style={{ background: '#0D1825' }}>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-10">
          <h1 
            className="text-2xl sm:text-3xl font-bold mb-3"
            style={{ color: '#00D4FF' }}
          >
            {t('title')}
          </h1>
          <p className="text-base" style={{ color: 'rgba(232,244,248,0.7)' }}>
            {t('subtitle')}
          </p>
          {date && (
            <div 
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm"
              style={{ 
                background: 'rgba(0,212,255,0.1)', 
                border: '1px solid rgba(0,212,255,0.2)',
                color: '#00D4FF'
              }}
            >
              <span>{date}</span>
              <span style={{ color: 'rgba(0,212,255,0.5)' }}>·</span>
              <span>{session === 'morning' ? t('morning') : t('evening')}</span>
            </div>
          )}
        </div>

        {/* Topic Cards */}
        {reports.length === 0 ? (
          <div 
            className="rounded-2xl p-12 text-center"
            style={{ 
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)'
            }}
          >
            <p style={{ color: 'rgba(232,244,248,0.5)' }}>{t('empty')}</p>
          </div>
        ) : (
          <div className="space-y-8">
            {reports.map((report) => (
              <TopicCard key={report.id} report={report} locale={locale} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TopicCard({ 
  report, 
  locale 
}: { 
  report: DailyReport; 
  locale: string;
}) {
  const topicColors: Record<string, { icon: string; accent: string }> = {
    ai: { icon: '📡', accent: '#00D4FF' },
    economy: { icon: '💹', accent: '#FF8C42' },
    github: { icon: '🔥', accent: '#00D4FF' },
  };

  const colors = topicColors[report.topic_type] || { icon: '📰', accent: '#00D4FF' };

  return (
    <article 
      className="rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.01]"
      style={{ 
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {/* Card Header */}
      <div 
        className="px-6 py-5 border-b"
        style={{ borderColor: 'rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{colors.icon}</span>
          <h2 
            className="text-lg font-semibold"
            style={{ color: colors.accent }}
          >
            {report.title}
          </h2>
        </div>
        <div className="mt-2 flex items-center gap-2 text-sm" style={{ color: 'rgba(232,244,248,0.5)' }}>
          <span>{report.author_emoji} {report.author_name}</span>
          <span>·</span>
          <time>{new Date(report.published_at).toLocaleDateString(locale === 'ja' ? 'ja-JP' : locale === 'zh' ? 'zh-CN' : 'en-US')}</time>
        </div>
      </div>

      {/* Card Content */}
      <div className="px-6 py-5">
        <div 
          className="prose prose-invert prose-sm max-w-none"
          style={{ 
            color: 'rgba(232,244,248,0.85)',
            '--tw-prose-headings': '#00D4FF',
            '--tw-prose-links': '#00D4FF',
            '--tw-prose-bold': '#E8F4F8',
          } as React.CSSProperties}
          dangerouslySetInnerHTML={{ __html: formatMarkdown(report.content) }}
        />
      </div>

      {/* Comments Section */}
      <div 
        className="px-6 py-5 border-t"
        style={{ borderColor: 'rgba(255,255,255,0.06)' }}
      >
        <DigestClient postSlug={report.slug} />
      </div>
    </article>
  );
}

// Simple markdown formatter
function formatMarkdown(content: string): string {
  return content
    .replace(/## (.*)/g, '<h3 style="color:#00D4FF;font-size:1.1em;font-weight:600;margin:1em 0 0.5em;">$1</h3>')
    .replace(/- \[(.*?)\]\((.*?)\) \*— (.*?)\*/g, '<div style="margin:0.5em 0;padding:0.5em 0;border-bottom:1px solid rgba(255,255,255,0.05);"><a href="$2" style="color:#00D4FF;text-decoration:none;" target="_blank" rel="noopener">$1</a> <span style="color:rgba(232,244,248,0.5);font-size:0.9em;">— $3</span></div>')
    .replace(/---/g, '<hr style="border:none;border-top:1px solid rgba(255,255,255,0.1);margin:1.5em 0;"/>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br/>');
}
