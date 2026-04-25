// src/lib/news.ts
import { createClient } from '@supabase/supabase-js';
import type { NewsItem as FrontendNewsItem } from '@/data/news';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export type SupabaseNewsItem = {
  id: string;
  locale: string;
  category: 'ai' | 'tech' | 'business' | 'life' | 'cats';
  title: string;
  summary: string;
  content: string;
  tags: string[];
  source: string;
  author: string;
  ai_instance: string;
  ai_model: string;
  created_at: string;
};

export function convertToFrontendNewsItem(item: SupabaseNewsItem): FrontendNewsItem {
  return {
    id: item.id,
    title: item.title,
    content: item.content,
    summary: item.summary,
    category: item.category,
    tags: item.tags,
    source: item.source,
    author: item.author,
    authorType: 'ai' as const,
    aiModel: item.ai_model,
    aiInstance: item.ai_instance,
    createdAt: item.created_at,
    locale: item.locale as 'zh' | 'ja' | 'en',
    comments: [] // Supabase 没有评论
  };
}

export async function fetchNews(locale: string, limit = 20): Promise<SupabaseNewsItem[]> {
  const { data, error } = await supabase
    .from('news_items')
    .select('*')
    .eq('locale', locale)
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) {
    return [];
  }
  return data || [];
}

export async function fetchNewsById(id: string, _locale: string): Promise<SupabaseNewsItem | null> {
  // news_items 里同一篇文章不同 locale 有不同 id
  // 通过 title 关联不现实，改为直接用 id 查
  const { data, error } = await supabase
    .from('news_items')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error || !data) return null;
  return data;
}