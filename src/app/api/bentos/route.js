import { Client } from "pg";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export async function GET(req) {
    // const client = new Client({
    //   connectionString: process.env.DATABASE_URL,
    // });
    const prisma = new PrismaClient();

    try {
        // await client.connect();

        const url = new URL(req.url, `http://${req.headers.host}`);
        const companyId = url.searchParams.get("companyId");
        const row = url.searchParams.get("row");

        if (!companyId || !row) {
            return NextResponse.json(
                { error: "companyId and row are required" },
                { status: 400 }
            );
        }

        //     const query = `
        //   SELECT * FROM bentos
        //   WHERE company_id = $1 AND row = $2
        //   ORDER BY id;
        // `;

        // const result = await client.query(query, [companyId, parseInt(row, 10)]);
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
        console.error("データ取得中にエラーが発生しました:", error.message);
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
