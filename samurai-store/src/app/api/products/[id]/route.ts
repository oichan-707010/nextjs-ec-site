import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { writeFile, rm } from "fs/promises";
import { executeQuery } from "@/lib/db";
import { type ProductData } from "@/types/product";
import { isAdmin } from "@/lib/auth";

type Product = ProductData;

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  const productId = parseInt(id, 10);

  try {
    const result = await executeQuery<Product>(
      "SELECT * FROM products WHERE id = ?;",
      [productId],
    );

    if (result.length === 0) {
      return NextResponse.json(
        { message: "商品が見つかりませんでした。" },
        { status: 404 },
      );
    }

    return NextResponse.json(result[0]);
  } catch (err) {
    console.error("商品取得エラー：", err);
    return NextResponse.json(
      { message: "サーバーエラーが発生しました。" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  const productId = parseInt(id, 10);

  try {
    // 管理者以外は商品を編集できない
    if (!(await isAdmin())) {
      return NextResponse.json(
        { message: "権限がありません。" },
        { status: 403 },
      );
    }

    const existing = await executeQuery<Product>(
      "SELECT * FROM products WHERE id = ?;",
      [productId],
    );
    if (existing.length === 0) {
      return NextResponse.json(
        { message: "商品が見つかりませんでした。" },
        { status: 404 },
      );
    }
    const currentProduct = existing[0];

    const formData = await request.formData();
    const name = formData.get("name")?.toString().trim() || "";
    const file = formData.get("imageFile") as File | null;
    const description =
      formData.get("description")?.toString().trim() ||
      "商品の説明がありません。";
    const price = Number(formData.get("price"));
    const stock = Number(formData.get("stock"));
    const isFeatured = formData.get("isFeatured") === "on";

    if (!name?.trim() || isNaN(price) || isNaN(stock)) {
      return NextResponse.json(
        { message: "必須項目が不足しています。" },
        { status: 400 },
      );
    }

    const oldFileName = currentProduct.image_url;
    let newFileName = oldFileName;

    if (file && file.size > 0) {
      const ext = file.name.split(".").pop();
      if (!ext || !["jpg", "jpeg", "png"].includes(ext.toLowerCase())) {
        return NextResponse.json(
          { message: "対応していないファイル形式です。" },
          { status: 400 },
        );
      }

      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 10000);
      newFileName = `${timestamp}_${random}.${ext}`;

      const newFilePath = path.join(
        process.cwd(),
        "public/uploads",
        newFileName,
      );

      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(newFilePath, buffer);

      if (oldFileName) {
        const oldFilePath = path.join(
          process.cwd(),
          "public/uploads",
          oldFileName,
        );
        try {
          await rm(oldFilePath);
        } catch (err) {
          console.error("画像ファイル削除エラー：", err);
        }
      }
    }

    await executeQuery(
      `
      UPDATE products SET name = ?, image_url = ?, description = ?, price = ?, stock = ?, is_featured = ? WHERE id = ?;`,
      [
        name,
        newFileName ?? null,
        description,
        price,
        stock,
        isFeatured ? 1 : 0,
        productId,
      ],
    );

    return NextResponse.json(
      { message: "商品を編集しました。" },
      { status: 200 },
    );
  } catch (err) {
    console.error("商品編集エラー：", err);
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
    // 管理者以外は商品を削除できない
    if (!(await isAdmin())) {
      return NextResponse.json(
        { message: "権限がありません。" },
        { status: 403 },
      );
    }

    const existing = await executeQuery<Product>(
      "SELECT * FROM products WHERE id = ?;",
      [productId],
    );
    if (existing.length === 0) {
      return NextResponse.json(
        { message: "商品が見つかりませんでした。" },
        { status: 404 },
      );
    }
    const currentProduct = existing[0];

    if (currentProduct.image_url) {
      const filePath = path.join(
        process.cwd(),
        "public/uploads",
        currentProduct.image_url,
      );
      try {
        await rm(filePath);
      } catch (err) {
        console.error("画像ファイル削除エラー：", err);
      }
    }

    await executeQuery("DELETE FROM products WHERE id = ?;", [productId]);

    return NextResponse.json(
      { message: "商品を削除しました。" },
      { status: 200 },
    );
  } catch (err) {
    console.error("商品削除エラー：", err);
    return NextResponse.json(
      { message: "サーバーエラーが発生しました。" },
      { status: 500 },
    );
  }
}
