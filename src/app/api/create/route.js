import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

// **POST**: データ登録
export async function POST(req) {
    try {
        const body = await req.json();
        const { tradingCompany, lostProduct, datetimeEnd, price } = body;
        
        const newBento = await prisma.bento.create({
          data: {
            tradingCompany,
            lostProduct,
            datetimeEnd: new Date(datetimeEnd),
            price: parseInt(price, 10),
          },
        });
     
        return NextResponse.json(newBento, { status: 201 });
     } catch (error) {
        console.error('データ登録中にエラーが発生しました:', error);
        console.error('詳細:', error.stack);
        return NextResponse.json({ error: 'データ登録中にエラーが発生しました', details: error.message }, { status: 500 });
     }
}
