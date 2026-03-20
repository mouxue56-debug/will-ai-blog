'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { motion } from 'motion/react';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { LocaleSwitcher } from '@/components/shared/locale-switcher';

const navItems = [
  { key: 'blog', href: '/blog' },
  { key: 'news', href: '/news' },
  { key: 'timeline', href: '/timeline' },
  { key: 'cases', href: '/cases' },
  { key: 'life', href: '/life' },
  { key: 'social', href: '/social' },
  { key: 'about', href: '/about' },
] as const;

export function Header() {
  const t = useTranslations('nav');
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg font-bold bg-gradient-to-r from-brand-mint via-brand-cyan to-brand-taro bg-clip-text text-transparent">
            Will AI Lab
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.key}
                href={item.href}
                className={`relative px-3 py-2 text-sm transition-colors rounded-md group ${
                  active
                    ? 'text-brand-mint font-medium'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t(item.key)}
                {/* Active underline */}
                {active && (
                  <motion.div
                    layoutId="desktop-nav-underline"
                    className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full bg-brand-mint"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                {/* Hover underline (non-active) */}
                {!active && (
                  <span className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full bg-brand-mint scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <LocaleSwitcher />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
