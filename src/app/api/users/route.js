import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcrypt';
import { NextResponse } from 'next/server';

// Supabaseクライアントを作成
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET(req) {
  const userId = req.cookies.get('user_id')?.value;

  if (!userId) {
    return NextResponse.json({ error: '未ログイン' }, { status: 401 });
  }

  try {
    const { data, error } = await supabase
      .from('Users')
      .select('id, username')
      .eq('id', userId)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'ユーザーが見つかりません' }, { status: 404 });
    }

    return NextResponse.json({ user: data }, { status: 200 });
  } catch (error) {
    console.error('ユーザー情報の取得中にエラーが発生しました:', error);
    return NextResponse.json(
      { error: 'ユーザー情報の取得中にエラーが発生しました', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'ユーザー名とパスワードは必須です' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
      .from('Users')
      .insert({
        username,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .select()
      .single();

    if (error) {
      console.error('ユーザー登録中にエラーが発生しました:', error);
      return NextResponse.json(
        { error: '登録処理中にエラーが発生しました', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('ユーザー登録中にエラーが発生しました:', error);
    return NextResponse.json(
      { error: '登録処理中にエラーが発生しました', details: error.message },
      { status: 500 }
    );
  }
}
