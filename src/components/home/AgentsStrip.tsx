import Link from 'next/link';
import Image from 'next/image';
import { getAvatarUrl } from '@/lib/storage';

import type { Locale } from '@/lib/locale';

const agents: { id: string; name: string; role: { zh: string; ja: string; en: string }; accent: string }[] = [
  { id: 'yuki', name: 'ユキ',  role: { zh: '技术顾问',       ja: 'テック顧問',     en: 'Tech Advisor' },    accent: '#9EC7E8' },
  { id: 'natu', name: 'ナツ',  role: { zh: '内容运营',       ja: 'コンテンツ運営', en: 'Content Ops' },     accent: '#FFCB45' },
  { id: 'haru', name: 'ハル',  role: { zh: '全栈开发',       ja: 'フルスタック',   en: 'Full-Stack Dev' },  accent: '#5CC9A7' },
  { id: 'aki',  name: 'アキ',  role: { zh: '设计师',         ja: 'デザイナー',     en: 'Designer' },        accent: '#FF7B9C' },
];

export function AgentsStrip({ locale }: { locale: Locale }) {
  const heading = locale === 'ja' ? 'AI パートナー' : locale === 'en' ? 'AI Partners' : 'AI 搭档';
  const sub = locale === 'ja'
    ? 'Will と毎日協業する4人のAI'
    : locale === 'en'
      ? 'Four AIs Will collaborates with daily'
      : 'Will 日常协作的 4 位 AI';

  return (
    <section className="py-10 sm:py-14">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="mb-5">
          <h2 className="text-2xl sm:text-3xl font-bold text-dior-gradient text-dior-gradient-breathing">{heading}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{sub}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
          {agents.map((a) => (
            <Link
              key={a.id}
              href={`/${locale}/debate`}
              className="glass-card group relative overflow-hidden rounded-2xl p-3 sm:rounded-3xl sm:p-4 transition-all"
            >
              {/* colored ring + bg halo */}
              <div
                className="absolute -inset-1 -z-10 rounded-3xl opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-60"
                style={{ background: `radial-gradient(60% 50% at 50% 50%, ${a.accent}66, transparent 70%)` }}
                aria-hidden
              />
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div
                  className="relative h-10 w-10 sm:h-14 sm:w-14 shrink-0 overflow-hidden rounded-xl sm:rounded-2xl"
                  style={{ boxShadow: `0 4px 18px ${a.accent}40, inset 0 0 0 2px ${a.accent}66` }}
                >
                  <Image
                    src={getAvatarUrl(a.id)}
                    alt={a.name}
                    fill
                    sizes="(max-width: 640px) 40px, 56px"
                    className="object-cover object-top"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-sm sm:text-base font-bold leading-tight">{a.name}</p>
                  <p className="mt-0.5 text-[10px] sm:text-[11px] leading-tight text-muted-foreground truncate">
                    {a.role[locale]}
                  </p>
                </div>
              </div>
              <span
                className="mt-2 sm:mt-3 inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold tracking-wider uppercase"
                style={{ color: a.accent }}
              >
                {locale === 'zh' ? '参与讨论 →' : locale === 'ja' ? '議論に参加 →' : 'Join debate →'}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
