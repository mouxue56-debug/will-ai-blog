'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { motion } from 'motion/react';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { LocaleSwitcher } from '@/components/shared/locale-switcher';
import { UserMenu } from '@/components/shared/user-menu';

const navItems = [
  { key: 'blog', href: '/blog' },
  { key: 'learning', href: '/learning' },
  { key: 'debate', href: '/debate' },
  { key: 'cases', href: '/cases' },
  { key: 'timeline', href: '/timeline' },
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
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.06] dark:border-white/[0.06] border-[rgba(230,200,215,0.6)] bg-[rgba(255,248,240,0.82)] dark:bg-[rgba(10,10,15,0.7)] backdrop-blur-2xl backdrop-saturate-180 [box-shadow:inset_0_-1px_0_rgba(255,255,255,0.6)] dark:[box-shadow:none]">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-lg font-bold bg-gradient-to-r from-brand-mint via-brand-cyan to-brand-taro bg-clip-text text-transparent transition-all duration-300 group-hover:drop-shadow-[0_0_12px_rgba(94,234,212,0.4)]">
            Will&apos;s AI Lab
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.key}
                href={item.href}
                className={`group relative px-3 py-2 text-sm transition-colors rounded-md ${
                  active
                    ? 'text-brand-mint font-medium'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t(item.key)}
                {active && (
                  <motion.div
                    layoutId="desktop-nav-underline"
                    className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full bg-brand-mint"
                    style={{
                      boxShadow: '0 0 8px rgba(94,234,212,0.6), 0 0 20px rgba(94,234,212,0.3)',
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                {!active && (
                  <span
                    className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full bg-brand-mint/60 scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden md:block">
            <LocaleSwitcher />
          </div>
          <div className="md:hidden">
            <LocaleSwitcher compact />
          </div>
          <UserMenu />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
