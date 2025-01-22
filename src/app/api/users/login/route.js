import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// **POST**: ログイン認証
export async function POST(req) {
    try {
        const { username, password } = await req.json();

    const query = 'SELECT * FROM "Users" WHERE username = $1;';
    const values = [username];
    const res = await pool.query(query, values);

        if (!user) {
            console.error("User not found", username);
            return NextResponse.json(
                { error: "ユーザーが見つかりません" },
                { status: 404 }
            );
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            console.error("Invalid password for user:", username);
            return NextResponse.json(
                { error: "パスワードが正しくありません。" },
                { status: 401 }
            );
        }

        const response = NextResponse.json(
            { message: "ログイン成功", user },
            { status: 200 }
        );
        response.cookies.set("user_id", user.id.toString(), { httpOnly: true });
        return response;
    } catch (error) {
        console.error("ログイン中にエラーが発生しました:", error);
        return NextResponse.json(
            {
                error: "ログイン中にエラーが発生しました",
                details: error.message,
            },
            { status: 500 }
        );
    }
}
