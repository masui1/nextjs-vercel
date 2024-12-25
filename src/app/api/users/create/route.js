import { Client } from 'pg'; 
import { NextResponse } from 'next/server';

// **POST**: データ登録
export async function POST(req) {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    const body = await req.json();
    const { tradingCompany, lostProduct, price, row, companyId } = body;
    await client.connect();

    const query = `
      INSERT INTO bentos (tradingCompany, lostProduct, price, row, company_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;

    const values = [tradingCompany, lostProduct, parseInt(price, 10), parseInt(row, 10), companyId];
    const res = await client.query(query, values);

    return NextResponse.json(res.rows[0], { status: 201 });
  } catch (error) {
    console.error('データ登録中にエラーが発生しました:', error);
    return NextResponse.json({ error: 'データ登録中にエラーが発生しました', details: error.message }, { status: 500 });
  } finally {
    await client.end();
  }
}
