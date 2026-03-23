import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://tafbypudxuksfwrkfbxv.supabase.co','sb_secret_w8bw_WmzdtfU_vhBjXb05g_4v4GVHiZ',{auth:{autoRefreshToken:false,persistSession:false}});
const cols = ['id','category','tags','source','author','author_type','ai_model','ai_instance','created_at','locale_primary','title_zh','title_ja','title_en','summary_zh','summary_ja','summary_en','content_zh','content_ja','content_en'];
for (const c of cols) {
  const { error } = await supabase.from('news_items').select(c).limit(1);
  console.log(c, error ? 'NO:' + error.message : 'YES');
}
