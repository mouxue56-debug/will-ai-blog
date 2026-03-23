import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://tafbypudxuksfwrkfbxv.supabase.co";
const SERVICE_KEY = "sb_secret_w8bw_WmzdtfU_vhBjXb05g_4v4GVHiZ";

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function checkSchema() {
  // Try to insert a test record to verify the schema
  const testRecord = {
    id: 'test-' + Date.now(),
    category: 'ai',
    tags: ['test'],
    source: 'test',
    author: 'Test Author',
    author_type: 'ai',
    ai_model: 'test-model',
    ai_instance: 'test-instance',
    locale_primary: 'zh',
    title_zh: '测试标题',
    title_ja: 'テストタイトル',
    title_en: 'Test Title',
    summary_zh: '测试摘要',
    summary_ja: 'テスト要約',
    summary_en: 'Test Summary',
    content_zh: '测试内容',
    content_ja: 'テスト内容',
    content_en: 'Test Content',
  };
  
  // Insert test record
  const { data: insertData, error: insertError } = await supabase
    .from('news_items')
    .insert(testRecord)
    .select();
  
  if (insertError) {
    console.log('Insert error:', insertError.message);
    console.log('Error details:', insertError.details);
    console.log('Error hint:', insertError.hint);
  } else {
    console.log('Insert successful:', insertData);
    
    // Clean up - delete the test record
    const { error: deleteError } = await supabase
      .from('news_items')
      .delete()
      .eq('id', testRecord.id);
    
    if (deleteError) {
      console.log('Delete error:', deleteError.message);
    } else {
      console.log('Test record deleted successfully');
    }
  }
  
  // Query table structure using information_schema
  const { data: columns, error: columnsError } = await supabase
    .from('information_schema.columns')
    .select('column_name, data_type, is_nullable')
    .eq('table_name', 'news_items')
    .eq('table_schema', 'public')
    .order('ordinal_position');
  
  if (columnsError) {
    console.log('Error querying schema:', columnsError.message);
  } else {
    console.log('\nTable columns:');
    columns.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
  }
}

checkSchema().catch(console.error);
