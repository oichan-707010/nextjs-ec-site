import { getAuthUser, type AuthUser } from "@/lib/auth";
import { NextResponse, NextRequest } from "next/server";
import bcrypt from "bcrypt";
import { executeQuery } from "@/lib/db";

export async function PUT(request: NextRequest) {
  try {
    const user: AuthUser | null = await getAuthUser();
    if (!user) {
      return NextResponse.json(
        { message: "ログインしてください。" },
        { status: 401 },
      );
    }

    const { oldPassword, newPassword } = await request.json();

    if (!oldPassword?.trim() || !newPassword?.trim()) {
      return NextResponse.json(
        { message: "全ての項目を入力してください。" },
        { status: 400 },
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { message: "パスワードは8文字以上で入力してください。" },
        { status: 400 },
      );
    }

    const result = await executeQuery<{ password: string }>(
      `SELECT password FROM users WHERE id = ?`,
      [user.userId],
    );
    const oldHashed = result[0]?.password;
    if (!oldHashed) {
      return NextResponse.json(
        { message: "ユーザー情報が見つかりません。" },
        { status: 404 },
      );
    }

    const passwordMatch = await bcrypt.compare(oldPassword, oldHashed);
    if (!passwordMatch) {
      return NextResponse.json(
        { message: "現在のパスワードが正しくありません。" },
        { status: 400 },
      );
    }

    const newHashed = await bcrypt.hash(newPassword, 10);
    await executeQuery(`UPDATE users SET password = ? WHERE id = ?`, [
      newHashed,
      user.userId,
    ]);

    return NextResponse.json({ message: "パスワードを変更しました。" });
  } catch (err) {
    console.error("パスワード変更エラー：", err);
    return NextResponse.json(
      { message: "サーバーエラーが発生しました。" },
      { status: 500 },
    );
  }
}
