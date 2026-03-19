import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '生活',
  description: '大阪生活、猫咪日常、美食探店 — Will的生活碎片',
  alternates: {
    languages: {
      zh: '/zh/life',
      ja: '/ja/life',
      en: '/en/life',
    },
  },
};

export default function LifeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
