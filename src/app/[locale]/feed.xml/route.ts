import { hasLocale } from 'next-intl';
import { routing } from '@/i18n/routing';
import { generateXML } from '@/lib/seo';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function GET(_: Request, { params }: Props) {
  const { locale } = await params;
  const resolvedLocale = hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;

  return new Response(generateXML(resolvedLocale), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
