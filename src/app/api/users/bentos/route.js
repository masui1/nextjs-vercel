import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET(req) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const companyId = url.searchParams.get('companyId');
  const row = url.searchParams.get('row');

  if (!companyId || !row) {
    return NextResponse.json(
      { error: 'companyId and row are required' },
      { status: 400 }
    );
  }

  try {
    // Supabaseを使ってデータを取得
    const { data, error } = await supabase
      .from('Bentos')
      .select('*')
      .eq('company_id', companyId)
      .eq('row', parseInt(row, 10))
      .order('id');

    if (error) {
      throw error;
    }

    const itemsToDelete = data.filter(
      (item) => item.is_purchased && item.purchasedDate
    );

    if (itemsToDelete.length > 0) {
      const { error: deleteError } = await supabase
        .from('Bentos')
        .delete()
        .in('id', itemsToDelete.map((item) => item.id));

      if (deleteError) {
        throw deleteError;
      }

      console.log(`Deleted ${itemsToDelete.length} items.`);
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
