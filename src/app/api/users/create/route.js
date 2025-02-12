import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Supabaseクライアントの作成
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// **POST**: データ登録
export async function POST(req) {
  try {
    const body = await req.json();
    const { tradingCompany, productName, price, row, barcode, companyId, img } = body;

    // Supabaseへの挿入クエリ
    const { data, error } = await supabase
      .from('Bentos')
      .insert([
        {
          trading_company: tradingCompany,
          product_name: productName,
          price: parseInt(price, 10),
          row: parseInt(row, 10),
          barcode: barcode,
          company_id: companyId,
          img: img,
        },
      ])
      .select();

    if (error) {
      console.error('データ登録中にエラーが発生しました:', error);
      return NextResponse.json(
        { error: 'データ登録中にエラーが発生しました', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data[0], { status: 201 });
  } catch (error) {
    console.error('サーバーエラーが発生しました:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました', details: error.message },
      { status: 500 }
    );
  }
}
