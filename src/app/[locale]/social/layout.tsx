import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '关注我',
  description: '在各平台关注Will — Instagram、TikTok、小红书、GitHub',
  alternates: {
    languages: {
      zh: '/zh/social',
      ja: '/ja/social',
      en: '/en/social',
    },
  },
};

export default function SocialLayout({ children }: { children: React.ReactNode }) {
  return children;
}
