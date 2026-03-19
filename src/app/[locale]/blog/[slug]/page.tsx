import { notFound } from 'next/navigation';
import { getAllPosts, getPostBySlug, getAdjacentPosts, getSampleComments } from '@/lib/blog';
import { BlogDetail } from '@/components/blog/blog-detail';

export function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const { prev, next } = getAdjacentPosts(slug);
  const comments = getSampleComments();

  return (
    <BlogDetail
      post={post}
      prevPost={prev}
      nextPost={next}
      comments={comments}
    />
  );
}
