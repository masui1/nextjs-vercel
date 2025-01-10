import { Pool } from 'pg';
import { NextResponse } from 'next/server';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// GET メソッド - 弁当データを取得
export async function GET(req, context) {
    const { id } = await context.params;

    try {
        const client = await pool.connect();

        const query = 'SELECT * FROM "Bentos" WHERE id = $1';
        const result = await client.query(query, [id]);

        client.release();

        if (result.rows.length === 0) {
            return NextResponse.json({ error: '弁当データが見つかりません' }, { status: 404 });
        }

        return NextResponse.json(result.rows[0], { status: 200 });
    } catch (error) {
        console.error('データ取得中にエラーが発生しました:', error);
        return NextResponse.json({ error: 'データ取得中にエラーが発生しました', details: error.message }, { status: 500 });
    }
}

// PUT メソッド - 弁当データを更新
export async function PUT(req, context) {
    const { id } = await context.params;

    try {
        const body = await req.json();
        const { tradingCompany, productName, price, row } = body;

        // 必須データの検証
        if (!tradingCompany || !productName || !price || !row) {
            return NextResponse.json({ error: '必要なデータが不足しています' }, { status: 400 });
        }

        const client = await pool.connect();

        // データが存在するか確認
        const checkQuery = 'SELECT * FROM "Bentos" WHERE id = $1';
        const checkResult = await client.query(checkQuery, [id]);

        if (checkResult.rows.length === 0) {
            client.release();
            return NextResponse.json({ error: '弁当データが見つかりません' }, { status: 404 });
        }

        // データを更新
        const updateQuery = `
            UPDATE "Bentos"
            SET trading_company = $1, product_name = $2, price = $3, row = $4
            WHERE id = $5
            RETURNING *;
        `;
        const updateResult = await client.query(updateQuery, [tradingCompany, productName, price, row, id]);

        client.release();

        return NextResponse.json(updateResult.rows[0], { status: 200 });
    } catch (error) {
        console.error('データ更新中にエラーが発生しました:', error.stack);
        return NextResponse.json({ error: 'データ更新中にエラーが発生しました', details: error.message }, { status: 500 });
    }
}
