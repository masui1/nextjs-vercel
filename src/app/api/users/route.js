import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// **GET**: ユーザー情報取得
export async function GET(req) {
    const userId = req.cookies.get("user_id").value;

    if (!userId) {
        return NextResponse.json({ error: '未ログイン' }, { status: 401 });
    }

    try {
        const query = 'SELECT id, username FROM "Users" WHERE id = $1;';
        const values = [userId];
        const res = await pool.query(query, values);

        if (res.rows.length === 0) {
        return NextResponse.json({ error: 'ユーザーが見つかりません' }, { status: 404 });
        }

            return NextResponse.json({ user: result }, { status: 200 });
        } catch (error) {
            console.error("ユーザー情報の取得中にエラーが発生しました:", error);
            return NextResponse.json(
                {
                    error: "ユーザー情報の取得中にエラーが発生しました",
                    details: error.message,
                },
                { status: 500 }
            );
        }
}

export async function POST(req) {
    try {
        const body = await req.json();
        console.log(body);
        const { username, password } = body;

        if (!username || !password) {
            return NextResponse.json(
                { error: "ユーザー名とパスワードは必須です" },
                { status: 400 }
            );
        }

        // パスワードのハッシュ化
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log(hashedPassword);
        const result = await prisma.users.create({
            data: {
                username: username,
                password: hashedPassword,
            },
        });

        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        console.error("データ登録中にエラーが発生しました:", error);
        return NextResponse.json(
            { error: "登録処理中にエラーが発生しました" },
            { status: 500 }
        );
    }

    // パスワードのハッシュ化
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `
      INSERT INTO "Users" (username, password, "createdAt", "updatedAt")
      VALUES ($1, $2, NOW(), NOW())
      RETURNING *;
    `;

    const values = [username, hashedPassword];
    const res = await pool.query(query, values);

    return NextResponse.json(res.rows[0], { status: 201 });
}
