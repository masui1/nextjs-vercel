import { Client } from 'pg'; 
import { NextResponse } from 'next/server';

// **POST**: データ登録
export async function POST(req) {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false, // SupabaseでSSL接続を使用する場合
  },
  });

  try {
    const body = await req.json();
    const { tradingCompany, productName, price, row, barcode, companyId, img } = body;

    await client.connect();

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
