import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET メソッド　- 弁当データを取得
export async function GET(req, context) {
    const { id } = await context.params;

    try {
        const client = await pool.connect();
        const query = 'SELECT * FROM "Bentos" WHERE id = $1';
        const result = await client.query(query, [id]);

        client.release();

        if (result.rows.length === 0) {
            return new Response(JSON.stringify({ error: '弁当データが見つかりません' }), { status: 404 });
        }

        return new Response(JSON.stringify(result), { status: 200 });
    } catch (error) {
        console.error("Error fetching data:", error);
        return new Response(
            JSON.stringify({ error: "データ取得中にエラーが発生しました" }),
            { status: 500 }
        );
    }
}

// PUT メソッド - 在庫を更新
export async function PUT(req, context) {
    const { id } = await context.params;

    try {
        const body = await req.json();
        const { is_purchased } = body;

        if (typeof is_purchased !== "boolean") {
            return new Response(
                JSON.stringify({
                    error: "is_purchased is required and must be a boolean",
                }),
                { status: 400 }
            );
        }

        const bento = await prisma.bentos.findUnique({
            where: { id: parseInt(id, 10) },
        });

        if (!bento) {
            return new Response(
                JSON.stringify({ error: "更新対象の弁当が見つかりません" }),
                { status: 404 }
            );
        }

        const updatedBento = await prisma.bentos.update({
            where: { id: parseInt(id, 10) },
            data: {
                is_purchased,
                purchasedDate: is_purchased ? new Date() : null,
            },
        });

        return new Response(JSON.stringify(updatedBento), { status: 200 });
    } catch (error) {
        console.error("Error while updating data:", error);
        return new Response(
            JSON.stringify({
                error: "Internal server error",
                details: error.message || "No additional details available",
            }),
            { status: 500 }
        );
    }

    const client = await pool.connect();

    const checkQuery = 'SELECT * FROM "Bentos" WHERE id = $1';
    const checkResult = await client.query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      client.release();
      return new Response(JSON.stringify({ error: 'Bento not found' }), { status: 404 });
    }

        // データを更新
        const updateQuery = `
            UPDATE "Bentos"
            SET is_purchased = $1, "purchasedDate" = CURRENT_TIMESTAMP
            WHERE id = $2
            RETURNING *;
        `;
        const updateResult = await client.query(updateQuery, [is_purchased, id]);

    client.release();

    return new Response(JSON.stringify(updateResult.rows[0]), { status: 200 });
}
