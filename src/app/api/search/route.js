import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
    if (req.method === 'GET') {
      const { q } = req.query;
  
      try {
        const results = await prisma.bento.findMany({
          where: {
            lostProduct: {
              contains: q,
            },
          },
        });
        res.status(200).json(results);
      } catch (error) {
        console.error('検索中にエラーが発生しました:', error);
        res.status(500).json({ error: '検索中にエラーが発生しました' });
      }
    } else {
      res.status(405).json({ error: 'メソッドが許可されていません' });
    }
  }