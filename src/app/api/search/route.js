import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";

    try {
        const bentos = await prisma.bentos.findMany({
            where: {
                product_name: {
                    contains: q,
                    mode: "insensitive",
                },
            },
        });

        return new Response(JSON.stringify(bentos), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("検索中にエラーが発生しました:", error);
        return new Response(
            JSON.stringify({
                error: "検索中にエラーが発生しました",
                details: error.message,
            }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}
