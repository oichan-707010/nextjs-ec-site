import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";
import bcrypt from "bcrypt";
import { AUTH_TOKEN, getAuthUser, type AuthUser } from "@/lib/auth";
import { generateToken } from "@/lib/jwt";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    if (!name?.trim() || !email?.trim() || !password?.trim()) {
      return NextResponse.json(
        { message: "すべての項目を入力してください。" },
        { status: 400 },
      );
    }

    const emailPattern = /^[a-zA-Z0-9.]+@[a-zA-Z0-9.]+$/;
    if (!emailPattern.test(email)) {
      return NextResponse.json(
        { message: "正しいメールアドレスの形式で入力してください。" },
        { status: 400 },
      );
    }

    const existingUser = await executeQuery<{ count: number }>(
      "SELECT COUNT(*) AS count FROM users WHERE email = ?",
      [email],
    );
    if (existingUser[0]?.count > 0) {
      return NextResponse.json(
        { message: "このメールアドレスは既に登録されています。" },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: "パスワードは8文字以上で入力してください。" },
        { status: 400 },
      );
    }

    const hashed = await bcrypt.hash(password, 10);

    await executeQuery(
      `
      INSERT INTO users (name, email, password, is_admin, enabled)
      VALUES (?, ?, ?, false, true);
      `,
      [name, email, hashed],
    );

    return NextResponse.json({ message: "会員登録が完了しました。" });
  } catch (err) {
    console.error("会員登録エラー：", err);
    return NextResponse.json(
      { message: "サーバーエラーが発生しました。" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user: AuthUser | null = await getAuthUser();
    if (!user) {
      return NextResponse.json(
        { message: "ログインしてください。" },
        { status: 401 },
      );
    }

    const { name, email } = await request.json();

    if (!name?.trim() || !email?.trim()) {
      return NextResponse.json(
        { message: "全ての項目を入力してください。" },
        { status: 400 },
      );
    }

    const emailPattern = /^[a-zA-Z0-9.]+@[a-zA-Z0-9.]+$/;
    if (!emailPattern.test(email)) {
      return NextResponse.json(
        { message: "正しいメールアドレスの形式で入力してください。" },
        { status: 400 },
      );
    }

    const existingUser = await executeQuery<{ count: number }>(
      `SELECT COUNT(*) AS count FROM users WHERE email = ? AND id != ?`,
      [email, user.userId],
    );
    if (existingUser[0]?.count > 0) {
      return NextResponse.json(
        { message: "このメールアドレスは既に使用されています。" },
        { status: 400 },
      );
    }

    await executeQuery(`UPDATE users SET name = ?, email = ? WHERE id = ?;`, [
      name,
      email,
      user.userId,
    ]);

    const newToken = await generateToken({
      userId: user.userId,
      name,
      email,
      isAdmin: user.isAdmin,
    });

    const response = NextResponse.json({ message: "会員情報を編集しました。" });

    response.cookies.set({
      name: AUTH_TOKEN,
      value: newToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      // Stripe決済後のリダイレクト（別サイトからの遷移）でもログイン状態を維持するため lax にする
      sameSite: "lax",
      maxAge: 60 * 60,
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("会員登録更新エラー：", err);
    return NextResponse.json(
      { message: "サーバーエラーが発生しました。" },
      { status: 500 },
    );
  }
}
