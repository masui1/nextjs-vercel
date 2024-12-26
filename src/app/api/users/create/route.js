import { Client } from "pg";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

// **POST**: データ登録
export async function POST(req) {
    // const client = new Client({
    //   connectionString: process.env.DATABASE_URL,
    // });
    const prisma = new PrismaClient();

  try {
    const body = await req.json();
    const { tradingCompany, lostProduct, price, row, barcode, companyId } = body;

    await client.connect();

    // データ登録のクエリ
    const query = `
      INSERT INTO bentos (tradingCompany, lostProduct, price, row, barcode, company_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const values = [
      tradingCompany,
      lostProduct,
      parseInt(price, 10),
      parseInt(row, 10),
      barcode, // バーコードを含める
      companyId,
    ];

    const res = await client.query(query, values);

    return NextResponse.json(res.rows[0], { status: 201 });
  } catch (error) {
    console.error('データ登録中にエラーが発生しました:', error);

    return NextResponse.json(
      { error: 'データ登録中にエラーが発生しました', details: error.message },
      { status: 500 }
    );
  } finally {
    await client.end();
  }
}
