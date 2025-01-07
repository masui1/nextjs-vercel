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

        if (!result) {
            return NextResponse.json(
                { error: "弁当データが見つかりません" },
                { status: 404 }
            );
        }

        return NextResponse.json(result, { status: 200 });
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
        const { trading_company, product_name, price, row } = body;

        // 必須データの検証
        if (!trading_company || !product_name || !price || !row) {
            return NextResponse.json(
                { error: "必要なデータが不足しています" },
                { status: 400 }
            );
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

        return NextResponse.json(updatedResult, { status: 200 });
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
