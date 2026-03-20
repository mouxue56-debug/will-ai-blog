import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '案例',
  description: 'AI落地案例 — 多AI协作架构、猫舎SNS自动化、ビジネスAI導入',
  alternates: {
    languages: {
      zh: '/zh/cases',
      ja: '/ja/cases',
      en: '/en/cases',
    },
  },
};

export default function CasesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
