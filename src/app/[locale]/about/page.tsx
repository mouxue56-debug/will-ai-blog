import { useTranslations } from 'next-intl';

export default function AboutPage() {
  const t = useTranslations('nav');
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-16">
      <h1 className="text-3xl font-bold">{t('about')}</h1>
      <p className="mt-4 text-muted-foreground">Coming soon...</p>
    </div>
  );
}
