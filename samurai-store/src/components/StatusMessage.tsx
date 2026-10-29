"use client";

import { useSearchParams } from "next/navigation";

// 会員登録・ログイン・ログアウト・問い合わせ送信後に表示するメッセージ
export default function StatusMessage() {
  const searchParams = useSearchParams();
  const message = searchParams.get("registered")
    ? "会員登録が完了しました。"
    : searchParams.get("logged-in")
      ? "ログインしました。"
      : searchParams.get("logged-out")
        ? "ログアウトしました。"
        : searchParams.get("submitted")
          ? "お問い合わせを送信しました。ご返信までしばらくお待ちください。"
          : null;

  if (!message) return null;

  return (
    <div className="bg-green-100 text-green-800 p-3 text-center shadow-md">
      {message}
    </div>
  );
}
