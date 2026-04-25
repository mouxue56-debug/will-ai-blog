'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname } from '@/i18n/navigation';
import { Link } from '@/i18n/navigation';
import {
  Home,
  BookOpen,
  Clock,
  MoreHorizontal,
  Briefcase,
  User,
  X,
  LogIn,
  Swords,
  GraduationCap,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useSession, signOut } from 'next-auth/react';

const mainTabs = [
  { key: 'home', href: '/', icon: Home },
  { key: 'blog', href: '/blog', icon: BookOpen },
  { key: 'debate', href: '/debate', icon: Swords },
  { key: 'timeline', href: '/timeline', icon: Clock },
] as const;

const moreTabs = [
  { key: 'cases', href: '/cases', icon: Briefcase },
  { key: 'learning', href: '/learning', icon: GraduationCap },
  { key: 'about', href: '/about', icon: User },
] as const;

export function MobileNav() {
  const t = useTranslations('nav');
  const authT = useTranslations('auth');
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const { data: session } = useSession();

  function isActive(href: string) {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  }

  const moreIsActive = moreTabs.some((tab) => isActive(tab.href));

  return (
    <>
      <AnimatePresence>
        {moreOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMoreOpen(false)}
            />
            <motion.div
              className="fixed bottom-16 right-2 left-2 z-50 glass-card p-2 md:hidden"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-xs font-medium text-muted-foreground">
                  {t('more')}
                </span>
                <button
                  onClick={() => setMoreOpen(false)}
                  className="rounded-md p-1 text-muted-foreground hover:text-foreground"
                  aria-label={t('close_menu')}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-1">
                {moreTabs.map((tab) => {
                  const Icon = tab.icon;
                  const active = isActive(tab.href);
                  return (
                    <Link
                      key={tab.key}
                      href={tab.href}
                      onClick={() => setMoreOpen(false)}
                      className={`flex flex-col items-center gap-1 rounded-xl py-3 transition-colors ${
                        active
                          ? 'bg-brand-mint/10 text-brand-mint'
                          : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.05]'
                      }`}
                    >
                      <Icon className={`h-5 w-5 ${active ? 'drop-shadow-[0_0_6px_rgba(94,234,212,0.6)]' : ''}`} />
                      <span className="text-xs">{t(tab.key)}</span>
                    </Link>
                  );
                })}
              </div>

              <div className="border-t border-white/[0.06] mt-2 pt-2 px-1">
                {session?.user ? (
                  <div className="flex items-center justify-between px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-mint to-brand-cyan flex items-center justify-center text-[10px] font-bold text-white">
                        {(session.user.name || 'U').slice(0, 2).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium truncate max-w-[120px]">{session.user.name}</span>
                    </div>
                    <button
                      onClick={() => {
                        setMoreOpen(false);
                        signOut();
                      }}
                      className="text-xs text-red-400 hover:text-red-300 transition-colors"
                    >
                      {authT('sign_out')}
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/auth/signin"
                    onClick={() => setMoreOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/[0.05] transition-colors"
                  >
                    <LogIn className="h-4 w-4" />
                    <span className="text-sm">{authT('sign_in')}</span>
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <nav className="glass-nav fixed bottom-0 left-0 right-0 z-40 md:hidden safe-area-bottom">
        <div className="relative flex items-center justify-around h-16 px-1">
          {(() => {
            const activeIndex = mainTabs.findIndex((tab) => isActive(tab.href));
            const idx = activeIndex >= 0 ? activeIndex : (moreIsActive ? mainTabs.length : -1);
            if (idx < 0) return null;
            const totalTabs = mainTabs.length + 1;
            return (
              <motion.div
                className="absolute top-1 h-[3px] rounded-full bg-brand-mint"
                layoutId="mobile-tab-indicator"
                style={{
                  width: `${60 / totalTabs}%`,
                  boxShadow: '0 0 8px rgba(94,234,212,0.5)',
                }}
                animate={{ left: `${(idx / totalTabs) * 100 + (100 / totalTabs - 60 / totalTabs) / 2}%` }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            );
          })()}

          {mainTabs.map((tab) => {
            const Icon = tab.icon;
            const active = isActive(tab.href);
            return (
              <Link
                key={tab.key}
                href={tab.href}
                className={`flex flex-1 flex-col items-center gap-0.5 py-1.5 min-h-[44px] justify-center transition-colors ${
                  active
                    ? 'text-brand-mint'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className={`h-5 w-5 transition-all duration-300 ${active ? 'drop-shadow-[0_0_8px_rgba(94,234,212,0.6)]' : ''}`} />
                <span className="text-[10px] leading-tight">{t(tab.key)}</span>
              </Link>
            );
          })}

          <button
            onClick={() => setMoreOpen((prev) => !prev)}
            aria-label={t('more')}
            aria-expanded={moreOpen}
            className={`flex flex-1 flex-col items-center gap-0.5 py-1.5 min-h-[44px] justify-center transition-colors ${
              moreIsActive || moreOpen
                ? 'text-brand-mint'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <MoreHorizontal className={`h-5 w-5 transition-all duration-300 ${moreIsActive || moreOpen ? 'drop-shadow-[0_0_8px_rgba(94,234,212,0.6)]' : ''}`} />
            <span className="text-[10px] leading-tight">{t('more')}</span>
          </button>
        </div>
      </nav>
    </>
  );
}
