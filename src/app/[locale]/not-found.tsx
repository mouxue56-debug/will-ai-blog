'use client';

import { Search, ArrowLeft, Home } from 'lucide-react';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';

const copy = {
  zh: {
    title: '404',
    headline: '页面不存在',
    body: '链接可能失效了，或者内容已经移动到别的位置。',
    searchHint: '可尝试去博客搜索 AI、提示词、OpenClaw、多实例。',
    home: '返回首页',
    blog: '进入博客',
    about: '了解 Will',
    back: '返回上一层',
  },
  ja: {
    title: '404',
    headline: 'ページが見つかりません',
    body: 'リンク切れか、コンテンツが別の場所へ移動した可能性があります。',
    searchHint: 'AI、プロンプト、OpenClaw、マルチインスタンスで探すのがおすすめです。',
    home: 'ホームへ',
    blog: 'ブログを見る',
    about: 'Will について',
    back: '前に戻る',
  },
  en: {
    title: '404',
    headline: 'Page not found',
    body: 'The link may be outdated, or the content has moved somewhere else.',
    searchHint: 'Try searching the blog for AI, prompts, OpenClaw, or multi-instance.',
    home: 'Back home',
    blog: 'Open blog',
    about: 'About Will',
    back: 'Go back',
  },
} as const;

export default function LocaleNotFound() {
  const locale = useLocale() as keyof typeof copy;
  const text = copy[locale] ?? copy.zh;

  return (
    <div className="relative overflow-hidden px-4 py-20 sm:px-6 min-h-[70vh] flex items-center justify-center">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-10 h-80 w-80 -translate-x-1/2 rounded-full bg-brand-cyan/10 blur-[140px]" />
        <div className="absolute bottom-10 right-10 h-56 w-56 rounded-full bg-brand-taro/10 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-3xl">
        <div className="rounded-3xl border border-white/10 bg-black/30 p-8 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-10">
          <h1
            className="text-[7rem] sm:text-[9rem] font-bold leading-none bg-gradient-to-br from-brand-cyan via-brand-mint to-brand-taro bg-clip-text text-transparent select-none"
            style={{
              animation:
                'fadeUp 0.6s ease-out 0.1s forwards, float 3s ease-in-out 0.7s infinite, glitch404 4s ease-in-out 1s infinite',
              opacity: 0,
            }}
          >
            404
          </h1>
          <h2
            className="mt-4 text-2xl font-semibold text-foreground sm:text-3xl opacity-0 animate-[fadeUp_0.6s_ease-out_0.2s_forwards]"
          >
            {text.headline}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base opacity-0 animate-[fadeUp_0.6s_ease-out_0.3s_forwards]">
            {text.body}
          </p>

          <div className="mt-6 rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-sm text-muted-foreground opacity-0 animate-[fadeUp_0.6s_ease-out_0.4s_forwards]">
            <div className="flex items-center gap-2 text-foreground">
              <Search className="h-4 w-4 text-brand-mint" />
              <span>{text.searchHint}</span>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3 opacity-0 animate-[fadeUp_0.6s_ease-out_0.5s_forwards]">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full bg-brand-cyan/15 px-5 py-2.5 text-sm font-medium text-brand-cyan transition-colors hover:bg-brand-cyan/25"
            >
              <Home className="h-4 w-4" />
              {text.home}
            </Link>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-white/[0.06]"
            >
              <Search className="h-4 w-4" />
              {text.blog}
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-white/[0.06]"
            >
              {text.about}
            </Link>
          </div>

          <div className="mt-8 border-t border-white/8 pt-5 opacity-0 animate-[fadeUp_0.6s_ease-out_0.6s_forwards]">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              {text.back}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
