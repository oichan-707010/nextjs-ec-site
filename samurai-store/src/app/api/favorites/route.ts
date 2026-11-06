import { unstable_rethrow } from "next/navigation";
import { getAuthUser, type AuthUser } from "@/lib/auth";
import { executeQuery } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const user: AuthUser | null = await getAuthUser();
    if (!user) {
      return NextResponse.json(
        { message: "ログインしてください。" },
        { status: 401 },
      );
    }

    const favorites = await executeQuery(
      `SELECT f.*, p.name, p.price, p.image_url
      FROM favorites AS f
      JOIN products AS p ON f.product_id = p.id WHERE f.user_id = ?
      ORDER BY f.created_at DESC;`,
      [user.userId],
    );

    return NextResponse.json(favorites);
  } catch (err) {
    // ビルド時のプリレンダリング中断などNext.js内部のエラーはNext.jsに処理を任せる
    unstable_rethrow(err);
    console.error("お気に入り取得エラー：", err);
    return NextResponse.json(
      { message: "サーバーエラーが発生しました。" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user: AuthUser | null = await getAuthUser();
    if (!user) {
      return NextResponse.json(
        { message: "ログインしてください。" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const productId = Number(body.productId);

    if (isNaN(productId)) {
      return NextResponse.json(
        { message: "商品IDが不正です。" },
        { status: 400 },
      );
    }

    await executeQuery(
      `INSERT IGNORE INTO favorites (product_id, user_id) VALUES (?, ?);`,
      [productId, user.userId],
    );

    return NextResponse.json(
      { message: "お気に入りに登録しました。" },
      { status: 201 },
    );
  } catch (err) {
    console.error("お気に入り登録エラー：", err);
    return NextResponse.json(
      { message: "サーバーエラーが発生しました。" },
      { status: 500 },
    );
  }
}
