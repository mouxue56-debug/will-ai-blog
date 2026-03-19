'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname } from '@/i18n/navigation';
import { Link } from '@/i18n/navigation';
import {
  Home,
  BookOpen,
  Clock,
  Heart,
  MoreHorizontal,
  Briefcase,
  Share2,
  User,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

const mainTabs = [
  { key: 'home', href: '/', icon: Home },
  { key: 'blog', href: '/blog', icon: BookOpen },
  { key: 'timeline', href: '/timeline', icon: Clock },
  { key: 'life', href: '/life', icon: Heart },
] as const;

const moreTabs = [
  { key: 'cases', href: '/cases', icon: Briefcase },
  { key: 'social', href: '/social', icon: Share2 },
  { key: 'about', href: '/about', icon: User },
] as const;

export function MobileNav() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  function isActive(href: string) {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  }

  const moreIsActive = moreTabs.some((tab) => isActive(tab.href));

  return (
    <>
      {/* More menu overlay */}
      <AnimatePresence>
        {moreOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/40 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMoreOpen(false)}
            />
            <motion.div
              className="fixed bottom-16 right-2 left-2 z-50 rounded-2xl border border-border/40 bg-background/95 backdrop-blur-xl p-2 md:hidden"
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
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-1">
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
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="text-xs">{t(tab.key)}</span>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/40 bg-background/90 backdrop-blur-xl md:hidden">
        <div className="flex items-center justify-around h-16 px-1">
          {mainTabs.map((tab) => {
            const Icon = tab.icon;
            const active = isActive(tab.href);
            return (
              <Link
                key={tab.key}
                href={tab.href}
                className={`flex flex-1 flex-col items-center gap-0.5 py-1.5 transition-colors ${
                  active
                    ? 'text-brand-mint'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] leading-tight">{t(tab.key)}</span>
              </Link>
            );
          })}

          {/* More button */}
          <button
            onClick={() => setMoreOpen((prev) => !prev)}
            className={`flex flex-1 flex-col items-center gap-0.5 py-1.5 transition-colors ${
              moreIsActive || moreOpen
                ? 'text-brand-mint'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <MoreHorizontal className="h-5 w-5" />
            <span className="text-[10px] leading-tight">{t('more')}</span>
          </button>
        </div>
      </nav>
    </>
  );
}
