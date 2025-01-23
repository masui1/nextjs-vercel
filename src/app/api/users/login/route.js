import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';

// Supabaseクライアントのインスタンス化
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// **POST**: ログイン認証
export async function POST(req) {
  try {
    const { username, password } = await req.json();

    const { data: user, error } = await supabase
      .from('Users')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !user) {
      return NextResponse.json(
        { error: 'ユーザーが見つかりません' },
        { status: 404 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'パスワードが正しくありません。' },
        { status: 401 }
      );
    }

    const response = NextResponse.json(
      { message: 'ログイン成功', user },
      { status: 200 }
    );

    response.cookies.set('user_id', user.id.toString(), { httpOnly: true });

    return response;
  } catch (error) {
    console.error('ログイン中にエラーが発生しました:', error);
    return NextResponse.json(
      {
        error: 'ログイン中にエラーが発生しました',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
