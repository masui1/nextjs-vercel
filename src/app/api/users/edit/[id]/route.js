import supabase from '@/lib/supabase';
import { NextResponse } from 'next/server';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

export async function PUT(req, context) {
    const { id } = context.params; // context.paramsからIDを取得

    try {
        const { tradingCompany, productName, price, row } = await req.json();

        // 必須データの検証
        if (!tradingCompany || !productName || !price || !row) {
            return NextResponse.json({ error: '必要なデータが不足しています' }, { status: 400 });
        }

        // Supabaseでデータを更新
        const { data, error } = await supabase
            .from('Bentos') // テーブル名
            .update({
                trading_company: tradingCompany,
                product_name: productName,
                price: price,
                row: row,
                updated_at: new Date(), // 必要に応じて更新日時を追跡
            })
            .eq('id', id) // 条件を指定
            .select() // 更新後のデータを取得
            .single(); // 結果が1件のみの場合はsingle()を使用

        if (error || !data) {
            return NextResponse.json(
                { error: '弁当データの更新中にエラーが発生しました' },
                { status: 500 }
            );
        }

        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error('データ更新中にエラーが発生しました:', error);
        return NextResponse.json(
            { error: 'データ更新中にエラーが発生しました', details: error.message },
            { status: 500 }
        );
    }
}
