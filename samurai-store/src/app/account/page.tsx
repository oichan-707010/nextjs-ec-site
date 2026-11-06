"use client";

import { useSearchParams } from "next/navigation";
import { useCart } from "@/hooks/useCart";
import { useEffect } from "react";
import Link from "next/link";

export default function AccountPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { clearCart } = useCart();

  useEffect(() => {
    if (sessionId) {
      clearCart();
    }
  }, [sessionId, clearCart]);

  const menuItemStyle =
    "w-full flex items-center px-4 pt-4 border border-gray-300 rounded shadow-lg hover:ring-2 hover:ring-indigo-200 hover:shadow-xl hover:bg-gray-100 dark:hover:text-gray-700";

  const message = searchParams.get("edited")
    ? "会員情報を編集しました。"
    : searchParams.get("password-changed")
      ? "パスワードを変更しました。"
      : null;

  return (
    <>
      {sessionId && (
        <div className="w-full bg-green-100 text-green-800 p-3 text-center shadow-md flex flex-col items-center justify-center mb-6 rounded-md">
          <p className="text-xl font-bold mt-4">ご注文ありがとうございます！</p>
          <p>商品が到着するまでしばらくお待ちください。</p>
        </div>
      )}
      {message && (
        <div className="w-full bg-green-100 text-green-800 p-3 text-center shadow-md flex items-center justify-center">
          {message}
        </div>
      )}
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-center mb-8">マイページ</h1>

        <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          <Link href="/account/edit" className={menuItemStyle}>
            <div className="flex flex-col text-left">
              <h2 className="mt-0 font-medium">会員情報の編集</h2>
              <p className="text-gray-600 dark:text-gray-400">
                氏名やメールアドレスを編集できます
              </p>
            </div>
          </Link>

          <Link href="/account/password" className={menuItemStyle}>
            <div className="flex flex-col text-left">
              <h2 className="mt-0 font-medium">パスワード変更</h2>
              <p className="text-gray-600 dark:text-gray-400">
                パスワードを変更できます
              </p>
            </div>
          </Link>

          <Link href="/account/orders" className={menuItemStyle}>
            <div className="flex flex-col text-left">
              <h2 className="mt-0 font-medium">注文履歴</h2>
              <p className="text-gray-600 dark:text-gray-400">
                注文履歴を確認できます
              </p>
            </div>
          </Link>

          <Link href="/account/favorites" className={menuItemStyle}>
            <div className="flex flex-col text-left">
              <h2 className="mt-0 font-medium">お気に入り商品の確認</h2>
              <p className="text-gray-600 dark:text-gray-400">
                お気に入りの商品を確認できます
              </p>
            </div>
          </Link>

          <form method="POST" action="/api/auth/logout">
            <button type="submit" className={menuItemStyle}>
              <div className="flex flex-col text-left">
                <h2 className="mt-0 font-medium">ログアウト</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  ログアウトします
                </p>
              </div>
            </button>
          </form>
        </div>
      </main>
    </>
  );
}
