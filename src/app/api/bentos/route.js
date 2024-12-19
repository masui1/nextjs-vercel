import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const bentos = await prisma.bento.findMany();

    if (!bentos) {
      return NextResponse.json([], { status: 200 });
    }
    
    return NextResponse.json(bentos, { status: 200 });
  } catch (error) {
    console.error('データ取得中にエラーが発生しました:', error);
    console.error('詳細:', error.stack);
    return NextResponse.json({ error: 'データ取得中にエラーが発生しました', details: error.message }, { status: 500 });
  }
}
