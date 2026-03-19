import type { Metadata } from 'next';
import { getAllPosts } from '@/lib/blog';
import { BlogList } from '@/components/blog/blog-list';

export const metadata: Metadata = {
  title: '博客',
  description: 'AI心得、技术笔记、生活日常 — Will的博客文章合集',
  alternates: {
    languages: {
      zh: '/zh/blog',
      ja: '/ja/blog',
      en: '/en/blog',
    },
  },
};

export default function BlogPage() {
  const posts = getAllPosts();
  return <BlogList posts={posts} />;
}
