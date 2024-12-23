import { Client } from 'pg';
import { NextResponse } from 'next/server';

export async function GET(req) {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();

    const url = new URL(req.url, `http://${req.headers.host}`);
    const companyId = url.searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json({ error: 'companyId is required' }, { status: 400 });
    }

    const query = `
      SELECT * FROM bentos
      WHERE company_id = $1
      ORDER BY row;
    `;

    const result = await client.query(query, [companyId]);

    return NextResponse.json(result.rows, { status: 200 });
  } catch (error) {
    console.error('データ取得中にエラーが発生しました:', error);
    return NextResponse.json(
      { error: 'データ取得中にエラーが発生しました', details: error.message },
      { status: 500 }
    );
  } finally {
    await client.end();
  }
}
