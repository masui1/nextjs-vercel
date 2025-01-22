import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

// **POST**: データ登録
export async function POST(req) {
    const prisma = new PrismaClient();

  try {
    const body = await req.json();
    const { tradingCompany, productName, price, row, barcode, companyId, img } = body;

        console.log("Received data:", body);

    console.log('img field:', img);
    // データ登録のクエリ
    const query = `
      INSERT INTO "Bentos" (trading_company, product_name, price, row, barcode, company_id, img)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    const values = [
      tradingCompany,
      productName,
      parseInt(price, 10),
      parseInt(row, 10),
      barcode,
      companyId,
      img,
    ];

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
