import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export async function GET(req) {
    const prisma = new PrismaClient();

    try {

        const url = new URL(req.url, `http://${req.headers.host}`);
        const companyId = url.searchParams.get("companyId");
        const row = url.searchParams.get("row");

        if (!companyId || !row) {
            return NextResponse.json(
                { error: "companyId and row are required" },
                { status: 400 }
            );
        }

        const result = await prisma.bentos.findMany({
            where: {
                company_id: parseInt(companyId, 10),
                row: parseInt(row, 10),
            },
            orderBy: {
                id: "asc",
            },
        });
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        console.error("データ取得中にエラーが発生しました:", error);
        return NextResponse.json(
            {
                error: "データ取得中にエラーが発生しました",
                details: error.message,
            },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}
