import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '关于',
  description: '关于Will — AI实践者、猫舎经营者、大阪在住',
  alternates: {
    languages: {
      zh: '/zh/about',
      ja: '/ja/about',
      en: '/en/about',
    },
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
