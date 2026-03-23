import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://tafbypudxuksfwrkfbxv.supabase.co";
const SERVICE_KEY = "sb_secret_w8bw_WmzdtfU_vhBjXb05g_4v4GVHiZ";

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function main() {
  // Check if news_items table exists by querying it
  const { data, error } = await supabase
    .from('news_items')
    .select('id')
    .limit(1);
  
  if (error) {
    console.log('news_items table status:', error.message);
    console.log('Error code:', error.code);
  } else {
    console.log('news_items table exists, data:', data);
  }
}

main().catch(console.error);
