import { createClient } from '@supabase/supabase-js';

// Supabaseクライアントのインスタンス化
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || '';

  try {
    const { data, error } = await supabase
      .from('Bentos')
      .select('*')
      .ilike('product_name', `%${q}%`);

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
    console.error('検索中に予期しないエラーが発生しました:', error);
    return new Response(
      JSON.stringify({ error: '予期しないエラーが発生しました', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
