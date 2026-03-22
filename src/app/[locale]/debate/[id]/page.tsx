import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import type { AIOpinion } from '@/data/debates';
import { getDebateById } from '@/data/debates';
import { DebateDetailClient } from '@/components/debate/DebateDetailClient';
import { getDebateTopic, type DebateLocale } from '@/lib/debate-store';
import newsTranslations from '@/data/news-translations.json';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale, id } = await params;
  const staticDebate = getDebateById(id);
  const dynamicTopic = await getDebateTopic(id);
  const topic = dynamicTopic ?? (staticDebate ? {
    id: staticDebate.id,
    date: staticDebate.date,
    session: staticDebate.session,
    title: staticDebate.topic,
    newsSource: staticDebate.newsSource,
    tags: staticDebate.tags,
  } : null);

  if (!topic) {
    return { title: 'Not Found' };
  }

  const lang = (locale === 'zh' || locale === 'ja' || locale === 'en') ? locale : 'zh';
  const title = topic.title[lang] || topic.title.zh;
  const description = `AI discussion on ${title} — join the conversation`;
  const ogImageUrl = `https://aiblog.fuluckai.com/api/og?title=${encodeURIComponent(title)}&lang=${encodeURIComponent(lang)}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      images: [{
        url: ogImageUrl,
        width: 1200,
        height: 630,
        alt: `${title} OG image`,
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
    },
    alternates: {
      languages: {
        zh: `/zh/debate/${id}`,
        ja: `/ja/debate/${id}`,
        en: `/en/debate/${id}`,
      },
    },
  };
}

export default async function DebateDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale: rawLocale, id } = await params;
  const locale = rawLocale as DebateLocale;
  const staticDebate = getDebateById(id);
  const dynamicTopic = await getDebateTopic(id);
  const topic = dynamicTopic ?? (staticDebate ? {
    id: staticDebate.id,
    date: staticDebate.date,
    session: staticDebate.session,
    title: staticDebate.topic,
    newsSource: staticDebate.newsSource,
    tags: staticDebate.tags,
  } : null);

  if (!topic) {
    notFound();
  }

  const lang = (locale === 'zh' || locale === 'ja' || locale === 'en') ? locale : 'zh';
  const title = topic.title[lang] || topic.title.zh;
  const description = `AI discussion on ${title} — join the conversation`;
  const ogImageUrl = `https://aiblog.fuluckai.com/api/og?title=${encodeURIComponent(title)}&lang=${encodeURIComponent(lang)}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'DiscussionForumPosting',
    headline: title,
    description,
    author: {
      '@type': 'Person',
      name: 'Will',
      url: 'https://aiblog.fuluckai.com/about',
    },
    publisher: {
      '@type': 'Organization',
      name: "Will's AI Blog",
      url: 'https://aiblog.fuluckai.com',
    },
    datePublished: topic.date,
    dateModified: topic.date,
    image: ogImageUrl,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://aiblog.fuluckai.com/${lang}/debate/${id}`,
    },
    interactionStatistic: {
      '@type': 'InteractionCounter',
      interactionType: 'https://schema.org/CommentAction',
      userInteractionCount: staticDebate?.aiOpinions?.length || 0,
    },
  };

  // Get translated news items for this topic
  const newsItems = (newsTranslations as Record<string, Array<{
    title_en: string;
    title_zh: string;
    title_ja: string;
    url: string;
    source: string;
  }>>)[id] || [];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <DebateDetailClient
        locale={locale}
        topic={topic}
        initialOpinions={(staticDebate?.aiOpinions ?? []) as AIOpinion[]}
        newsItems={newsItems}
      />
    </>
  );
}
