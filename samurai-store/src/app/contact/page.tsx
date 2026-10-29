"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ContactPage() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const message = formData.get("message") as string;

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      setErrorMessage(
        "氏名、メールアドレス、お問い合わせ内容を入力してください。",
      );
      return;
    }

    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        body: JSON.stringify({ name, email, message }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (res.ok) {
        router.push("/?submitted=1");
      } else {
        setErrorMessage(data.message || "送信に失敗しました。");
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
      <Link href="/" className="text-indigo-600 hover:underline">
        トップページへ戻る
      </Link>
      <h1 className="text-center my-6">お問い合わせ</h1>
      {errorMessage && (
        <p className="text-red-600 text-center mb-4">{errorMessage}</p>
      )}
      <form
        className="w-full space-y-6 p-8 bg-white shadow-xl rounded-xl"
        onSubmit={handleSubmit}
      >
        <label htmlFor="name" className={labelStyle}>
          氏名<span className={badgeStyle}>必須</span>
        </label>
        <input
          type="text"
          name="name"
          id="name"
          required
          className={inputStyle}
        />

        <label htmlFor="email" className={labelStyle}>
          メールアドレス<span className={badgeStyle}>必須</span>
        </label>
        <input
          type="email"
          name="email"
          id="email"
          required
          className={inputStyle}
        />

        <label htmlFor="message" className={labelStyle}>
          お問い合わせ内容<span className={badgeStyle}>必須</span>
        </label>
        <textarea
          name="message"
          id="message"
          required
          className={inputStyle}
          rows={4}
        ></textarea>

        <button
          type="submit"
          className="w-full mt-6 bg-indigo-500 hover:bg-indigo-600 text-white py-2 rounded-sm font-semibold"
        >
          送信
        </button>
      </form>
    </main>
  );
}
