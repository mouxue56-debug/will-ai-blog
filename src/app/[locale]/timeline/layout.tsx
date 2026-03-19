import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '时间线',
  description: 'AI实践、猫舎运营、技术探索的时间线记录',
  alternates: {
    languages: {
      zh: '/zh/timeline',
      ja: '/ja/timeline',
      en: '/en/timeline',
    },
  },
};

export default function TimelineLayout({ children }: { children: React.ReactNode }) {
  return children;
}
