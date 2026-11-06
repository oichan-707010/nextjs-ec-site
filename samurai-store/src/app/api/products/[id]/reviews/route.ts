import { getAuthUser, type AuthUser } from "@/lib/auth";
import { executeQuery } from "@/lib/db";
import { type ReviewData } from "@/types/review";
import { NextRequest, NextResponse } from "next/server";

type Review = ReviewData;

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const productId = parseInt(id, 10);

  try {
    const { searchParams } = new URL(request.url);

    let page = Number(searchParams.get("page")) || 1;
    const perPage = 10;
    page = Math.max(1, Math.min(page, 1000));

    const offset = (page - 1) * perPage;

    const [reviews, totalItemsResult] = await Promise.all([
      executeQuery<Review[]>(
        `
        SELECT
        r.id, r.product_id, r.user_id, r.score, r.content, r.created_at, u.name AS user_name 
        FROM reviews AS r 
        JOIN users AS u ON r.user_id = u.id 
        WHERE r.product_id = ?
        ORDER BY r.created_at DESC
        LIMIT ? 
        OFFSET ? 
        ;`,
        [productId, perPage, offset],
      ),

      executeQuery<{ count: number; review_avg: number }>(
        `
        SELECT 
        COUNT(*) AS count, 
        COALESCE(ROUND(AVG(score), 1), 0) AS review_avg 
        FROM reviews 
        WHERE product_id = ? 
        ;`,
        [productId],
      ),
    ]);

    const review_avg = Number(totalItemsResult[0].review_avg) || 0;
    const totalItems = Number(totalItemsResult[0].count) || 0;

    const totalPages = Math.max(1, Math.ceil(totalItems / perPage));

    return NextResponse.json({
      reviews,
      review_avg,
      pagination: { currentPage: page, perPage, totalItems, totalPages },
    });
  } catch (err) {
    console.error("レビュー取得エラー：", err);
    return NextResponse.json(
      { message: "サーバーエラーが発生しました。" },
      { status: 500 },
    );
  }
}

export async function POST(
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

    const body = await request.json();
    const score = Number(body.rating);
    const content = body.content?.toString().trim() || "";

    if (isNaN(score) || !content) {
      return NextResponse.json(
        { message: "必須項目が不足しています。" },
        { status: 400 },
      );
    }

    await executeQuery(
      `
      INSERT INTO reviews (product_id, user_id, score, content) 
      VALUES (?, ?, ?, ?);
      `,
      [productId, user.userId, score, content],
    );

    return NextResponse.json(
      { message: "レビューを登録しました。" },
      { status: 201 },
    );
  } catch (err) {
    console.error("レビュー登録エラー：", err);
    return NextResponse.json(
      {
        message: "サーバーエラーが発生しました。",
      },
      { status: 500 },
    );
  }
}
