import { notFound } from 'next/navigation';
import type { AIOpinion } from '@/data/debates';
import { getDebateById } from '@/data/debates';
import { DebateDetailClient } from '@/components/debate/DebateDetailClient';
import { getDebateTopic, type DebateLocale } from '@/lib/debate-store';

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

  return (
    <DebateDetailClient
      locale={locale}
      topic={topic}
      initialOpinions={(staticDebate?.aiOpinions ?? []) as AIOpinion[]}
    />
  );
}
