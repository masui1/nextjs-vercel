import supabase from '@/lib/supabase';
import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';

// **POST**: ログイン認証
export async function POST(req) {
  try {
    const { username, password } = await req.json();

    // ユーザーをSupabaseから取得
    const { data: user, error } = await supabase
      .from('Users') // テーブル名を指定
      .select('*')   // 全ての列を選択
      .eq('username', username) // usernameでフィルタリング
      .single();     // 結果が1件のみと想定

    // ユーザーが見つからない場合のエラーハンドリング
    if (error || !user) {
      return NextResponse.json(
        { error: 'ユーザーが見つかりません' },
        { status: 404 }
      );
    }

    // パスワードの検証
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'パスワードが正しくありません。' },
        { status: 401 }
      );
    }

    // ログイン成功時のレスポンス
    const response = NextResponse.json(
      { message: 'ログイン成功', user },
      { status: 200 }
    );

    // ユーザーIDをクッキーに設定
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
