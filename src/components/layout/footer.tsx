'use client';

import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

type FooterLink = {
  href: string;
  label?: string;
  labelKey?: 'cattery' | 'xiaohongshu' | 'about';
  value?: string;
  valueKey?: 'xiaohongshu_handle';
};

const siteLinks: FooterLink[] = [
  { href: '/about', labelKey: 'about' },
  { href: 'https://fuluckai.com', label: 'fuluckai.com' },
  { href: 'https://fuluck-cattery.com', labelKey: 'cattery' },
];

const socialLinks: FooterLink[] = [
  {
    href: 'https://www.instagram.com/fuluck_cattery/',
    label: 'Instagram',
    value: '@fuluck_cattery',
  },
  {
    href: 'https://github.com/konayuki56',
    label: 'GitHub',
    value: '@konayuki56',
  },
  {
    href: 'https://www.xiaohongshu.com/user/profile/65b8e6a4000000000d008d37',
    labelKey: 'xiaohongshu',
    valueKey: 'xiaohongshu_handle',
  },
];

export function Footer() {
  const t = useTranslations('footer');

  return (
    <footer className="pb-20 md:pb-0" aria-label={t('sites_title')}>
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-brand-mint/60 to-brand-cyan/60 opacity-50" />
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6">
        <div className="grid gap-6 md:grid-cols-[1.3fr_1fr_1.2fr] md:items-start">
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>{t('copyright')}</p>
            <p>{t('powered_by')}</p>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground/80">
              {t('sites_title')}
            </p>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              {siteLinks.map((link) => {
                const isInternal = link.href.startsWith('/');
                const Tag = isInternal ? Link : 'a';
                const externalProps = isInternal ? {} : { target: '_blank' as const, rel: 'noopener noreferrer' };
                return (
                  <Tag
                    key={link.href}
                    href={link.href}
                    className="hover:text-brand-mint transition-colors"
                    {...externalProps}
                  >
                    {link.labelKey ? t(link.labelKey) : link.label}
                  </Tag>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground/80">
              {t('social_title')}
            </p>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              {socialLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between gap-3 rounded-xl border border-border/40 px-3 py-2 transition-colors hover:border-brand-mint/40 hover:text-brand-mint"
                >
                  <span>{link.labelKey ? t(link.labelKey) : link.label}</span>
                  <span className="text-xs text-muted-foreground transition-colors group-hover:text-brand-mint/80">
                    {link.valueKey ? t(link.valueKey) : link.value}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
