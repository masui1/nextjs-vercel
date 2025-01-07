import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

// **POST**: データ登録
export async function POST(req) {
    const prisma = new PrismaClient();

    try {
        const body = await req.json();
        const { trading_company, product_name, price, row, company_id } = body;

        console.log("Received data:", body);

        if (!trading_company || !product_name || !price || !row || !company_id) {
            return NextResponse.json(
                { error: '必要なデータが不足しています' },
                { status: 400 }
            );
        }

        if (isNaN(price) || isNaN(row)) {
            return NextResponse.json(
                { error: '価格と行番号は数値でなければなりません' },
                { status: 400 }
            );
        }

        const res = await prisma.bentos.create({
            data: {
                trading_company: trading_company,
                product_name: product_name,
                price: parseInt(price, 10),
                row: parseInt(row, 10),
                company_id: company_id,
            },
        });

        return NextResponse.json(res, { status: 201 });
    } catch (error) {
        console.error('データ登録中にエラーが発生しました:', error);

        return NextResponse.json(
            { error: 'データ登録中にエラーが発生しました', details: error.message },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}
