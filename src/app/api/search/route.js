import { createClient } from '@supabase/supabase-js';

// Supabaseクライアントのインスタンス化
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.trim() || '';

  try {
    let query = supabase.from('Bentos').select('*');

    if (q) {
      query = query.ilike('product_name', `%${q}%`);
    }

    // クエリを実行
    const { data, error } = await query;

    if (error) {
      console.error('検索中にエラーが発生しました:', error);
      return new Response(
        JSON.stringify({ error: '検索中にエラーが発生しました', details: error.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('検索中にエラーが発生しました:', error);
    return new Response(
      JSON.stringify({ error: '検索中にエラーが発生しました', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
