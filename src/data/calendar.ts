export type CalendarEvent = {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  description?: string;
  category: 'blog' | 'event' | 'milestone' | 'maintenance';
  isPublic: true;
};

export const calendarEvents: CalendarEvent[] = [
  {
    id: 'evt-001',
    date: '2026-03-20',
    title: 'AI Blog Launch 🚀',
    description:
      "Will's AI Blog officially goes live — AI × 猫舎 × 大阪生活の記録がスタート！",
    category: 'milestone',
    isPublic: true,
  },
  {
    id: 'evt-002',
    date: '2026-03-25',
    title: 'ブログ更新予定',
    description:
      'OpenClaw マルチAIアーキテクチャについての技術記事を公開予定。',
    category: 'blog',
    isPublic: true,
  },
  {
    id: 'evt-003',
    date: '2026-04-01',
    title: 'AI研修 無料セミナー',
    description:
      '中小企業向け AI 導入のファーストステップ — オンライン開催、参加無料。',
    category: 'event',
    isPublic: true,
  },
  {
    id: 'evt-004',
    date: '2026-04-05',
    title: 'Instagram 投稿キャンペーン',
    description:
      'サイベリアン × AI の日常をシェア！ #FuluckCattery キャンペーン開始。',
    category: 'event',
    isPublic: true,
  },
  {
    id: 'evt-005',
    date: '2026-04-10',
    title: '新しいAIツールレビュー',
    description:
      '最新の AI コーディングアシスタントを比較レビュー。実務での使い勝手を検証。',
    category: 'blog',
    isPublic: true,
  },
  {
    id: 'evt-006',
    date: '2026-04-15',
    title: 'DeepSeek V3 活用ガイド公開',
    description:
      'DeepSeek V3 の実践的な活用方法をブログで詳解。プロンプトテンプレート付き。',
    category: 'blog',
    isPublic: true,
  },
  {
    id: 'evt-007',
    date: '2026-04-20',
    title: 'AI × 猫舎 運営レポート',
    description:
      'AI を活用した猫舎運営の効率化事例をまとめた月次レポートを公開。',
    category: 'milestone',
    isPublic: true,
  },
  {
    id: 'evt-008',
    date: '2026-04-25',
    title: 'システムメンテナンス',
    description: 'ブログ基盤の定期メンテナンス。一時的にアクセスが不安定になる場合があります。',
    category: 'maintenance',
    isPublic: true,
  },
  {
    id: 'evt-009',
    date: '2026-05-01',
    title: 'OpenClaw 導入ガイド',
    description:
      'マルチ AI エージェント基盤 OpenClaw のセットアップから運用までを解説。',
    category: 'blog',
    isPublic: true,
  },
  {
    id: 'evt-010',
    date: '2026-05-10',
    title: 'AI ワークショップ in 大阪',
    description:
      '大阪市内で対面 AI ワークショップ開催予定。ハンズオン形式、少人数制。',
    category: 'event',
    isPublic: true,
  },
];
