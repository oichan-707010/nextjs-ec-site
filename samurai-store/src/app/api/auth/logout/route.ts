import { NextResponse } from "next/server";

const JWT_COOKIE = "authToken";

export async function POST() {
  try {
    const response = NextResponse.redirect(
      new URL("/?logged-out=1", process.env.BASE_URL),
    );

    response.cookies.delete({
      name: JWT_COOKIE,
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("ログアウトAPIエラー：", err);
    return NextResponse.json(
      { message: "サーバーエラーが発生しました。" },
      { status: 500 },
    );
  }
}
