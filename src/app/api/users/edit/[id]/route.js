import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Supabaseクライアントのインスタンス化
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// GET メソッド - 弁当データを取得
export async function GET(req, { params }) {
    // Await params before using its properties
    const { id } = await params; // IDはURLパラメータから取得

    try {
        // Supabaseでデータを取得
        const { data, error } = await supabase
            .from('Bentos')
            .select('*')
            .eq('id', id)
            .single(); // 結果が1件のみの場合はsingle()を使用

        if (error || !data) {
            return NextResponse.json({ error: '弁当データが見つかりません' }, { status: 404 });
        }

        // データが存在する場合
        return NextResponse.json({
            tradingCompany: data.trading_company,
            productName: data.product_name,
            price: data.price,
            row: data.row,
            barcode: data.barcode,
        }, { status: 200 });

    } catch (error) {
        console.error('データ取得中にエラーが発生しました:', error);
        return NextResponse.json({ error: 'データ取得中にエラーが発生しました', details: error.message }, { status: 500 });
    }
}

export async function PUT(req, { params }) {
    // Await params before using its properties
    const { id } = await params; // IDはURLパラメータから取得

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
