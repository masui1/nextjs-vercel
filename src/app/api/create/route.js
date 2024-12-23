import { Client } from 'pg'; 
import { NextResponse } from 'next/server';

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

// **POST**: データ登録
export async function POST(req) {
  try {
    const body = await req.json();
    const { tradingCompany, lostProduct, price } = body;

    await client.connect();

    const query = `
      INSERT INTO bentos (tradingCompany, lostProduct, price) 
      VALUES ($1, $2, $3)
      RETURNING *;
    `;

    const values = [tradingCompany, lostProduct, parseInt(price, 10)];
    const res = await client.query(query, values);

    return NextResponse.json(res.rows[0], { status: 201 });
  } catch (error) {
    console.error('データ登録中にエラーが発生しました:', error);
    return NextResponse.json({ error: 'データ登録中にエラーが発生しました', details: error.message }, { status: 500 });
  } finally {
    await client.end();
  }
}
