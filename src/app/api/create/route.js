import { Client } from 'pg'; // pgパッケージをインポート
import { NextResponse } from 'next/server';

// PostgreSQL クライアントを作成
const client = new Client({
  connectionString: process.env.DATABASE_URL, // .env から接続情報を取得
});

// **POST**: データ登録
export async function POST(req) {
  try {
    // リクエストボディを取得
    const body = await req.json();
    const { tradingCompany, lostProduct, datetimeEnd, price } = body;
    
    // データベースに接続
    await client.connect();
    
    // SQL クエリを作成
    const query = `
      INSERT INTO bentos (tradingCompany, lostProduct, datetimeEnd, price) 
      VALUES ($1, $2, $3, $4) 
      RETURNING *;
    `;
    
    // クエリの実行
    const values = [tradingCompany, lostProduct, new Date(datetimeEnd), parseInt(price, 10)];
    const res = await client.query(query, values);
    
    // 成功時のレスポンスを返す
    return NextResponse.json(res.rows[0], { status: 201 });
  } catch (error) {
    // エラーハンドリング
    console.error('データ登録中にエラーが発生しました:', error);
    return NextResponse.json({ error: 'データ登録中にエラーが発生しました', details: error.message }, { status: 500 });
  } finally {
    // データベース接続を終了
    await client.end();
  }
}
