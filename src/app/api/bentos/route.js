import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Supabaseクライアントのインスタンス化
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET(req) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const companyId = url.searchParams.get('companyId');
    const row = parseInt(url.searchParams.get('row'), 10);

    if (!companyId || !row) {
      return NextResponse.json(
        { error: 'companyId and row are required' },
        { status: 400 }
      );
    }
    try {
    // SupabaseクエリでBentosテーブルからデータを取得
    const { data, error } = await supabase
      .from('Bentos')
      .select('*')
      .eq('company_id', companyId)
      .eq('row', row)
      .order('id');

    if (error) {
      throw error;
    }

    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    console.error('データ取得中にエラーが発生しました:', error);
    return NextResponse.json(
      { error: 'データ取得中にエラーが発生しました', details: error.message },
      { status: 500 }
    );
  }
}
