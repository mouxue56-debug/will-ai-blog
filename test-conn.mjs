import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://tafbypudxuksfwrkfbxv.supabase.co";
const SERVICE_KEY = "sb_secret_w8bw_WmzdtfU_vhBjXb05g_4v4GVHiZ";

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Main test
async function main() {
  console.log('Testing Supabase connection...');
  
  // First, try a simple query to test connection
  const { data: testData, error: testError } = await supabase
    .from('ai_agents')
    .select('id, name')
    .limit(5);
  
  if (testError) {
    console.log('Query error:', testError.message);
  } else {
    console.log('Query successful, ai_agents:', testData);
  }
  
  // Try to execute SQL via rpc - exec_sql
  const sql = "SELECT 1 as test";
  const { data: execData, error: execError } = await supabase.rpc('exec_sql', { query: sql });
  console.log('exec_sql result:', execError ? execError.message : execData);
  
  // Try pg_exec
  const { data: pgExecData, error: pgExecError } = await supabase.rpc('pg_exec', { query: sql });
  console.log('pg_exec result:', pgExecError ? pgExecError.message : pgExecData);
}

main().catch(console.error);
