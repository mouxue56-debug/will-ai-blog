import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase';
import { MessageCircle, ArrowRight } from 'lucide-react';

type Locale = 'zh' | 'ja' | 'en';

interface Row {
  id: string;
  title: string;
  title_zh: string | null;
  title_ja: string | null;
  title_en: string | null;
  topic_type: 'ai' | 'economy' | 'github' | 'social' | 'japan_cn' | 'politics';
  published_at: string;
}

const typeMeta: Record<Row['topic_type'], { emoji: string; label: { zh: string; ja: string; en: string }; dotColor: string }> = {
  ai:       { emoji: '🧠', label: { zh: 'AI 动态',   ja: 'AIニュース', en: 'AI Pulse' },     dotColor: '#B48EE0' },
  economy:  { emoji: '💹', label: { zh: '经济观察', ja: '経済',       en: 'Economy' },     dotColor: '#5CC9A7' },
  github:   { emoji: '🔥', label: { zh: 'GitHub',    ja: 'GitHub',     en: 'GitHub' },      dotColor: '#FF7B9C' },
  social:   { emoji: '📊', label: { zh: '社交数据', ja: 'SNS指標',     en: 'Social' },      dotColor: '#FFCB45' },
  japan_cn: { emoji: '🗾', label: { zh: '在日华人', ja: '在日中国人', en: 'Japan CN' },     dotColor: '#FFB8CC' },
  politics: { emoji: '🌏', label: { zh: '时事政经', ja: '時事経済',   en: 'Geopolitics' },  dotColor: '#9EC7E8' },
};

function title(row: Row, loc: Locale): string {
  if (loc === 'ja') return row.title_ja || row.title;
  if (loc === 'en') return row.title_en || row.title;
  return row.title_zh || row.title;
}

export async function TodayFeedTeaser({ locale }: { locale: Locale }) {
  const { data } = await supabaseAdmin
    .from('daily_reports')
    .select('id, title, title_zh, title_ja, title_en, topic_type, published_at')
    .in('topic_type', ['ai', 'economy', 'github', 'social', 'japan_cn', 'politics'])
    .order('published_at', { ascending: false })
    .limit(4);

  const rows = (data ?? []) as Row[];
  if (rows.length === 0) return null;

  const heading = locale === 'ja' ? '今日の話題' : locale === 'en' ? "Today's Pulse" : '今日热议';
  const cta = locale === 'ja' ? 'すべて見る' : locale === 'en' ? 'See all' : '查看全部';

  return (
    <section className="py-8 sm:py-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="mb-5 flex items-end justify-between">
          <h2 className="text-2xl sm:text-3xl font-bold text-dior-gradient text-dior-gradient-breathing">{heading}</h2>
          <Link
            href={`/${locale}/debate`}
            className="inline-flex items-center gap-1 text-sm text-foreground/70 hover:text-foreground transition-colors"
          >
            {cta} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {rows.map((r) => {
            const meta = typeMeta[r.topic_type] ?? typeMeta.ai;
            return (
              <Link
                key={r.id}
                href={`/${locale}/debate/${r.id}`}
                className="glass-card group rounded-2xl p-4 transition-all relative overflow-hidden"
                style={{
                  // local tint for colored glow on hover
                  ['--card-accent' as string]: meta.dotColor,
                }}
              >
                <span
                  className="pointer-events-none absolute inset-x-0 top-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${meta.dotColor}, transparent)`,
                  }}
                  aria-hidden
                />
                <div className="mb-2 flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: meta.dotColor, boxShadow: `0 0 8px ${meta.dotColor}66` }}
                    aria-hidden
                  />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-foreground/70">
                    {meta.emoji} {meta.label[locale]}
                  </span>
                </div>
                <h3 className="line-clamp-2 text-[14px] font-semibold leading-snug text-foreground">
                  {title(r, locale)}
                </h3>
                <div className="mt-3 flex items-center gap-1 text-[11px] text-muted-foreground">
                  <MessageCircle className="h-3 w-3" aria-hidden />
                  <span>
                    {locale === 'zh' ? '参与讨论' : locale === 'ja' ? '議論に参加' : 'Join discussion'}
                  </span>
                  <span
                    className="ml-auto opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
                    style={{ color: meta.dotColor }}
                  >
                    →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
