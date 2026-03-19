'use client';

import { useTranslations } from 'next-intl';
import { Youtube, Instagram, Twitter } from 'lucide-react';

// TikTok icon (not in lucide-react)
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.81a8.23 8.23 0 0 0 4.76 1.5v-3.4a4.85 4.85 0 0 1-1-.22Z" />
    </svg>
  );
}

const snsLinks = [
  {
    key: 'youtube',
    href: 'https://youtube.com/@willailab',
    icon: Youtube,
  },
  {
    key: 'instagram',
    href: 'https://instagram.com/willailab',
    icon: Instagram,
  },
  {
    key: 'tiktok',
    href: 'https://tiktok.com/@willailab',
    icon: TikTokIcon,
  },
  {
    key: 'twitter',
    href: 'https://x.com/willailab',
    icon: Twitter,
  },
];

export function Footer() {
  const t = useTranslations('footer');

  return (
    <footer className="border-t border-border/40 pb-20 md:pb-0">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
        {/* SNS + Links */}
        <div className="flex flex-col items-center gap-6">
          {/* SNS Icons */}
          <div className="flex items-center gap-4">
            {snsLinks.map((link) => {
              const Icon = link.icon;
              return (
                <a
                  key={link.key}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-md p-2 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  aria-label={link.key}
                >
                  <Icon className="h-5 w-5" />
                </a>
              );
            })}
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
            <a
              href="https://fuluckai.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              fuluckai.com
            </a>
            <span className="text-border">·</span>
            <a
              href="https://fuluck-cattery.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              {t('cattery')}
            </a>
          </div>

          {/* Copyright & Powered by */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 w-full text-xs text-muted-foreground/60">
            <p>{t('copyright')}</p>
            <p>{t('powered_by')}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
