import { Client } from 'pg';
import { NextResponse } from 'next/server';

// クライアントのインスタンスをアプリケーション全体で使い回す
let client;

async function getClient() {
  if (!client) {
    client = new Client({
      connectionString: process.env.DATABASE_URL, // .env から接続情報を取得
    });
    await client.connect();
  }
  return client;
}

export async function GET() {
  try {
    console.log('Connecting to the database...');
    const client = await getClient(); // 再利用するクライアントを取得

    console.log('Database connected.');
    const res = await client.query('SELECT * FROM bentos'); // クエリを実行
    console.log('Query result:', res.rows);

    return NextResponse.json(res.rows, { status: 200 });
  } catch (error) {
    console.error('データ取得中にエラーが発生しました:', error);
    return NextResponse.json({ error: 'データ取得中にエラーが発生しました', details: error.message }, { status: 500 });
  }
}
