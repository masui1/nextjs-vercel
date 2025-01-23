import supabase from '@/lib/supabase';  // Supabaseクライアントをインポート
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const companyId = url.searchParams.get('companyId');
    const row = url.searchParams.get('row');

    if (!companyId || !row) {
      return NextResponse.json(
        { error: 'companyId and row are required' },
        { status: 400 }
      );
    }

    // SupabaseクエリでBentosテーブルからデータを取得
    const { data, error } = await supabase
      .from('Bentos')
      .select('*')
      .eq('company_id', companyId)
      .eq('row', row)
      .order('id');  // idでソート

    if (error) {
      return NextResponse.json(
        { error: 'データ取得中にエラーが発生しました', details: error.message },
        { status: 500 }
      );
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
