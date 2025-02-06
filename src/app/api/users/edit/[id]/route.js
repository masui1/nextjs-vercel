import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Supabaseクライアントのインスタンス化
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// GET メソッド - 弁当データを取得
export async function GET(req, { params }) {
    const { id } = await params;

    try {
        const { data, error } = await supabase
            .from('Bentos')
            .select('*')
            .eq('id', id)
            .is('deleted_at', null)
            .single();
        if (error || !data) {
            return NextResponse.json({ error: '弁当データが見つかりません' }, { status: 404 });
        }

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
    const { id } = await params;

    try {
        const requestBody = await req.json();

        const { tradingCompany, productName, price, row } = requestBody;

        if (!tradingCompany || !productName || !price || !row) {
            console.error('Missing data:', { tradingCompany, productName, price, row });
            return NextResponse.json(
                { error: '必要なデータが不足しています', missing: { tradingCompany, productName, price, row } },
                { status: 400 }
            );
        }

        const { data, error } = await supabase
            .from('Bentos')
            .update({
                trading_company: tradingCompany,
                product_name: productName,
                price: parseFloat(price),
                row: parseInt(row, 10),
            })
            .eq('id', id)
            .select()
            .single();

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

export async function DELETE(req, context) {
    const { params } = context;
    const id = params.id

    try {
        // Bentoデータの取得（カラム名を確認）
        const { data, error } = await supabase
            .from('Bentos')
            .select('img')
            .eq('id', id)
            .single();

        if (error || !data) {
            console.error('Bento not found or already deleted:', error);
            return NextResponse.json({ message: '指定された弁当データは既に削除されています。' }, { status: 404 });
        }

        // 画像が存在する場合、Supabaseのストレージから削除
        if (data.img) {
            const imagePath = data.img;
            const { error: imageError } = await supabase.storage.from('bento-images').remove([imagePath]);

            if (imageError) {
                console.error('画像削除中にエラーが発生しました:', imageError);
                return NextResponse.json({ error: '画像削除中にエラーが発生しました' }, { status: 500 });
            }
        }

        // 完全削除
        const { error: deleteError } = await supabase
            .from('Bentos')
            .delete()
            .eq('id', id);

        if (deleteError) {
            console.error('データ削除中にエラーが発生しました:', deleteError);
            return NextResponse.json({ error: 'データ削除中にエラーが発生しました' }, { status: 500 });
        }

        return NextResponse.json({ message: '弁当データが完全に削除されました' }, { status: 200 });
    } catch (error) {
        console.error('Server error during deletion:', error);
        return NextResponse.json({ error: 'データ削除中にエラーが発生しました', details: error.message }, { status: 500 });
    }
}
