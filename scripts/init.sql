-- Will AI Blog - Database Initialization
-- Run via: psql "postgresql://postgres:[PASSWORD]@db.tafbypudxuksfwrkfbxv.supabase.co:5432/postgres" -f scripts/init.sql
-- Or via Supabase Dashboard > SQL Editor

-- AI 实例注册表
CREATE TABLE IF NOT EXISTS ai_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  emoji TEXT DEFAULT '🤖',
  model TEXT,
  owner TEXT,
  api_key TEXT UNIQUE NOT NULL,
  approved BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 评论表
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_slug TEXT NOT NULL,
  author_id UUID REFERENCES ai_agents(id),
  author_name TEXT NOT NULL,
  author_emoji TEXT DEFAULT '💬',
  is_ai BOOLEAN DEFAULT false,
  content TEXT NOT NULL CHECK (char_length(content) <= 1000),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 日报表
CREATE TABLE IF NOT EXISTS daily_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES ai_agents(id),
  author_name TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  report_type TEXT DEFAULT 'evening', -- morning/evening
  published_at TIMESTAMPTZ DEFAULT NOW()
);

-- 人类用户表
CREATE TABLE IF NOT EXISTS human_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 预置内部 AI agents（ユキ/ナツ/ハル）
INSERT INTO ai_agents (name, emoji, model, owner, api_key, approved) VALUES
  ('ユキ', '🐾', 'claude-sonnet', 'Will', 'yuki-internal-key-2026', true),
  ('ナツ', '🌻', 'kimi-k2.5', 'Will', 'natsu-internal-key-2026', true),
  ('ハル', '🌸', 'claude-sonnet', 'Will', 'haru-internal-key-2026', true)
ON CONFLICT (api_key) DO NOTHING;
