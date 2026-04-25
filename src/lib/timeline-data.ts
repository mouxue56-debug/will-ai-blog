export interface TimelineEvent {
  date: string;
  title: {
    zh: string;
    ja: string;
    en: string;
  };
  category: 'cattery' | 'tech' | 'ai' | 'life';
  description: {
    zh: string;
    ja: string;
    en: string;
  };
  link?: string;
  tags?: string[];
}

export const timelineEvents: TimelineEvent[] = [
  // Cattery (猫舍)
  {
    date: '2022-01-15',
    title: {
      zh: '福楽キャッテリー注册成立',
      ja: '福楽キャッテリー登記成立',
      en: 'Fukuraku Cattery Registered'
    },
    category: 'cattery',
    description: {
      zh: '大阪市城东区注册成立西伯利亚猫专业繁育猫舍',
      ja: '大阪市城東区でシベリア猫専門ブリーディングキャッテリーを設立',
      en: 'Registered Siberian cat breeding cattery in Chuo-ku, Osaka'
    },
    tags: ['cattery', 'startup']
  },
  {
    date: '2023-06-01',
    title: {
      zh: '获得日本宠物协会认证',
      ja: '日本ペット協会認定取得',
      en: 'Japan Pet Association Certification'
    },
    category: 'cattery',
    description: {
      zh: '成为正规注册猫舍，获得专业认证',
      ja: '正規登録キャッテリーとして認定取得',
      en: 'Became officially registered cattery'
    },
    tags: ['cattery', 'certification']
  },
  {
    date: '2025-12-01',
    title: {
      zh: '荣获全国猫舍排名第一',
      ja: '全国キャッテリーランキング1位',
      en: 'Ranked #1 Cattery Nationwide'
    },
    category: 'cattery',
    description: {
      zh: '福楽キャッテリー在西伯利亚猫繁育领域获得全国第一',
      ja: 'シベリア猫繁殖において全国第一位を獲得',
      en: 'Achieved #1 ranking in Siberian cat breeding nationwide'
    },
    tags: ['cattery', 'achievement']
  },

  // Tech (技术)
  {
    date: '2026-01-10',
    title: {
      zh: '搭建OpenClaw多实例架构',
      ja: 'OpenClawマルチインスタンスアーキテクチャ構築',
      en: 'OpenClaw Multi-Instance Architecture'
    },
    category: 'tech',
    description: {
      zh: '在Mac Mini M4上部署4个OpenClaw实例，实现分工协作',
      ja: 'Mac Mini M4で4つのOpenClawインスタンスを部署',
      en: 'Deployed 4 OpenClaw instances on Mac Mini M4'
    },
    link: '/zh/blog/openclaw-multi-instance',
    tags: ['openclaw', 'architecture']
  },
  {
    date: '2026-02-20',
    title: {
      zh: 'AI Blog网站上线',
      ja: 'AI Blogサイト開設',
      en: 'AI Blog Website Launched'
    },
    category: 'tech',
    description: {
      zh: '使用Next.js 15 + TypeScript + next-intl搭建三语博客',
      ja: 'Next.js 15 + TypeScript + next-intlで三言語ブログを構築',
      en: 'Built trilingual blog with Next.js 15 + TypeScript + next-intl'
    },
    link: '/zh/blog',
    tags: ['nextjs', 'website']
  },

  // AI (人工智能)
  {
    date: '2026-02-15',
    title: {
      zh: '为大阪诊所搭建AI咨询系统',
      ja: '大阪クリニックにAI相談システム構築',
      en: 'AI Clinic Consultation System'
    },
    category: 'ai',
    description: {
      zh: 'LINE Bot + AI，实现多语言自动咨询响应',
      ja: 'LINE Bot + AIで多言語自動相談応答を実現',
      en: 'LINE Bot + AI for multilingual auto-consultation'
    },
    link: '/zh/blog/ai-clinic-case',
    tags: ['ai', 'clinic', 'line']
  },
  {
    date: '2026-03-17',
    title: {
      zh: 'AI视频批量生成实战',
      ja: 'AI動画バッチ生成実践',
      en: 'AI Video Batch Generation'
    },
    category: 'ai',
    description: {
      zh: '用OpenCloud+NotebookLM自动化生成9国语言宣传片',
      ja: 'OpenCloud+NotebookLMで9カ国語プロモ動画自動生成',
      en: 'Automated 9-language promotional videos with OpenCloud+NotebookLM'
    },
    tags: ['ai', 'video', 'automation']
  },
  {
    date: '2026-03-18',
    title: {
      zh: '4个AI助手管理工作流',
      ja: '4つのAIアシスタントで業務管理',
      en: '4 AI Assistants Workflow'
    },
    category: 'ai',
    description: {
      zh: 'ナツ(内容)、ユキ(技术)、ハル(模板)、アキ(外出)分工明确',
      ja: 'ナツ(内容)、ユキ(技術)、ハル(テンプレート)、アキ(外出)の分業',
      en: 'Natsu(content), Yuki(tech), Haru(templates), Aki(mobile)分工'
    },
    link: '/zh/blog/my-ai-workflow',
    tags: ['ai', 'workflow', 'openclaw']
  },

  {
    date: '2026-03-22',
    title: {
      zh: '蜂群引擎 v2.0 诞生',
      ja: 'スウォームエンジン v2.0 誕生',
      en: 'Swarm Engine v2.0 Born'
    },
    category: 'ai',
    description: {
      zh: 'AI 协作开发 AI 工具，Claude Opus 4 主笔 + GPT-5.4 审查，5轮打磨5066行代码',
      ja: 'AIがAIツールを協力開発。Claude Opus 4執筆 + GPT-5.4レビュー、5ラウンドで5066行コード完成',
      en: 'AIs collaborating to build AI tools. Claude Opus 4 writes + GPT-5.4 reviews, 5 rounds producing 5066 lines of code'
    },
    tags: ['ai', 'openclaw', 'swarm'],
    link: '/blog/swarm-v2-birth-story',
  },
  // Life (生活)
  {
    date: '2024-03-01',
    title: {
      zh: '三岁儿子抓娃娃机大奖',
      ja: '3歳児がクレーンゲームで大奖',
      en: '3-Year-Old Wins Claw Machine'
    },
    category: 'life',
    description: {
      zh: '带儿子去游戏中心，花2000日元玩了套餐',
      ja: '家族でゲームセンターへ、2000円で游玩セット',
      en: 'Family game center trip, 2000 yen attraction package'
    },
    link: '/zh/blog/三岁儿子抓日本良心娃娃机大奖随便拿',
    tags: ['family', 'japan']
  },
  {
    date: '2024-10-16',
    title: {
      zh: '大阪高山农场亲子游',
      ja: '大阪高山农场ファミリーンツアー',
      en: 'Osaka Takayama Farm Trip'
    },
    category: 'life',
    description: {
      zh: '挖红薯、捡栗子，体验日本乡村生活',
      ja: 'サツマイモ掘り、クリ拾い、日本の田園生活体験',
      en: 'Sweet potato digging, chestnut picking'
    },
    tags: ['family', 'farm', 'osaka']
  },
  {
    date: '2025-11-20',
    title: {
      zh: '购买比亚迪元Plus',
      ja: '比亚迪元Plus購入',
      en: 'BYD Atto 3 Purchase'
    },
    category: 'life',
    description: {
      zh: '在日本购买第一辆电动汽车',
      ja: '日本で最初の電気自動車を購入',
      en: 'First electric car purchase in Japan'
    },
    tags: ['car', 'byd', 'ev']
  },
  {
    date: '2026-03-21',
    title: {
      zh: 'MacBook Neo开箱',
      ja: 'MacBook Neo開封',
      en: 'MacBook Neo Unboxing'
    },
    category: 'life',
    description: {
      zh: '接入OpenClaw，成为最佳AI工作站',
      ja: 'OpenClawを接入、最強のAIワークステーションに',
      en: 'Integrated with OpenClaw as AI workstation'
    },
    link: '/zh/blog/macbookneo开箱接入openclaw成为最佳ai员工',
    tags: ['macbook', 'openclaw', 'ai']
  },
  {
    date: '2026-03-12',
    title: {
      zh: '大阪樱花季',
      ja: '大阪の桜前線',
      en: 'Osaka Sakura Season'
    },
    category: 'life',
    description: {
      zh: '2026年大阪樱花前线，从街角到大阪城公园',
      ja: '2026年大阪の桜前線、街角から大阪城公園まで',
      en: '2026 Osaka sakura from streets to Osaka Castle'
    },
    link: '/zh/blog/osaka-sakura-2026',
    tags: ['sakura', 'osaka', 'season']
  }
];

export function getEventsByYear(year: number): TimelineEvent[] {
  return timelineEvents.filter(e => e.date.startsWith(String(year)));
}

export function getYears(): number[] {
  const years = new Set(timelineEvents.map(e => parseInt(e.date.split('-')[0])));
  return Array.from(years).sort((a, b) => b - a);
}
