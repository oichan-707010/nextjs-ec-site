import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { writeFile } from "fs/promises";
import { executeQuery } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { type ProductData } from "@/types/product";

// 商品データの型定義
type Product = Omit<ProductData, "description">;

// 全商品のデータを取得
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // クエリパラメーターからpageとperPageを取得
    let page = Number(searchParams.get("page")) || 1;
    let perPage = Number(searchParams.get("perPage")) || 16;

    // 最大値・最小値を超えている場合は補正
    page = Math.max(1, Math.min(page, 1000));
    perPage = Math.max(1, Math.min(perPage, 100));

    // オフセット(スキップする件数)を計算
    const offset = (page - 1) * perPage;

    // クエリパラメータから並び替え条件を取得
    const sort = searchParams.get("sort") ?? "new";

    // ORDER BY句に指定する条件を決定
    let order = "";
    switch (sort) {
      case "priceAsc":
        order = "ORDER BY p.price ASC";
        break;
      case "new":
      default:
        order = "ORDER BY p.created_at DESC";
        break;
    }

    // クエリパラメータから検索キーワードを取得
    const keyword = searchParams.get("keyword")?.trim() || "";

    // WHERE句のベースを構築
    const where = keyword
      ? "WHERE (p.name LIKE ? OR p.description LIKE ?)"
      : "";

    // WHERE句に指定するパラメータを構築
    const whereParams = keyword ? [`%${keyword}%`, `%${keyword}%`] : [];

    // SQL文に埋め込むパラメータを構築
    const productsParams = [...whereParams, perPage, offset];
    const countParams = [...whereParams];

    // 2つのデータベース操作を並行処理で実施
    const [products, totalItemsResult] = await Promise.all([
      executeQuery<Product[]>(
        `SELECT
        p.id, p.name, p.price, p.stock, p.image_url, p.updated_at,
        COALESCE(ROUND(AVG(r.score), 1), 0) AS review_avg,
        COALESCE(COUNT(r.id), 0) AS review_count
        FROM products AS p
        LEFT JOIN reviews AS r ON p.id = r.product_id
        ${where} 
        GROUP BY p.id, p.name, p.price, p.stock, p.image_url, p.updated_at
        ${order} LIMIT ? OFFSET ?;`,
        productsParams,
      ),
      // フィルタリング条件に合致する商品データの全件数を取得
      executeQuery<{ count: number }>(
        `SELECT COUNT(*) AS count FROM products AS p ${where};`,
        countParams,
      ),
    ]);

    // 全件数を扱いやすい変数に取得
    const totalItems = totalItemsResult[0].count;

    const totalPages = Math.max(1, Math.ceil(totalItems / perPage));

    return NextResponse.json({
      products,
      pagination: { currentPage: page, perPage, totalItems, totalPages },
    });
  } catch (err) {
    console.error("商品取得エラー：", err);
    return NextResponse.json(
      { message: "サーバーエラーが発生しました。" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // 管理者以外は商品を登録できない
    if (!(await isAdmin())) {
      return NextResponse.json(
        { message: "権限がありません。" },
        { status: 403 },
      );
    }

    const formData = await request.formData();
    const name = formData.get("name")?.toString().trim() || "";
    const file = formData.get("imageFile") as File;
    const description =
      formData.get("description")?.toString().trim() ||
      "商品の説明がありません。";
    const price = Number(formData.get("price"));
    const stock = Number(formData.get("stock"));
    const isFeatured = formData.get("isFeatured") === "on";

    if (!name.trim() || !file || isNaN(price) || isNaN(stock)) {
      return NextResponse.json(
        { message: "必須項目が不足しています。" },
        { status: 400 },
      );
    }

    const ext = file.name.split(".").pop();
    if (!ext || !["jpg", "jpeg", "png"].includes(ext.toLowerCase())) {
      return NextResponse.json(
        { message: "対応していないファイル形式です。" },
        { status: 400 },
      );
    }

    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    const fileName = `${timestamp}_${random}.${ext}`;

    const filePath = path.join(process.cwd(), "public/uploads", fileName);

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    await executeQuery(
      `
      INSERT INTO products (name, image_url, description, price, stock, is_featured) VALUES (?, ?, ?, ?, ?, ?);
      `,
      [name, fileName, description, price, stock, isFeatured ? 1 : 0],
    );

    return NextResponse.json(
      { message: "商品を登録しました。" },
      { status: 201 },
    );
  } catch (err) {
    console.error("商品登録エラー：", err);
    return NextResponse.json(
      { message: "サーバーエラーが発生しました。" },
      { status: 500 },
    );
  }
}
