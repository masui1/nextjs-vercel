import { Client } from 'pg';
import { NextResponse } from 'next/server';

let client;

async function getClient() {
  if (!client) {
    client = new Client({
      connectionString: process.env.DATABASE_URL,
    });
    await client.connect();
  }
  return client;
}

export async function GET() {
  try {
    console.log('Connecting to the database...');
    const client = await getClient();

    console.log('Database connected.');
    const res = await client.query('SELECT * FROM bentos');
    console.log('Query result:', res.rows);

    return NextResponse.json(res.rows, { status: 200 });
  } catch (error) {
    console.error('データ取得中にエラーが発生しました:', error);
    return NextResponse.json({ error: 'データ取得中にエラーが発生しました', details: error.message }, { status: 500 });
  }
}
