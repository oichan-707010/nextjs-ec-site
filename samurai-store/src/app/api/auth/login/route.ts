import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { executeQuery } from "@/lib/db";
import { generateToken } from "@/lib/jwt";
import { isAdmin } from "@/lib/auth";

const JWT_COOKIE = "authToken";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email?.trim() || !password?.trim()) {
      return NextResponse.json(
        { message: "メールアドレスとパスワードを入力してください。" },
        { status: 400 },
      );
    }

    const users = await executeQuery<{
      id: number;
      name: string;
      email: string;
      password: string;
      is_admin: boolean;
    }>("SELECT * FROM users WHERE email = ? AND enabled = TRUE", [email]);

    const user = users[0];
    if (!user) {
      return NextResponse.json(
        { message: "メールアドレスまたはパスワードが違います。" },
        { status: 401 },
      );
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json(
        { message: "メールアドレスまたはパスワードが違います。" },
        { status: 401 },
      );
    }

    const token = await generateToken({
      userId: user.id,
      name: user.name,
      email: user.email,
      isAdmin: user.is_admin,
    });

    const response = NextResponse.json({
      message: "ログイン成功",
      isAdmin: user.is_admin,
    });
    response.cookies.set({
      name: JWT_COOKIE,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      // Stripe決済後のリダイレクト（別サイトからの遷移）でもログイン状態を維持するため lax にする
      sameSite: "lax",
      maxAge: 60 * 60,
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("ログインAPIエラー：", err);
    return NextResponse.json(
      { message: "サーバーエラーが発生しました。" },
      { status: 500 },
    );
  }
}
