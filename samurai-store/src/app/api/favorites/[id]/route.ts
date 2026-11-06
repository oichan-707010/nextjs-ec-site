import { getAuthUser, type AuthUser } from "@/lib/auth";
import { executeQuery } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const productId = parseInt(id, 10);

  try {
    const user: AuthUser | null = await getAuthUser();
    if (!user) {
      return NextResponse.json(
        { message: "ログインしてください。" },
        { status: 401 },
      );
    }

    const favorites = await executeQuery(
      `SELECT id FROM favorites WHERE product_id = ? AND user_id = ?`,
      [productId, user.userId],
    );

    return NextResponse.json(favorites.length > 0);
  } catch (err) {
    console.error("お気に入り確認エラー：", err);
    return NextResponse.json(
      { message: "サーバーエラーが発生しました。" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const productId = parseInt(id, 10);

  try {
    const user: AuthUser | null = await getAuthUser();
    if (!user) {
      return NextResponse.json(
        { message: "ログインしてください。" },
        { status: 401 },
      );
    }

    await executeQuery(
      `DELETE FROM favorites WHERE product_id = ? AND user_id = ?`,
      [productId, user.userId],
    );

    return NextResponse.json({ message: "お気に入りを解除しました。" });
  } catch (err) {
    console.error("お気に入り削除エラー：", err);
    return NextResponse.json(
      { message: "サーバーエラーが発生しました。" },
      { status: 500 },
    );
  }
}
