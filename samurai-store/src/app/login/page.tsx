"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email?.trim() || !password?.trim()) {
      setErrorMessage("メールアドレスとパスワードを入力して下さい。");
      return;
    }

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (res.ok) {
        if (data.isAdmin) {
          router.push("/admin/products");
        } else if (redirect) {
          router.replace(redirect);
        } else {
          router.push("/?logged-in=1");
        }
        router.refresh();
      } else {
        setErrorMessage(data.message || "ログインに失敗しました。");
      }
    } catch {
      setErrorMessage("通信エラーが発生しました。");
    }
  };

  const inputStyle =
    "w-full border border-gray-300 px-3 py-2 rounded-xs focus:ring-2 focus:ring-indigo-500 dark:text-black";
  const labelStyle = "block font-bold mb-1 dark:text-black";
  const badgeStyle =
    "ml-2 px-2 py-0.5 bg-red-500 text-white text-xs font-semibold rounded-md";

  return (
    <main className="max-w-md mx-auto py-10">
      <h1 className="text-center mb-6">ログイン</h1>
      {errorMessage && (
        <p className="text-red-600 text-center mb-4">{errorMessage}</p>
      )}
      <form
        onSubmit={handleSubmit}
        className="w-full space-y-6 p-8 bg-white shadow-lg rounded-xl"
      >
        <label className={labelStyle} htmlFor="email">
          メールアドレス<span className={badgeStyle}>必須</span>
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          className={inputStyle}
        />

        <label className={labelStyle} htmlFor="password">
          パスワード<span className={badgeStyle}>必須</span>
        </label>
        <input
          type="password"
          id="password"
          name="password"
          required
          className={inputStyle}
        />

        <button
          type="submit"
          className="w-full mt-6 bg-indigo-500 hover:bg-indigo-600 text-white py-2 rounded-sm font-semibold"
        >
          ログイン
        </button>

        <div className="text-center mt-4">
          <Link href="/register" className="text-indigo-600 hover:underline">
            会員登録はこちら
          </Link>
        </div>
      </form>
    </main>
  );
}
