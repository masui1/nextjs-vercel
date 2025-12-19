import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Supabaseクライアントのインスタンス化
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// 弁当データを取得
export async function GET(req, { params }) {
  const { id } = params;

  const { data, error } = await supabase
    .from('Bentos')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return NextResponse.json(
      { error: '弁当データが見つかりません' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    tradingCompany: data.trading_company,
    productName: data.product_name,
    price: data.price,
    row: data.row,
    barcode: data.barcode,
    img: data.img || '',
  });
}

export async function PUT(req, { params }) {
  try {
    const { id } = params;
    const formData = await req.formData();

    const tradingCompany = formData.get('tradingCompany');
    const productName = formData.get('productName');
    const price = formData.get('price');
    const row = formData.get('row');
    const barcode = formData.get('barcode');
    const image = formData.get('image');

    if (!tradingCompany || !productName || !price || !row) {
      return NextResponse.json(
        { error: '必要なデータが不足しています' },
        { status: 400 }
      );
    }

    let isImageUpdated = false;

    /* 1. 現在の Bento 取得 */
    const { data: currentBento, error: bentoError } = await supabase
      .from('Bentos')
      .select('img')
      .eq('id', id)
      .single();

    if (bentoError || !currentBento) {
      return NextResponse.json(
        { error: '弁当データが見つかりません' },
        { status: 404 }
      );
    }

    let finalImg = currentBento.img;

    /* 2. 画像アップロード */
    if (image && image.size > 0) {
      if (currentBento.img) {
        const oldFileName = currentBento.img.split('/').pop();
        await supabase.storage
          .from('bento-images')
          .remove([oldFileName]);
      }

      const fileName = crypto.randomUUID();

      const { error: uploadError } = await supabase.storage
        .from('bento-images')
        .upload(fileName, image, { upsert: true });

      if (uploadError) {
        return NextResponse.json(
          { error: '画像アップロード失敗' },
          { status: 500 }
        );
      }

      const { data: publicData } = supabase.storage
        .from('bento-images')
        .getPublicUrl(fileName);

      finalImg = publicData.publicUrl;
      isImageUpdated = true;
    }

    /* 3. Bentos 更新 */
    const { error: updateError } = await supabase
      .from('Bentos')
      .update({
        trading_company: tradingCompany,
        product_name: productName,
        price: Number(price),
        row: Number(row),
        barcode,
        img: finalImg,
      })
      .eq('id', id);

    if (updateError) {
      return NextResponse.json(
        { error: '更新失敗', details: updateError.message },
        { status: 500 }
      );
    }

    /* 4. MasterBentos 更新（画像変更時のみ） */
    if (isImageUpdated) {
      await supabase
        .from('MasterBentos')
        .update({ img: finalImg })
        .eq('product_name', productName)
        .eq('trading_company', tradingCompany)
        .select();
    }
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'サーバーエラー', details: error.message },
      { status: 500 }
    );
  }
}

// 弁当データを削除
export async function DELETE(req, { params }) {
  const { id } = params;

  const { data, error } = await supabase
    .from('Bentos')
    .select('img')
    .eq('id', id)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { message: '指定された弁当データは既に削除されています。' },
      { status: 404 }
    );
  }

  if (data.img) {
    const fileName = data.img.split('/').pop();
    await supabase.storage
      .from('bento-images')
      .remove([fileName]);
  }

  const { error: deleteError } = await supabase
    .from('Bentos')
    .delete()
    .eq('id', id);

  if (deleteError) {
    return NextResponse.json(
      { message: '削除に失敗しました' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    message: '弁当データが完全に削除されました',
  });
}
