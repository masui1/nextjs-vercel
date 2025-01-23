import { createClient } from '@supabase/supabase-js';

// Supabaseクライアントのインスタンス化
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || ''; // クエリ文字列を取得

  try {
    // Supabaseクエリで検索
    const { data, error } = await supabase
      .from('Bentos') // Supabaseのテーブル名
      .select('*')    // 全てのカラムを選択
      .ilike('product_name', `%${q}%`); // ILIKEクエリで部分一致検索

    // エラー処理
    if (error) {
      console.error('検索中にエラーが発生しました:', error);
      return new Response(
        JSON.stringify({ error: '検索中にエラーが発生しました', details: error.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 成功時のレスポンス
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('検索中に予期しないエラーが発生しました:', error);
    return new Response(
      JSON.stringify({ error: '予期しないエラーが発生しました', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
