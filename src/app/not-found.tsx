import { getLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

export default async function NotFound() {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: 'notFound' });

  return (
    <html lang={locale}>
      <body className="min-h-screen flex items-center justify-center bg-[#0a0a0f] text-foreground antialiased">
        <div className="relative overflow-hidden px-4 py-20 sm:px-6 min-h-screen flex items-center justify-center">
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
              <h2 className="mt-4 text-2xl font-semibold text-foreground sm:text-3xl opacity-0 animate-[fadeUp_0.6s_ease-out_0.2s_forwards]">
                {t('title')}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base opacity-0 animate-[fadeUp_0.6s_ease-out_0.3s_forwards]">
                {t('subtitle')}
              </p>
              <p className="mt-1 text-sm text-muted-foreground/70 opacity-0 animate-[fadeUp_0.6s_ease-out_0.35s_forwards]">
                {t('description')}
              </p>

              <div className="mt-8 flex flex-wrap gap-3 opacity-0 animate-[fadeUp_0.6s_ease-out_0.5s_forwards]">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 rounded-full bg-brand-cyan/15 px-5 py-2.5 text-sm font-medium text-brand-cyan transition-colors hover:bg-brand-cyan/25"
                >
                  {t('home')}
                </Link>
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-white/[0.06]"
                >
                  {t('blog')}
                </Link>
              </div>
            </div>
          </div>
        </div>

        <style>{`
          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(16px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50%      { transform: translateY(-12px); }
          }
          @keyframes glitch404 {
            0%, 100% { text-shadow: none; }
            20%      { text-shadow: -2px 0 #00D4FF, 2px 0 #FF6B9D; }
            22%      { text-shadow: none; }
            55%      { text-shadow: 2px 0 #5EEAD4, -2px 0 #C084FC; }
            57%      { text-shadow: none; }
          }
        `}</style>
      </body>
    </html>
  );
}
