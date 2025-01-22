import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET メソッド - 弁当データを取得
export async function GET(req, context) {
    const { id } = await context.params;

    try {
        const result = await prisma.bentos.findUnique({
            where: {
                id: parseInt(id, 10),
            },
        });
        console.log(result);

        const query = 'SELECT * FROM "Bentos" WHERE id = $1';
        const result = await client.query(query, [id]);

        client.release();

        if (result.rows.length === 0) {
            return NextResponse.json({ error: '弁当データが見つかりません' }, { status: 404 });
        }

        return NextResponse.json({
            tradingCompany: result.rows[0].trading_company,
            productName: result.rows[0].product_name,
            price: result.rows[0].price,
            row: result.rows[0].row,
            barcode: result.rows[0].barcode,
          }, { status: 200 });
    } catch (error) {
        console.error("データ取得中にエラーが発生しました:", error);
        return NextResponse.json(
            {
                error: "データ取得中にエラーが発生しました",
                details: error.message,
            },
            { status: 500 }
        );
    }
}

// PUT メソッド - 弁当データを更新
export async function PUT(req, context) {
    const { id } = await context.params;

    try {
        const body = await req.json();
<<<<<<< HEAD
        const { trading_company, product_name, price, row } = body;

        // 必須データの検証
        if (!trading_company || !product_name || !price || !row) {
            return NextResponse.json(
                { error: "必要なデータが不足しています" },
                { status: 400 }
            );
=======
        const { tradingCompany, productName, price, row } = body;

        // 必須データの検証
        if (!tradingCompany || !productName || !price || !row) {
            return NextResponse.json({ error: '必要なデータが不足しています' }, { status: 400 });
>>>>>>> 2e401ce1dcb7416d2a7acf8ee39f2ef6167745b5
        }

        const updatedResult = await prisma.bentos.update({
            where: { id: parseInt(id) },
            data: {
                trading_company,
                product_name,
                price: parseInt(price),
                row: parseInt(row),
            },
        });

<<<<<<< HEAD
        return NextResponse.json(updatedResult, { status: 200 });
=======
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
>>>>>>> 2e401ce1dcb7416d2a7acf8ee39f2ef6167745b5
    } catch (error) {
        console.error("データ更新中にエラーが発生しました:", error.stack);
        return NextResponse.json(
            {
                error: "データ更新中にエラーが発生しました",
                details: error.message,
            },
            { status: 500 }
        );
    }
}
