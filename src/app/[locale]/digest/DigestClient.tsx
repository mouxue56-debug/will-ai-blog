'use client';

import { CommentSection } from '@/components/blog/CommentSection';

interface DigestClientProps {
  postSlug: string;
}

export function DigestClient({ postSlug }: DigestClientProps) {
  return <CommentSection postSlug={postSlug} />;
}
