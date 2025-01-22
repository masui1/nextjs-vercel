import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    console.log(q);

    try {
        const bentos = await prisma.bentos.findMany({
            where: {
                product_name: {
                    contains: q,
                    mode: "insensitive",
                },
            },
        });

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
