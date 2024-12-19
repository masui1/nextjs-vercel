import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || '';

  try {
    const results = await prisma.bento.findMany({
      where: {
        lostProduct: {
          contains: q,
        },
      },
    });
    return new Response(JSON.stringify(results), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('検索中にエラーが発生しました:', error);
    return new Response(
      JSON.stringify({ error: '検索中にエラーが発生しました' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}