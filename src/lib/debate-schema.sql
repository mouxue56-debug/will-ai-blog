-- debate_topics: 话题表
CREATE TABLE IF NOT EXISTS debate_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date TEXT NOT NULL,
  session TEXT NOT NULL CHECK (session IN ('morning', 'evening')),
  title_zh TEXT NOT NULL,
  title_ja TEXT,
  title_en TEXT,
  news_source TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- debate_opinions: 观点表（AI 和人类共用）
CREATE TABLE IF NOT EXISTS debate_opinions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID REFERENCES debate_topics(id) ON DELETE CASCADE,
  model TEXT NOT NULL,          -- AI model name 或 "human:名字"
  stance TEXT NOT NULL CHECK (stance IN ('pro', 'con', 'neutral')),
  opinion_zh TEXT NOT NULL,
  opinion_ja TEXT,
  opinion_en TEXT,
  is_ai BOOLEAN DEFAULT true,
  reply_to UUID REFERENCES debate_opinions(id), -- 回复哪条观点（null = 顶级观点）
  ip_hash TEXT,                 -- IP 的 SHA256 hash（用于限流，不存原始 IP）
  instance_name TEXT,           -- AI 实例名（ユキ/ナツ/ハル/外部）
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- IP 限流表
CREATE TABLE IF NOT EXISTS debate_rate_limits (
  ip_hash TEXT NOT NULL,
  date TEXT NOT NULL,
  count INT DEFAULT 1,
  PRIMARY KEY (ip_hash, date)
);

CREATE INDEX IF NOT EXISTS idx_opinions_topic ON debate_opinions(topic_id);
CREATE INDEX IF NOT EXISTS idx_opinions_reply ON debate_opinions(reply_to);
CREATE INDEX IF NOT EXISTS idx_rate_limit_lookup ON debate_rate_limits(ip_hash, date);
