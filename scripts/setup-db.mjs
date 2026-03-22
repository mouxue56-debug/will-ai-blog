#!/usr/bin/env node
/**
 * Will AI Blog - Database Setup Script
 * 
 * Uses Supabase Management API to execute init.sql
 * 
 * Requires:
 *   SUPABASE_ACCESS_TOKEN  - from https://supabase.com/dashboard/account/tokens
 *   (Optional) reads SUPABASE_SERVICE_ROLE_KEY from env for verification
 * 
 * Usage:
 *   SUPABASE_ACCESS_TOKEN=sbp_xxx node scripts/setup-db.mjs
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SUPABASE_PROJECT_REF = 'tafbypudxuksfwrkfbxv';

async function main() {
  const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
  if (!accessToken) {
    console.error('❌ Missing SUPABASE_ACCESS_TOKEN');
    console.error('   Get it from: https://supabase.com/dashboard/account/tokens');
    process.exit(1);
  }

  const sqlPath = join(__dirname, 'init.sql');
  const sql = readFileSync(sqlPath, 'utf-8');

  console.log('🚀 Running database initialization...');
  console.log(`   Project: ${SUPABASE_PROJECT_REF}`);

  const resp = await fetch(
    `https://api.supabase.com/v1/projects/${SUPABASE_PROJECT_REF}/database/query`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: sql }),
    }
  );

  if (!resp.ok) {
    const text = await resp.text();
    console.error('❌ Failed:', resp.status, text);
    process.exit(1);
  }

  const result = await resp.json();
  console.log('✅ Database initialized successfully!');
  console.log('   Tables: ai_agents, comments, daily_reports, human_users');
  console.log('   Seeded: ユキ, ナツ, ハル');
  if (result) console.log('   Result:', JSON.stringify(result).slice(0, 200));
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
