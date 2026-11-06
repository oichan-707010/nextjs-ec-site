import { unstable_rethrow } from "next/navigation";
import { executeQuery } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { name, email, message } = await request.json();

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json(
        { message: "全ての項目を入力してください。" },
        { status: 400 },
      );
    }

    await executeQuery(
      `
      INSERT INTO inquiries (name, email, message) VALUES (?, ?, ?);
      `,
      [name, email, message],
    );

    return NextResponse.json(
      {
        message: "お問い合わせ内容の送信が完了しました。",
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("お問い合わせ送信エラー：", err);
    return NextResponse.json(
      { message: "サーバーエラーが発生しました。" },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const inquiries = await executeQuery(
      `SELECT * FROM inquiries ORDER BY created_at DESC;`,
    );

    return NextResponse.json({ inquiries });
  } catch (err) {
    // ビルド時のプリレンダリング中断などNext.js内部のエラーはNext.jsに処理を任せる
    unstable_rethrow(err);
    console.error("お問い合わせ取得エラー：", err);
    return NextResponse.json(
      {
        message: "サーバーエラーが発生しました。",
      },
      { status: 500 },
    );
  }
}
