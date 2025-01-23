import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Supabaseクライアントのインスタンス化
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET(req, context) {
  const { id } = await context.params;

  try {
    const { data, error } = await supabase
      .from('Bentos')
      .select('*')
      .eq('id', id)
      .single();  // 1件だけ取得

    if (error) {
      return new NextResponse(
        JSON.stringify({ error: 'データ取得中にエラーが発生しました', details: error.message }),
        { status: 500 }
      );
    }

    if (!data) {
      return new NextResponse(JSON.stringify({ error: '弁当データが見つかりません' }), { status: 404 });
    }

    return new NextResponse(JSON.stringify(data), { status: 200 });
  } catch (error) {
    console.error('Error fetching data:', error);
    return new NextResponse(JSON.stringify({ error: 'データ取得中にエラーが発生しました' }), { status: 500 });
  }
}

// PUT メソッド - 在庫を更新
export async function PUT(req, context) {
  const { id } = await context.params;

  try {
    const body = await req.json();
    const { is_purchased } = body;

    if (typeof is_purchased !== 'boolean') {
      return new NextResponse(
        JSON.stringify({ error: 'is_purchased is required and must be a boolean' }),
        { status: 400 }
      );
    }

    // Bentoデータが存在するか確認
    const { data: checkData, error: checkError } = await supabase
      .from('Bentos')
      .select('*')
      .eq('id', id)
      .single();  // 1件だけ取得

    if (checkError || !checkData) {
      return new NextResponse(
        JSON.stringify({ error: 'Bento not found' }),
        { status: 404 }
      );
    }

    // 在庫情報の更新
    const { data: updatedData, error: updateError } = await supabase
      .from('Bentos')
      .update({
        is_purchased,
        purchasedDate: new Date(),
      })
      .eq('id', id)
      .returning('*');  // 更新されたデータを返す

    if (updateError) {
      return new NextResponse(
        JSON.stringify({ error: 'Internal server error', details: updateError.message }),
        { status: 500 }
      );
    }

    return new NextResponse(JSON.stringify(updatedData[0]), { status: 200 });
  } catch (error) {
    console.error('Error updating data:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500 }
    );
  }
}