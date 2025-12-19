import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// サーバー専用キーでクライアント作成（RLS 無効）
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const body = await req.json();
    const { tradingCompany, productName, price, row, barcode, companyId, img } = body;

    // 入力チェック
    if (!productName || !tradingCompany || !price || !row) {
      return NextResponse.json({ error: '必要なデータが不足しています' }, { status: 400 });
    }

    // 1. MasterBentos に存在するか確認
    const { data: masterData } = await supabase
      .from('MasterBentos')
      .select('*')
      .eq('product_name', productName)
      .eq('trading_company', tradingCompany)
      .maybeSingle();

    let finalImg = img;

    // 2. 存在しなければ MasterBentos に登録
    if (!masterData) {
      if (!img) {
        return NextResponse.json({ error: '新規商品の場合は画像が必須' }, { status: 400 });
      }

      const masterInsertData = {
        trading_company: tradingCompany,
        product_name: productName,
        price: Number(price),
        row: Number(row),
        img,
      };

      const { error: insertMasterError } = await supabase
        .from('MasterBentos')
        .insert([masterInsertData]);

      if (insertMasterError) {
        return NextResponse.json({ error: 'MasterBentos 登録失敗', details: insertMasterError.message }, { status: 500 });
      }
    } else {
      // 画像がまだない場合、送信された img があれば更新
      if (!masterData.img && img) {
        const { error: updateError } = await supabase
          .from('MasterBentos')
          .update({ img })
          .eq('id', masterData.id);

        if (updateError) {
          return NextResponse.json({ error: 'MasterBentos 画像更新失敗', details: updateError.message }, { status: 500 });
        }
        finalImg = img;
      } else {
        finalImg = masterData.img || img;
      }
    }

    // 3. Bentos に登録
    const { error: insertBentoError } = await supabase
      .from('Bentos')
      .insert([{
        trading_company: tradingCompany,
        product_name: productName,
        price: Number(price),
        row: Number(row),
        barcode,
        company_id: companyId,
        img: finalImg
    }]);

    if (insertBentoError) {
      return NextResponse.json({ error: 'Bentos 登録失敗', details: insertBentoError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 201 });

  } catch (error) {
    return NextResponse.json({ error:'サーバーエラー', details:error.message }, { status:500 });
  }
}
