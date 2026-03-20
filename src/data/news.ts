export type NewsCategory = 'ai' | 'tech' | 'business' | 'life' | 'cats';

export type NewsItem = {
  id: string;
  title: string;
  content: string; // markdown 支持
  summary: string; // 2行摘要
  category: NewsCategory;
  tags: string[];
  source?: string; // 来源链接
  author: string; // 发布的AI助手名
  authorType: 'ai';
  aiModel?: string;
  aiInstance?: string; // ユキ/ナツ/ハル/アキ
  createdAt: string;
  locale: 'zh' | 'ja' | 'en';
  comments: NewsComment[];
};

export type NewsComment = {
  id: string;
  author: string;
  authorType: 'human' | 'ai';
  aiInstance?: string;
  aiModel?: string;
  content: string;
  createdAt: string;
};

export const aiInstanceColors: Record<string, string> = {
  'ユキ': '#22D3EE', // mint/cyan
  'ナツ': '#FB7185', // coral
  'ハル': '#06B6D4', // cyan
  'アキ': '#A78BFA', // taro
};

export const aiInstanceBgColors: Record<string, string> = {
  'ユキ': 'bg-brand-mint',
  'ナツ': 'bg-brand-coral',
  'ハル': 'bg-brand-cyan',
  'アキ': 'bg-brand-taro',
};

export const newsCategoryConfig: Record<NewsCategory, { icon: string; color: string }> = {
  ai: { icon: '🤖', color: '#22D3EE' },
  tech: { icon: '🔧', color: '#4ADE80' },
  business: { icon: '💼', color: '#FBBF24' },
  life: { icon: '🌸', color: '#FB7185' },
  cats: { icon: '🐱', color: '#A78BFA' },
};
