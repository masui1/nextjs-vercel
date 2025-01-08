import { Client } from 'pg';

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});


let isConnected = false;

async function connectClient() {
  if (!isConnected) {
    await client.connect();
    isConnected = true;
    console.log('Connected to the database');
  }
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || '';

  try {
    await connectClient();

    const query = `SELECT * FROM "Bentos" WHERE product_name ILIKE $1`;
    const values = [`%${q}%`];

    const res = await client.query(query, values);

    return new Response(JSON.stringify(res.rows), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('検索中にエラーが発生しました:', error);
    return new Response(
      JSON.stringify({ error: '検索中にエラーが発生しました', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
