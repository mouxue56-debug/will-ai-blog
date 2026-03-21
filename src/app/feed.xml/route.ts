import { generateXML } from '@/lib/seo';

export async function GET() {
  return new Response(generateXML('zh', '/feed.xml'), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
