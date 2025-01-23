import supabase from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(req) {
  const userId = req.cookies.get('user_id')?.value;

  if (!userId) {
    return NextResponse.json({ error: '未ログイン' }, { status: 401 });
  }

  try {
    const { data, error } = await supabase
      .from('Users') // Usersテーブルを指定
      .select('id, username') // 必要なカラムだけ取得
      .eq('id', userId) // 条件: idが一致する
      .single(); // 結果が1件だけの場合はsingle()を使用

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

    // パスワードのハッシュ化
    const hashedPassword = await bcrypt.hash(password, 10);

    // SupabaseのINSERTクエリ
    const { data, error } = await supabase
      .from('Users') // Usersテーブルを指定
      .insert({
        username,
        password: hashedPassword,
        createdAt: new Date(), // タイムスタンプの追加
        updatedAt: new Date(),
      })
      .select() // 挿入したデータを取得
      .single(); // 結果が1件だけの場合はsingle()を使用

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
